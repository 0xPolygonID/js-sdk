import { readdir, createReadStream, writeFile } from 'fs-extra'
import { createInterface } from 'readline'
import { join, parse } from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'
import * as path from 'path';
import chokidar from 'chokidar';
import {
	Extractor,
	ExtractorConfig,
	ExtractorResult
} from '@microsoft/api-extractor';

const DOCS_DIR = '../polygonid-js-sdk-website/docs/api';

async function main() {
	const apiExtractorJsonPath: string = path.join(__dirname, '../config/api-extractor.json');

// Load and parse the api-extractor.json file
	const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);

// Invoke API Extractor
	const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
		// Equivalent to the "--local" command-line parameter
		localBuild: true,
		
		// Equivalent to the "--verbose" command-line parameter
		showVerboseMessages: true
	});
	
	if (extractorResult.succeeded) {
		console.log(`API Extractor completed successfully`);
		process.exitCode = 0;
	} else {
		console.error(`API Extractor completed with ${extractorResult.errorCount} errors`
			+ ` and ${extractorResult.warningCount} warnings`);
		process.exitCode = 1;
	}
	const outputFolder = './temp';
	// if (fs.existsSync(DOCS_DIR)) {
	// 	await fs.promises.rm(DOCS_DIR, { recursive: true, force: true });
	// }
	await fs.promises.mkdir(outputFolder, { recursive: true })
	await fs.promises.mkdir(DOCS_DIR, { recursive: true })

	await new Promise((resolve, reject) =>
		exec(`api-documenter markdown -i ./temp -o ${DOCS_DIR}`, (err, stdout, stderr) => {
			console.log(stdout)
			console.error(stderr)
			if (err) {
				reject(err)
			} else {
				resolve('')
			}
		}),
	)

	const docFiles = await readdir(DOCS_DIR)
	for (const docFile of docFiles) {
		try {
			const { name: id, ext } = parse(docFile)
			if (ext !== '.md') {
				continue
			}

			const docPath = join(DOCS_DIR, docFile)
			const input = createReadStream(docPath)
			const output: string[] = []
			const lines = createInterface({
				input,
				crlfDelay: Infinity,
			})

			let title = ''
			lines.on('line', (line) => {
				let skip = false
				if (!title) {
					const titleLine = line.match(/## (.*)/)
					if (titleLine) {
						title = titleLine[1]
					}
				}
				const indexHomeLink = line.match(/\[Home]\(.\/index\.md\)/)
				const homeLink = line.match(/\[Home]\(.\/index\.md\) &gt; (.*)/)
				if (homeLink) {
					line = line.replace('Home', 'Packages')
				}

				if (indexHomeLink) {
					// Skip the breadcrumb for the toplevel index file.
					if (id === 'index') {
						skip = true
					}

					skip = true
				}

				// See issue #4. api-documenter expects \| to escape table
				// column delimiters, but docusaurus uses a markdown processor
				// that doesn't support this. Replace with an escape sequence
				// that renders |.
				if (line.startsWith('|')) {
					line = line.replace(/\\\|/g, '&#124;')
				}

				// MDX cries when you put commects in there :(
				line = replaceAll(line, '<!-- -->', '')

				if (id === 'core') {
					line = line.replace('core package', 'Veramo Core')
				}

				if (!skip) {
					output.push(line)
				}
			})

			await new Promise((resolve) => lines.once('close', resolve))
			input.close()

			const header = ['---', `id: ${id}`, `title: ${title}`, `hide_title: true`, '---']
			let outputString = header.concat(output).join('\n')

			outputString = outputString.replace(/<a\nhref=/g, '<a href=')

			await writeFile(docPath, outputString)
		} catch (err) {
			console.error(`Could not process ${docFile}: ${err}`)
		}
	}
}

function escapeRegExp(string: string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

function replaceAll(str: string, find: string, replace: string) {
	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace)
}

chokidar.watch(path.join(__dirname, '../src/'), {
	ignoreInitial: true,
	usePolling:true,
	persistent:true,
	interval:1000,
}).on('change', async (event, path) => {
	console.log(`${event} - ${path} - present changes, building...`);
	await main();
	console.log('finished building...');
}).on('ready', async (event, path) => {
	// console.log(`${event} - ${path} - present changes, building...`);
	// await main();
	console.log('ready building...');
});
 main();




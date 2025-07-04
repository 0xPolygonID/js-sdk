import { describe, expect, it, beforeEach } from 'vitest';
import { DidResolverStateReadonlyStorage, IStateStorage } from '../../src';
import { DID } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
import nock from 'nock';

describe('resolver readonly storage', () => {
  let stateStorage: IStateStorage;
  const resolverURL = 'http://127.0.0.1:8080';
  const did = DID.parse('did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD');
  const id = DID.idFromDID(did);
  beforeEach(async () => {
    stateStorage = new DidResolverStateReadonlyStorage(resolverURL);
  });

  it('getLatestStateById', async () => {
    nock(resolverURL)
      .get(
        // eslint-disable-next-line @cspell/spellchecker
        '/1.0/identifiers/did%3Apolygonid%3Apolygon%3Aamoy%3A2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD'
      )
      .reply(
        200,
        `{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"@context":["https://www.w3.org/ns/did/v1","https://schema.iden3.io/core/jsonld/auth.jsonld","https://schema.iden3.io/core/jsonld/iden3proofs.jsonld"],"id":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD","verificationMethod":[{"id":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD#state-info","type":"Iden3StateInfo2023","controller":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD","stateContractAddress":"80002:0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124","published":true,"info":{"id":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD","state":"c653768ca443453f44edb819175994199c2e9116c736e8a8833c6c6f921b7b15","replacedByState":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1731649510","replacedAtTimestamp":"0","createdAtBlock":"14445035","replacedAtBlock":"0"},"global":{"root":"ee933d60bda52810ec0ec1d9f2ace8666bb93d273bdf3267e35387e70200d225","replacedByRoot":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1732025639","replacedAtTimestamp":"0","createdAtBlock":"14618802","replacedAtBlock":"0","proof":{"existence":true,"siblings":["3826015977298769540101838990144499890452133101770232358357087074761929045014","864545124412939850004967234483519387099950447738544030237687465186711043817","13384908687828822304051587337770764927533440272811131332236925479201603413779","7008861419840281183040259263097349725975544589604657255528412015559570756430","10196581031452582553409210135952518164800238321459325327163775526579525489706","10847811404722023193836917968795578158377516355689063480344319030883153551997","7501704662566146993443082955484915477984763397289571730014912300112522436190","15319676397008451935308301168627943776087314271828889852225733045012068685123","13580625240484189131905658989056965789342053909035527622054608432235108291371","15701076866894648427718398501239266270187920232235356979681337424723013748037","18391822292664048359198417757393480551710071249895941413402198372170950884043","0","1956510840262628579400226733676154238486255274390348671620337333964042370619","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"type":"Iden3SparseMerkleTreeProof"}}}]},"didResolutionMetadata":{"@context":["https://schema.iden3.io/core/jsonld/resolution.jsonld"],"contentType":"application/did+ld+json","retrieved":"2024-11-19T14:16:48.993960636Z","type":"Iden3ResolutionMetadata"},"didDocumentMetadata":{}}`
      );
    const latestState = await stateStorage.getLatestStateById(id.bigInt());
    expect(latestState).to.be.an('object');
    expect(latestState).to.have.property('id');
  });

  it('getStateInfoByIdAndState', async () => {
    nock(resolverURL)
      .get(
        // eslint-disable-next-line @cspell/spellchecker
        '/1.0/identifiers/did%3Apolygonid%3Apolygon%3Aamoy%3A2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD?state=f71ed95c0cf6a6b2a5ee867acfa0244d90be5bbe08b7805ed0766c7676dae521'
      )
      .reply(
        200,
        `{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"@context":["https://www.w3.org/ns/did/v1","https://schema.iden3.io/core/jsonld/auth.jsonld"],"id":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD","verificationMethod":[{"id":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD#state-info","type":"Iden3StateInfo2023","controller":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD","stateContractAddress":"80002:0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124","published":true,"info":{"id":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD","state":"f71ed95c0cf6a6b2a5ee867acfa0244d90be5bbe08b7805ed0766c7676dae521","replacedByState":"c653768ca443453f44edb819175994199c2e9116c736e8a8833c6c6f921b7b15","createdAtTimestamp":"1731290148","replacedAtTimestamp":"1731649510","createdAtBlock":"14277019","replacedAtBlock":"14445035"}}]},"didResolutionMetadata":{"@context":["https://schema.iden3.io/core/jsonld/resolution.jsonld"],"contentType":"application/did+ld+json","retrieved":"2024-11-19T14:19:45.88049351Z","type":"Iden3ResolutionMetadata"},"didDocumentMetadata":{}}`
      );
    const state = Hash.fromHex('f71ed95c0cf6a6b2a5ee867acfa0244d90be5bbe08b7805ed0766c7676dae521');
    const info = await stateStorage.getStateInfoByIdAndState(id.bigInt(), state.bigInt());
    expect(info).to.be.an('object');
    expect(info).to.have.property('id');
  });

  it('getGISTProof', async () => {
    nock(resolverURL)
      .get(
        // eslint-disable-next-line @cspell/spellchecker
        '/1.0/identifiers/did%3Apolygonid%3Apolygon%3Aamoy%3A2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD'
      )
      .reply(
        200,
        `{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"@context":["https://www.w3.org/ns/did/v1","https://schema.iden3.io/core/jsonld/auth.jsonld","https://schema.iden3.io/core/jsonld/iden3proofs.jsonld"],"id":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD","verificationMethod":[{"id":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD#state-info","type":"Iden3StateInfo2023","controller":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD","stateContractAddress":"80002:0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124","published":true,"info":{"id":"did:polygonid:polygon:amoy:2qV7YACbSYpvuXySSqhBd6E4XAxzLE5kYmPqwxuvwD","state":"c653768ca443453f44edb819175994199c2e9116c736e8a8833c6c6f921b7b15","replacedByState":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1731649510","replacedAtTimestamp":"0","createdAtBlock":"14445035","replacedAtBlock":"0"},"global":{"root":"ee933d60bda52810ec0ec1d9f2ace8666bb93d273bdf3267e35387e70200d225","replacedByRoot":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1732025639","replacedAtTimestamp":"0","createdAtBlock":"14618802","replacedAtBlock":"0","proof":{"existence":true,"siblings":["3826015977298769540101838990144499890452133101770232358357087074761929045014","864545124412939850004967234483519387099950447738544030237687465186711043817","13384908687828822304051587337770764927533440272811131332236925479201603413779","7008861419840281183040259263097349725975544589604657255528412015559570756430","10196581031452582553409210135952518164800238321459325327163775526579525489706","10847811404722023193836917968795578158377516355689063480344319030883153551997","7501704662566146993443082955484915477984763397289571730014912300112522436190","15319676397008451935308301168627943776087314271828889852225733045012068685123","13580625240484189131905658989056965789342053909035527622054608432235108291371","15701076866894648427718398501239266270187920232235356979681337424723013748037","18391822292664048359198417757393480551710071249895941413402198372170950884043","0","1956510840262628579400226733676154238486255274390348671620337333964042370619","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"type":"Iden3SparseMerkleTreeProof"}}}]},"didResolutionMetadata":{"@context":["https://schema.iden3.io/core/jsonld/resolution.jsonld"],"contentType":"application/did+ld+json","retrieved":"2024-11-19T14:21:03.699763379Z","type":"Iden3ResolutionMetadata"},"didDocumentMetadata":{}}`
      );
    const proof = await stateStorage.getGISTProof(id.bigInt());
    expect(proof).to.be.an('object');
    expect(proof).to.have.property('root');
  });

  it('getGISTRootInfo', async () => {
    nock(resolverURL)
      .get(
        // eslint-disable-next-line @cspell/spellchecker
        '/1.0/identifiers/did%3Apolygonid%3Apolygon%3Aamoy%3A2qQ68JkRcf3xrHPQPWZei3YeVzHPP58wYNxx2mEouR?gist=44f40dd34c5b840ef1c55e3805febef589069dab35f8684857ba118778826d1b'
      )
      .reply(
        200,
        `{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"@context":["https://www.w3.org/ns/did/v1","https://schema.iden3.io/core/jsonld/auth.jsonld","https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld","https://schema.iden3.io/core/jsonld/iden3proofs.jsonld"],"id":"did:polygonid:polygon:amoy:2qQ68JkRcf3xrHPQPWZei3YeVzHPP58wYNxx2mEouR","verificationMethod":[{"id":"did:polygonid:polygon:amoy:2qQ68JkRcf3xrHPQPWZei3YeVzHPP58wYNxx2mEouR#ethereum-based-id","type":"EcdsaSecp256k1RecoveryMethod2020","controller":"did:polygonid:polygon:amoy:2qQ68JkRcf3xrHPQPWZei3YeVzHPP58wYNxx2mEouR","blockchainAccountId":"eip155:80002:0x0000000000000000000000000000000000000000"},{"id":"did:polygonid:polygon:amoy:2qQ68JkRcf3xrHPQPWZei3YeVzHPP58wYNxx2mEouR#state-info","type":"Iden3StateInfo2023","controller":"did:polygonid:polygon:amoy:2qQ68JkRcf3xrHPQPWZei3YeVzHPP58wYNxx2mEouR","stateContractAddress":"80002:0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124","published":false,"global":{"root":"44f40dd34c5b840ef1c55e3805febef589069dab35f8684857ba118778826d1b","replacedByRoot":"3b5f3539cde717ce938bd00b4f7a784b4aefae2984159f32bee0a0776faced17","createdAtTimestamp":"1731426304","replacedAtTimestamp":"1731428262","createdAtBlock":"14341077","replacedAtBlock":"14341999","proof":{"existence":false,"node_aux":{"key":"5424242604181359219910817251427599352856385389483201788052737283695935717461","value":"13305818504452416491032560565039465275830378541065338234057147435504045461643"},"siblings":["11567187357410800071496838729962558200936386218406453245287098288579409942927","21708565826827558012547972782187994840017305959939357222545475146300569592548","20656668963473438495005317572456255333784781159711883414223149057323375507122","9463454415850929332605202757208350947637108364995234873515057565486613972386","20707881340476552441807484774425011509880578148799268875254393643680700337476","12942119671133009164144962517576757762818767558063945569766006708064996797022","14607934607045747474427073400481807393581860809438547854169365983430268775041","4052648358316935597838722650953311620373406611387313412439668119581988904719","10644529442945900174310113325130527527492177059519627626594810578238797024981","15330801940444005782796578049286448695515643951700515205216771013317502373040","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"type":"Iden3SparseMerkleTreeProof"}}}]},"didResolutionMetadata":{"@context":["https://schema.iden3.io/core/jsonld/resolution.jsonld"],"contentType":"application/did+ld+json","retrieved":"2024-11-19T14:21:50.433149179Z","type":"Iden3ResolutionMetadata"},"didDocumentMetadata":{}}`
      );
    const root = Hash.fromHex('44f40dd34c5b840ef1c55e3805febef589069dab35f8684857ba118778826d1b');
    const rootInfo = await stateStorage.getGISTRootInfo(root.bigInt(), id.bigInt());
    expect(rootInfo).to.be.an('object');
    expect(rootInfo).to.have.property('root');
  });
});

import { OnChainRevocationStorage } from '../../storage/blockchain/onchain-revocation';
import { DID } from '@iden3/js-iden3-core';
import { VerifiableConstants } from '../../verifiable/constants';
import { isGenesisState } from './utils';
import { newHashFromHex } from '@iden3/js-merkletree';
import { EthStateStorage } from '../../storage/blockchain/state';
import { getChainId } from '../../storage/blockchain';
/**
 * OnChainIssuer is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @public
 * @class OnChainIssuer
 */
export class OnChainResolver {
    /**
     *
     * Creates an instance of OnChainIssuer.
     * @public
     * @param {Array<EthConnectionConfig>} _configs - list of ethereum network connections
     */
    constructor(_configs) {
        this._configs = _configs;
    }
    /**
     * resolve is a method to resolve a credential status from the blockchain.
     *
     * @public
     * @param {CredentialStatus} credentialStatus -  credential status to resolve
     * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
     * @returns `{Promise<RevocationStatus>}`
     */
    async resolve(credentialStatus, credentialStatusResolveOptions) {
        if (!credentialStatusResolveOptions?.issuerDID) {
            throw new Error('IssuerDID is not set in options');
        }
        return this.getRevocationOnChain(credentialStatus, credentialStatusResolveOptions.issuerDID);
    }
    /**
     * Gets partial revocation status info from onchain issuer contract.
     *
     * @param {CredentialStatus} credentialStatus - credential status section of credential
     * @param {DID} issuerDid - issuer did
     * @returns `{Promise<RevocationStatus>}`
     */
    async getRevocationOnChain(credentialStatus, issuer) {
        const { contractAddress, chainId, revocationNonce, stateHex } = this.extractCredentialStatusInfo(credentialStatus);
        if (revocationNonce !== credentialStatus.revocationNonce) {
            throw new Error('revocationNonce does not match');
        }
        const issuerId = DID.idFromDID(issuer);
        let latestIssuerState;
        try {
            const ethStorage = this._getStateStorageForIssuer(issuerId);
            const latestStateInfo = await ethStorage.getLatestStateById(issuerId.bigInt());
            if (!latestStateInfo.state) {
                throw new Error('state contract returned empty state');
            }
            latestIssuerState = latestStateInfo.state;
        }
        catch (e) {
            const errMsg = e?.reason ?? e.message ?? e;
            if (!errMsg.includes(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST)) {
                throw e;
            }
            if (!stateHex) {
                throw new Error('latest state not found and state parameter is not present in credentialStatus.id');
            }
            const stateBigInt = newHashFromHex(stateHex).bigInt();
            if (!isGenesisState(issuer, stateBigInt)) {
                throw new Error(`latest state not found and state parameter ${stateHex} is not genesis state`);
            }
            latestIssuerState = stateBigInt;
        }
        const id = DID.idFromDID(issuer);
        const onChainCaller = this._getOnChainRevocationStorageForIssuer(chainId, contractAddress);
        const revocationStatus = await onChainCaller.getRevocationStatusByIdAndState(id.bigInt(), latestIssuerState, revocationNonce);
        return revocationStatus;
    }
    /**
     * Extract information about credential status
     *
     * @param {credentialStatus} CredentialStatus - credential status
     * @returns {{contractAddress: string, chainId: number, revocationNonce: number, issuer: string;}}
     */
    extractCredentialStatusInfo(credentialStatus) {
        if (!credentialStatus.id) {
            throw new Error('credentialStatus id is empty');
        }
        const idParts = credentialStatus.id.split('/');
        if (idParts.length !== 2) {
            throw new Error('invalid credentialStatus id');
        }
        const idURL = new URL(credentialStatus.id);
        const stateHex = idURL.searchParams.get('state') || '';
        const contractIdentifier = idURL.searchParams.get('contractAddress');
        if (!contractIdentifier) {
            throw new Error('contractAddress not found in credentialStatus.id field');
        }
        const parts = contractIdentifier.split(':');
        if (parts.length != 2) {
            throw new Error('invalid contract address encoding. should be chainId:contractAddress');
        }
        const chainId = parseInt(parts[0], 10);
        const contractAddress = parts[1];
        // if revocationNonce is not present in id as param, then it should be extract from credentialStatus
        const rv = idURL.searchParams.get('revocationNonce') || credentialStatus.revocationNonce;
        if (rv === undefined || rv === null) {
            throw new Error('revocationNonce not found in credentialStatus id field');
        }
        const revocationNonce = typeof rv === 'number' ? rv : parseInt(rv, 10);
        return { contractAddress, chainId, revocationNonce, stateHex };
    }
    networkByChainId(chainId) {
        const network = this._configs.find((c) => c.chainId === chainId);
        if (!network) {
            throw new Error(`chainId "${chainId}" not supported`);
        }
        return network;
    }
    // TODO (illia-korotia): is dirty hack for mock in tests.
    // need to pass to constructor list of state stores not list of network configs
    _getStateStorageForIssuer(issuerId) {
        const issuerChainId = getChainId(DID.blockchainFromId(issuerId), DID.networkIdFromId(issuerId));
        const ethStorage = new EthStateStorage(this.networkByChainId(issuerChainId));
        return ethStorage;
    }
    _getOnChainRevocationStorageForIssuer(chainId, contractAddress) {
        const networkConfig = this.networkByChainId(chainId);
        const onChainCaller = new OnChainRevocationStorage(networkConfig, contractAddress);
        return onChainCaller;
    }
}
//# sourceMappingURL=on-chain-revocation.js.map
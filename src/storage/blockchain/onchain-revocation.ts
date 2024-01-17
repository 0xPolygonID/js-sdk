import { RevocationStatus, Issuer } from '../../verifiable';
import { Contract, JsonRpcProvider, Signer, TransactionReceipt, TransactionRequest } from 'ethers';
import { Proof, NodeAuxJSON, Hash } from '@iden3/js-merkletree';
import { EthConnectionConfig } from './state';
import abi from '../blockchain/abi/CredentialStatusResolver.json';

/**
 * OnChainRevocationStore is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @public
 * @class OnChainIssuer
 */
export class OnChainRevocationStorage {
  private readonly _contract: Contract;
  private readonly _provider: JsonRpcProvider;

  /**
   *
   * Creates an instance of OnChainIssuer.
   * @public
   * @param {string} - onhcain contract address
   * @param {string} - rpc url to connect to the blockchain
   */

  constructor(
    private readonly _config: EthConnectionConfig,
    contractAddress: string,
    private _signer?: Signer
  ) {
    this._provider = new JsonRpcProvider(_config.url);
    let contract = new Contract(contractAddress, abi, this._provider);
    if (this._signer) {
      this._signer = this._signer.connect(this._provider);
      contract = contract.connect(this._signer) as Contract;
    }
    this._contract = contract;
  }

  /**
   * Get revocation status by issuerId, issuerState and nonce from the onchain.
   * @public
   * @returns Promise<RevocationStatus>
   */
  public async getRevocationStatusByIdAndState(
    issuerID: bigint,
    state: bigint,
    nonce: number
  ): Promise<RevocationStatus> {
    const response = await this._contract.getRevocationStatusByIdAndState(issuerID, state, nonce);

    const issuer = OnChainRevocationStorage.convertIssuerInfo(response.issuer);
    const mtp = OnChainRevocationStorage.convertSmtProofToProof(response.mtp);

    return {
      issuer,
      mtp
    };
  }

  /**
   * Get revocation status by nonce from the onchain contract.
   * @public
   * @returns Promise<RevocationStatus>
   */
  public async getRevocationStatus(issuerID: bigint, nonce: number): Promise<RevocationStatus> {
    const response = await this._contract.getRevocationStatus(issuerID, nonce);

    const issuer = OnChainRevocationStorage.convertIssuerInfo(response.issuer);
    const mtp = OnChainRevocationStorage.convertSmtProofToProof(response.mtp);

    return {
      issuer,
      mtp
    };
  }

  public async saveNodes(payload: bigint[][]): Promise<TransactionReceipt> {
    if (!this._signer) {
      throw new Error('No signer provided');
    }
    const feeData = await this._provider.getFeeData();

    const maxFeePerGas = this._config.maxFeePerGas
      ? BigInt(this._config.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = this._config.maxPriorityFeePerGas
      ? BigInt(this._config.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    const gasLimit = await this._contract.saveNodes.estimateGas(payload);
    const txData = await this._contract.saveNodes.populateTransaction(payload);

    const request: TransactionRequest = {
      to: txData.to,
      data: txData.data,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas
    };

    const tx = await this._signer.sendTransaction(request);
    return tx.wait().then((txReceipt) => {
      if (!txReceipt) {
        throw new Error(`transaction: ${tx.hash} failed to mine`);
      }
      const status: number | null = txReceipt.status;
      const txnHash: string = txReceipt.hash;

      if (!status) {
        throw new Error(`transaction: ${txnHash} failed to mine`);
      }

      return txReceipt;
    });
  }

  private static convertIssuerInfo(issuer: bigint[]): Issuer {
    const [state, claimsTreeRoot, revocationTreeRoot, rootOfRoots] = issuer.map((i) =>
      Hash.fromBigInt(i).hex()
    );
    return {
      state,
      claimsTreeRoot,
      revocationTreeRoot,
      rootOfRoots
    };
  }

  private static convertSmtProofToProof(mtp: {
    existence: boolean;
    auxIndex: bigint;
    auxValue: bigint;
    auxExistence: boolean;
    siblings: bigint[];
  }): Proof {
    let nodeAux: NodeAuxJSON | undefined = undefined;
    const siblings = mtp.siblings?.map((s) => s.toString());

    if (mtp.auxExistence) {
      const auxIndex = BigInt(mtp.auxIndex.toString());
      const auxValue = BigInt(mtp.auxValue.toString());
      nodeAux = {
        key: auxIndex.toString(),
        value: auxValue.toString()
      };
    }
    return Proof.fromJSON({
      existence: mtp.existence,
      nodeAux,
      siblings
    });
  }
}

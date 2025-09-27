// Filename: lit-action.ts
// @ts-nocheck
const _litActionCode = async () => {
  try {
    await Lit.Actions.signEcdsa({
      toSign: ethers.utils.arrayify(ethers.utils.sha256(message)),
      publicKey,
      sigName: sigName
    });

    LitActions.setResponse({ response: 'true' });
  } catch (e) {
    LitActions.setResponse({ response: e.message });
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;

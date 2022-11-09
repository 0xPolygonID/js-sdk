import  * as nn from '../src';

//
global.IdenSdk = nn;
const start = () => {
	nn.getIdentityWallet().createIdentity();
};
start();


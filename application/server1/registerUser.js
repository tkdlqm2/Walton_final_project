/*
 * SPDX-License-Identifier: Apache-2.0
 */

// 디비에 저장하는 거


function Register(id, org, admin, orgDepartment, orgMSP, network, password) {
    this.id = id;
    this.org = org;
    this.admin = admin;
    this.orgDepartment = orgDepartment;
    this.orgMSP = orgMSP;
    this.network = network;
    this.password = password;
}

Register.prototype.setRegister = async function () {
    try {

        const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
        const fs = require('fs');
        const path = require('path');

        const ccpPath = path.resolve(__dirname, '..', '..', 'network', this.network);
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(ccpJSON);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(this.id);
        if (userExists) {
            console.log('------------------------------======================--------------------------------');
            console.log('An identity for the user ID  : <<<   ' + this.id + '   >>> already exists in the wallet');
            console.log('-----------------------------======================--------------------------------');
            return;
        }
        console.log("admin : " + this.admin);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(this.admin);
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }


        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: this.admin, discovery: { enabled: false } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: this.orgDepartment, enrollmentID: this.id, role: 'client' }, adminIdentity);

        // const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: 'user3', role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: this.id, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity(this.Orgmsg, enrollment.certificate, enrollment.key.toBytes());
        wallet.import(this.id, userIdentity);

        console.log('-----------------------======================--------------------------');
        console.log('Successfully registered and enrolled admin user ID : <<<   ' + this.id + '   >>> and imported it into the wallet');
        console.log('-----------------------======================--------------------------');

    } catch (error) {
        console.log(error);
    }
}
//
module.exports = Register;
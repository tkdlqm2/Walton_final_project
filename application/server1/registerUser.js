/*
 * SPDX-License-Identifier: Apache-2.0
 */

// 디비에 저장하는 거

// var user = require('./user');

var database;
var UsersSchema;
var mongoose = require('mongoose');
var UserModel;


function connectDB(id, password, admin, orgDepartment, orgMSP, network) {

    var databaseUrl = 'mongodb://127.0.0.1:27017/local';

    mongoose.Promise = global.Promise; // 몽구스가 promise를 사용하기에 이렇게 설정을 해야함.
    mongoose.connect(databaseUrl); // db 연결을 해주는 상황.
    database = mongoose.connection;

    database.on('open', function () {
        console.log('db 연결됨. ' + databaseUrl);

        UsersSchema = mongoose.Schema({
            id: { type: String, required: true, unique: true },
            password: { type: String, required: true, },
            admin: { type: String, index: 'hashed' },
            orgDepartment: { type: String, required: true },
            orgMSP: { type: String, required: true },
            network: { type: String, required: true },
            created_at: { type: Date, index: { unique: false }, 'default': Date.now() },
            updated_at: { type: Date, index: { unique: false }, 'defalut': Date.now() }

        }); // 몽구스에 스키마라는 함수가 있음.


        // 스키마라는 객체라 return이 된다.
        console.log('UserSchema 정의함');

        UsersSchema.static('findById', function (id, callback) {
            return this.find({ id: id }, callback);
        });

        UsersSchema.static('findAll', function (callback) {
            return this.find({}, callback);
        });
        // param1 : users -> 기존의 커넥션을 users로 만들었던 것.
        // param2 : userSchema -> 위에서 정의한 스키마와 실제 커넥션 스키마를 연결시켜주는것.
        UserModel = mongoose.model('user2', UsersSchema);

        var user = new UserModel({ "id": id, "password": password, "admin": admin, "orgDepartment": orgDepartment, "orgMSP": orgMSP, "network": network });
        user.save(function (err) {
            if (err) {
                return;
            }
            console.log('=============================================');
            console.log("              사용자 데이터 추가함.");
            console.log('=============================================');
        });


    }); // db 연결시 호출되는것
    database.on('disconnected', function () {
        console.log('데이터베이스 연결 끊어짐');
    });

    database.on('error', console.error.bind(console, '몽구스 연결 에러'));
}


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
        connectDB(this.id, this.password, this.admin, this.orgDepartment, this.orgMSP, this.network);
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

var addUser = function (id, password, admin, orgDepartment, orgMSP, network, callback) {
    // console.log('=============================================');
    // console.log('addUser호출됨 : ');
    // console.log("id : " + id);
    // console.log('password : ' + password);
    // console.log('admin : ' + admin);
    // console.log('orgDepartment : ' + orgDepartment);
    // console.log('orgMSP : ' + orgMSP);
    // console.log('network : ' + network);
    // console.log('=============================================');
    UserModel = connectDB();

    console.log("============================");
    console.log('UserModel in addUser : ' + UserModel);
    console.log("----------------------------------");

    var user = new UserModel({ "id": id, "password": password, "admin": admin, "orgDepartment": orgDepartment, "orgMSP": orgMSP, "network": network });
    user.save(function (err) {
        if (err) {
            callback(err, null);
            return;
        }
        console.log('=============================================');
        console.log("사용자 데이터 추가함.");
        console.log('=============================================');
        callback(null, user);
    }); // 저장시키는 것.
};

module.exports = Register;
// ExpressJS Setup
const express = require('express');
const app = express();
var server = require('http').createServer(app);

var bodyParser = require('body-parser');
var RegisterUser = require('./registerUser');
var adminKey = 'admin1';
var mongoose = require('mongoose');
var crypto = require('crypto');
var io = require('socket.io')(server);

// var User = require('./user');

var UsersSchema;
var UserModel;

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';


// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'connection2.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});



// socket IO
io.on('connection', function (socket) {
    console.log('Socket Connected')
    io.emit('connect', 'connected')
})


// DB
function connectDB() {
    var databaseUrl = 'mongodb://127.0.0.1:27017/local';
    mongoose.Promise = global.Promise; // 몽구스가 promise를 사용하기에 이렇게 설정을 해야함.
    mongoose.connect(databaseUrl); // db 연결을 해주는 상황.
    database = mongoose.connection;

    database.on('open', function () {
        console.log('db 연결됨. ' + databaseUrl);

        UsersSchema = mongoose.Schema({
            id: { type: String, 'default': '' },
            password: { type: String, required: true, 'deafult': ' ' },
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

        // UsersSchema.static.findById = function (id, callback) {
        //     return this.find({ id: id }, callback);
        // } 이런식으로도 사용을 할 수 있음.


        // param1 : users -> 기존의 커넥션을 users로 만들었던 것.
        // param2 : userSchema -> 위에서 정의한 스키마와 실제 커넥션 스키마를 연결시켜주는것.
        UserModel = mongoose.model('power1', UsersSchema);
        console.log('UserModel 정의함');
    }); // db 연결시 호출되는것
    database.on('disconnected', function () {
        console.log('데이터베이스 연결 끊어짐');
    });

    database.on('error', console.error.bind(console, '몽구스 연결 에러'));
}


// route 
app.get('/importer_index', function (req, res) {
    fs.readFile('./importer_index.html', function (error, data) {
        res.send(data.toString());

    });
});

app.get('/container_index', function (req, res) {
    fs.readFile('./container_index.html', function (error, data) {
        res.send(data.toString());

    });
});

app.get('/roast_index', function (req, res) {
    fs.readFile('./roast_index.html', function (error, data) {
        res.send(data.toString());

    });
});

app.get('/master_index', function (req, res) {
    fs.readFile('./master_index.html', function (error, data) {
        res.send(data.toString());

    });
});

/////////////////////////////////////////////////////////////////////////////////////
////////////////////// 로그인
/////////////////////////////////////////////////////////////////////////////////////

app.get('/api/login/', function (req, res) {
    fs.readFile('./master/login.html', function (error, data) {
        res.send(data.toString());

    });
});
app.post('/api/login/', async function (req, res) {

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    if (database) {
        authUser(paramId, paramPassword, function (err, docs) {
            // param 1 : 에러 발생 시 받을 값.
            // param 2 : 정상작동 시 받을 값.

            if (err) {
                console.log('에러발생');
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.write('error \n');

                res.end();
                return;
            }

            if (docs) {
                var whereAdmin = (docs[0].admin);
                console.log("로그인성공");
                if (whereAdmin == 'admin1') {
                    console.log(docs[0].admin);
                    res.redirect('/importer_index');

                } else if (whereAdmin == 'admin2') {
                    console.log(docs[0].admin);
                    res.redirect('/container_index');

                } else if (whereAdmin == 'admin3') {
                    console.log(docs[0].admin);
                    res.redirect('/roast_index');
                } else if (whereAdmin == 'admin4') {
                    console.log(docs[0].admin);
                    res.redirect('/master_index');
                }

            } else {
                console.log('에러발생');
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.write('error \n');
                res.end();
                return;
            }
        })
    } else {
        console.log('에러발생');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('error \n');
        res.end();
        return;
    }

});



/////////////////////////////////////////////////////////////////////////////////////
////////////////////// 회원가입
/////////////////////////////////////////////////////////////////////////////////////
app.get('/api/join/', function (req, res) {
    fs.readFile('./master/join.html', function (error, data) {
        res.send(data.toString());

    });
});

app.post('/api/join/', async function (req, res) {
    try {
        var id = req.body.id;
        var org = req.body.org;
        var password = req.body.password;
        var admin;
        var orgDepartment;
        var orgMSP;
        var network;

        if (org == '운송업체') {
            org = 1;
            admin = 'admin1';
            orgDepartment = 'org1.department1';
            orgMSP = 'Org1MSP';
            network = 'connection.json';

        } else if (org == '창고관리자') {
            org = 2;
            admin = 'admin2';
            orgDepartment = 'org2.department1';
            orgMSP = 'Org2MSP';
            network = 'connection2.json';
        } else if (org == '로스팅업체') {
            org = 3;
            admin = 'admin3';
            orgDepartment = 'org3.department1';
            orgMSP = 'Org3MSP';
            network = 'connection3.json';
        } else {
            console.log("-----<<  회원가입  >> --------");
            console.log("잘못된 정보입니다")
            console.log('---------------------------');
            return;
        }

        Register = new RegisterUser(id, org, admin, orgDepartment, orgMSP, network, password);
        Register.setRegister();

        if (database) {
            addUser(id, password, admin, orgDepartment, orgMSP, network, function (err, result) {
                if (err) {
                    console.log('에러발생');
                    console.log(err);
                    return;
                }

                if (result) {
                    // console.dir(result);
                    console.log('사용자 추가 성공!');
                    var whereAdmin = result.admin;
                    if (whereAdmin == 'admin1') {
                        res.redirect('/importer_index');
                    } else if (whereAdmin == 'admin2') {
                        res.redirect('/container_index');
                    } else if (whereAdmin == 'admin3') {
                        res.redirect('/roast_index');
                    }
                } else {
                    console.log('에러 발생');
                    console.log('사용자 추가 안됨');
                }
            });
        } else {
            console.log('에러 발생');
            console.log('db 연결안됨');
        }

    } catch (error) {
        console.error();
    }
});

/////////////////////////////////////////////////////////////////////////////////////
////////////////////// 모든 원두 이력 조회
/////////////////////////////////////////////////////////////////////////////////////

app.get('/', function (req, res) {
    fs.readFile('./index.html', function (error, data) {
        res.send(data.toString());

    });
});


app.get('/api/query', async function (req, res) {
    // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), '..', 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(adminKey);
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: adminKey, discovery: { enabled: false } });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('sacc');

    const result = await contract.evaluateTransaction('getAllKeys');
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    var obj = JSON.parse(result);
    res.status(200).json(obj);
});

/////////////////////////////////////////////////////////////////////////////////////
////////////////////       원두 이력 조회
/////////////////////////////////////////////////////////////////////////////////////
app.get('/api/querykey/', function (req, res) {
    fs.readFile('./querykey.html', function (error, data) {
        res.send(data.toString());
    });
});


app.get('/api/querykey/:id', async function (req, res) {
    // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    try {

        var key = req.params.id;
        console.log(key);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(adminKey);
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();

        await gateway.connect(ccp, { wallet, identity: adminKey, discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');


        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        const result = await contract.evaluateTransaction('get', key);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        var obj = JSON.parse(result)
        res.status(200).json(obj);

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json(`{response: ${error}`);
    }
});


// =================================================================================
// -----------================= 유통업체 =====================------------------------
// =================================================================================


////////////////////// 유통업체)  원두 이력 등록
app.get('/api/enrollGoods_improter', function (req, res) {
    fs.readFile('./importer/enrollGoods_improter.html', function (error, data) {
        res.send(data.toString());
    });
});

app.post('/api/enrollGoods_improter/', async function (req, res) {

    try {
        var key = req.body.key;
        var value1 = req.body.value11;
        var value2 = req.body.value12;
        var value3 = req.body.value13;
        var value4 = req.body.value14;
        var value5 = req.body.value15.toString();
        var value6 = req.body.value16;
        var value7 = req.body.latitute.toString();

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin1', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');

        const listener = await contract.addContractListener('importer_1', 'enroll_seedByImporter', (err, event, blockNumber, transactionId, status) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log("------유통업체 ( 원두 이력 등록 ) ---------");
            console.log("날짜 등록 : ", value1)
            console.log(`Block Number: ${blockNumber} \nTransaction ID: ${transactionId} \nStatus: ${status}`);
            console.log("------------------------------------");
            var from = "유통업체";
            var job = "원두이력 등록";
            var sendData = { from, job, value1, blockNumber, transactionId, status };
            io.emit('importer_enroll_seed1', sendData);
        });
        await contract.submitTransaction('enroll_seedByImporter', key, value1, value2, value3, value4, value5, value6, value7);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();
        res.redirect('/importer_index');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});


////////////////////// 유통업체)  상품 출고 등록
app.get('/api/sendGoods_importer', function (req, res) {
    fs.readFile('./importer/sendGoods_importer.html', function (error, data) {
        res.send(data.toString());
    });
});

app.post('/api/sendGoods_importer/', async function (req, res) {
    try {

        var key = req.body.key;
        var value17 = req.body.value17;
        var destination1 = req.body.destination1;

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin1', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');
        const listener = await contract.addContractListener('importer_2', 'set_timeByImporter', (err, event, blockNumber, transactionId, status) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log("----------유통업체 (출고 날짜 등록)---------------")
            console.log("날짜 등록 : ", value17)
            console.log("배송지 : ", destination1)
            console.log(`Block Number: ${blockNumber}\n Transaction ID: ${transactionId} \nStatus: ${status}`);
            console.log("-------------------------------------------")
            var from = "유통업체";
            var job = "출고날짜 등록";
            var sendData1 = { from, job, value17, blockNumber, transactionId, status };
            io.emit('importer_enroll_seed2', sendData1);

        });

        //
        await contract.submitTransaction('set_timeByImporter', key, value17, destination1);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.redirect('/importer_index');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});

// =================================================================================
// -----------================= 창고관리자 =====================------------------------
// =================================================================================

////////////////////// 창고관리) 상품 이력 등록

app.get('/api/enrollGoods_container', function (req, res) {
    fs.readFile('./container/enrollGoods_container.html', function (error, data) {
        res.send(data.toString());
    });
});

app.post('/api/enrollGoods_container/', async function (req, res) {
    try {
        var key = req.body.key;
        var value19 = req.body.value19;  // V20
        var value20 = req.body.value20.toString(); // V21
        var value21 = req.body.value21.toString(); // V22


        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin2');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin2', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');
        const listener = await contract.addContractListener('container_1', 'enroll_seedByContainer', (err, event, blockNumber, transactionId, status) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("-----------창고관리--------------")
            console.log("----     원두이력 등록        ----")
            console.log(`Block Number: ${blockNumber}\n Transaction ID: ${transactionId}\n Status: ${status}`);
            console.log("-------------------------------")
            var from = "창고관리";
            var job = "원두이력 등록";
            sendData = { from, job, value19, blockNumber, transactionId, status };
            io.emit('container_enroll_seed2', sendData);
        })
        await contract.submitTransaction('enroll_seedByContainer', key, value19, value20, value21);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.redirect('/container_index');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});


////////////////////// 창고관리) 상품 출고 날짜 등록

app.get('/api/sendGoods_container', function (req, res) {
    fs.readFile('./container/sendGoods_container.html', function (error, data) {
        res.send(data.toString());
    });
});
//
//
app.post('/api/sendGoods_container/', async function (req, res) {
    try {
        var key = req.body.key;
        var value22 = req.body.value22; // V23
        var destination2 = req.body.destination2;  // V24

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin2');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin2', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');
        const listener = await contract.addContractListener('container_2', 'set_timeByContainer', (err, event, blockNumber, transactionId, status) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("----------창고관리-------------")
            console.log("----     출고날짜 등록      ----")
            console.log(`Block Number: ${blockNumber}\n Transaction ID: ${transactionId}\n Status: ${status}`);
            console.log("-------------------------------")
            var from = "창고관리";
            var job = "출고날짜 등록";
            sendData = { from, job, value22, blockNumber, transactionId, status };
            io.emit('container_enroll_seed2', sendData);
        })
        await contract.submitTransaction('set_timeByContainer', key, value22, destination2);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.redirect('/container_index');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});



// =================================================================================
// -----------================= 로스팅업체 =====================------------------------
// =================================================================================

////////////////////// 원두 로스팅 등록
app.get('/api/enrollGoods_roaster', function (req, res) {
    fs.readFile('./roaster/enrollGoods_roaster.html', function (error, data) {
        res.send(data.toString());
    });
});

app.post('/api/enrollGoods_roaster/', async function (req, res) {
    try {
        var key = req.body.key;

        var value28 = req.body.value28.toString();
        var value29 = req.body.value29.toString();

        var fragrance = req.body.fragrance.toString();
        var balance = req.body.balance.toString();
        var bitterness = req.body.bitterness.toString();
        var sweetess = req.body.sweetess.toString();
        var aftertaste = req.body.aftertaste.toString();
        var body = req.body.body.toString();
        var acidity = req.body.acidity.toString();
        var aroma = req.body.aroma.toString();

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin3');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin3', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');
        const listener = await contract.addContractListener('Roasting_1', 'enroll_seedByCoffee', (err, event, blockNumber, transactionId, status) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("---------------커피가게---------------")
            console.log("-             로스팅 등록             -")
            console.log(`Block Number: ${blockNumber}\n Transaction ID: ${transactionId}\n Status: ${status}`);
            console.log("-----------------------------------")
            var from = "로스팅업체";
            var job = "로스팅정보 등록";
            sendData = { from, job, value28, blockNumber, transactionId, status };
            io.emit('Roast_enroll_seed1', sendData);
        })

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        //        await contract.submitTransaction('createCar', 'CAR11', 'Hnda', 'Aord', 'Bla', 'Tom');
        await contract.submitTransaction('enroll_seedByCoffee', key, value28, value29, fragrance, balance, bitterness, sweetess, aftertaste, body, acidity, aroma);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.redirect('/roast_index');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});

////////////////////// 원두 도착 날짜 등록

app.get('/api/enrollArriveTime_roaster', function (req, res) {
    fs.readFile('./roaster/enrollArriveTime_roaster.html', function (error, data) {
        res.send(data.toString());
    });
});

app.post('/api/enrollArriveTime_roaster/', async function (req, res) {
    try {
        var key = req.body.key;
        var value24 = req.body.value24;

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin3');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin3', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');
        const listener = await contract.addContractListener('Roasting_2', 'setarr_timeByCoffee', (err, event, blockNumber, transactionId, status) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("----------------커피가게------------------")
            console.log("-             도착날짜 등록               -")
            console.log(`Block Number: ${blockNumber}\n Transaction ID: ${transactionId}\n Status: ${status}`);
            console.log("---------------------------------------")
            var from = "로스팅업체";
            var job = "도착날짜 등록";
            sendData = { from, job, value24, blockNumber, transactionId, status };
            io.emit('Roast_enroll_seed2', sendData);
        })

        //
        await contract.submitTransaction('setarr_timeByCoffee', key, value24);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.redirect('/roast_index');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});

////////////////////// 카페) 상품 출고 날짜 등록

app.get('/api/sendGoods_roaster', function (req, res) {
    fs.readFile('./roaster/sendGoods_roaster.html', function (error, data) {
        res.send(data.toString());
    });
});
// Create car handle
app.post('/api/sendGoods_roaster/', async function (req, res) {
    try {
        var key = req.body.key;
        var value38 = req.body.value38;
        var destination3 = req.body.destination3;

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin3');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin3', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');
        const listener = await contract.addContractListener('Roasting_3', 'set_timeByCoffee', (err, event, blockNumber, transactionId, status) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("-----------커피가게--------------")
            console.log("-         상품출고 등록           -")
            console.log(`Block Number: ${blockNumber}\n Transaction ID: ${transactionId}\n Status: ${status}`);
            console.log("---------------------------------")
            var from = "로스팅업체";
            var job = "상품출고 등록";
            sendData = { from, job, value38, blockNumber, transactionId, status };
            io.emit('Roast_enroll_seed3', sendData);
        })

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        //        await contract.submitTransaction('createCar', 'CAR11', 'Hnda', 'Aord', 'Bla', 'Tom');
        await contract.submitTransaction('set_timeByCoffee', key, value38, destination3);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.redirect('/roast_index');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});


// =================================================================================
// -----------================= 패키징업체 (master) =====================---------------
// =================================================================================


////////////////////// 패키징 업체 ) 상품 도착 날짜 등록

app.get('/api/enrollArriveTime_packaging', function (req, res) {
    fs.readFile('./master/enrollArriveTime_packaging.html', function (error, data) {
        res.send(data.toString());
    });
});

app.post('/api/enrollArriveTime_packaging/', async function (req, res) {
    try {
        var key = req.body.key;
        var value40 = req.body.value40;


        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin4');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin4', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');
        const listener = await contract.addContractListener('pack_1', 'setarr_timeByService', (err, event, blockNumber, transactionId, status) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("---------패키징가게-----------")
            console.log("-      상품도착날짜 등록      -")
            console.log(`Block Number: ${blockNumber}\n Transaction ID: ${transactionId}\n Status: ${status}`);
            console.log("------------------------------")
            var from = "패키징업체";
            var job = "상품도착 날짜 등록";
            sendData = { from, job, value40, blockNumber, transactionId, status };
            io.emit('Package_enroll_seed1', sendData);
        })
        await contract.submitTransaction('setarr_timeByService', key, value40);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.redirect('/master_index');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});



////////////////////// 패키징 업체 ) 상품 패키징 날짜 등록


app.get('/api/enrollGoods_packaging', function (req, res) {
    fs.readFile('./master/enrollGoods_packaging.html', function (error, data) {
        res.send(data.toString());
    });
});
// Create car handle
app.post('/api/enrollGoods_packaging/', async function (req, res) {
    try {
        var key = req.body.key;
        var value42 = req.body.value42;

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin4');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin4', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');
        const listener = await contract.addContractListener('pack_2', 'set_timeByService', (err, event, blockNumber, transactionId, status) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("---------패키징가게------------")
            console.log("-      패키징 시간 등록        -")
            console.log(`Block Number: ${blockNumber}\n Transaction ID: ${transactionId}\n Status: ${status}`);
            console.log("----------------------------")
            var from = "패키징업체";
            var job = "패키징 시간 등록";
            sendData = { from, job, value42, blockNumber, transactionId, status };
            io.emit('Package_enroll_seed2', sendData);
        })
        await contract.submitTransaction('set_timeByService', key, value42);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.redirect('/master_index');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});


////////////////////// 패키징 업체 ) 상품 출고 날짜 등록

app.get('/api/sendGoods_packaging', function (req, res) {
    fs.readFile('./master/sendGoods_packaging.html', function (error, data) {
        res.send(data.toString());
    });
});
// Create car handle
app.post('/api/sendGoods_packaging/', async function (req, res) {
    try {
        var key = req.body.key;
        var value44 = req.body.value44;

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin4');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin4', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');
        const listener = await contract.addContractListener('pack_3', 'set_timeByService2', (err, event, blockNumber, transactionId, status) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("-----------패키징가게--------------")
            console.log("-        패키징 출고시간 등록          -")
            console.log(`Block Number: ${blockNumber}\n Transaction ID: ${transactionId}\n Status: ${status}`);
            console.log("--------------------------------")
            var from = "패키징업체";
            var job = "패키징 출고 시간 등록";
            sendData = { from, job, value, blockNumber, transactionId, status };
            io.emit('Package_enroll_seed3', sendData);
        })
        await contract.submitTransaction('set_timeByService2', key, value44);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.redirect('/master_index');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});
//


// DB


var addUser = function (id, password, admin, orgDepartment, orgMSP, network, callback) {
    console.log('addUser호출됨 : ');

    var user = new UserModel({ "id": id, "password": password, "admin": admin, "orgDepartment": orgDepartment, "orgMSP": orgMSP, "network": network });
    user.save(function (err) {
        if (err) {
            callback(err, null);
            return;
        }
        console.log("사용자 데이터 추가함.");
        callback(null, user);
    }); // 저장시키는 것.
};

var authUser = function (id, password, callback) {
    console.log('authUser 호출');

    UserModel.findById(id, function (err, results) {
        if (err) {
            callback(err, null);
            return;
        }
        console.log('아이디[%s]로 사용자 검색 결과 ', id);

        if (results.length > 0) {
            console.log('아이디 [%s], 비밀번호 [%s]가 일치하는 사용자 찾음.');
            if (results[0]._doc.password == password) {
                console.log('비밀번호 일치함');
                callback(null, results);
            } else {
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }
        } else {
            console.log('아이디와 일치하는 사용자를 찾지 못함');
            callback(null, null);
        }

    });
};


// server start
server.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
connectDB();

//
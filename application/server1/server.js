// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var RegisterUser = require('./registerUser');
var adminKey = 'admin1';

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
/////////////////////////////////////////////////////////////////////////////////////
////////////////////// 로그인
/////////////////////////////////////////////////////////////////////////////////////
app.get('/api/login/', function (req, res) {
    fs.readFile('./master/login.html', function (error, data) {
        res.send(data.toString());

    });
});
app.post('/api/login/', async function (req, res) {

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
            console.log("-----<<  회원가입 >> --------");
            console.log("잘못된 정보입니다")
            console.log('---------------------------');
            return;
        }

        var register = new RegisterUser(id, org, admin, orgDepartment, orgMSP, network, password);
        register.setRegister();
        return res.redirect('./index.html');

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


    // Evaluate the specified transaction.
    // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
    // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
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

// Query car handle
// localhost:8080/api/querycar?carno=CAR5
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

            console.log("------유통업체 ( 원두 이력 등록 ) ---------")
            console.log("날짜 등록 : ", value1)
            console.log(`Block Number: ${blockNumber} \nTransaction ID: ${transactionId} \nStatus: ${status}`);

            console.log("------------------------------------")
        })
        await contract.submitTransaction('enroll_seedByImporter', key, value1, value2, value3, value4, value5, value6, value7);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({ response: 'Transaction has been submitted' });

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
// Create car handle
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

        })

        //
        await contract.submitTransaction('set_timeByImporter', key, value17, destination1);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({ response: 'Transaction has been submitted' });

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
        })
        await contract.submitTransaction('enroll_seedByContainer', key, value19, value20, value21);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({ response: 'Transaction has been submitted' });

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
        })
        await contract.submitTransaction('set_timeByContainer', key, value22, destination2);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({ response: 'Transaction has been submitted' });

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
        })

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        //        await contract.submitTransaction('createCar', 'CAR11', 'Hnda', 'Aord', 'Bla', 'Tom');
        await contract.submitTransaction('enroll_seedByCoffee', key, value28, value29, fragrance, balance, bitterness, sweetess, aftertaste, body, acidity, aroma);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({ response: 'Transaction has been submitted' });

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
        })

        //
        await contract.submitTransaction('setarr_timeByCoffee', key, value24);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({ response: 'Transaction has been submitted' });

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
        })

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        //        await contract.submitTransaction('createCar', 'CAR11', 'Hnda', 'Aord', 'Bla', 'Tom');
        await contract.submitTransaction('set_timeByCoffee', key, value38, destination3);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({ response: 'Transaction has been submitted' });

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
        })
        await contract.submitTransaction('setarr_timeByService', key, value40);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({ response: 'Transaction has been submitted' });

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
        })
        await contract.submitTransaction('set_timeByService', key, value42);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({ response: 'Transaction has been submitted' });

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
        })
        await contract.submitTransaction('set_timeByService2', key, value44);
        console.log('정보 등록에 성공 했습니다.');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({ response: 'Transaction has been submitted' });

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});



// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);



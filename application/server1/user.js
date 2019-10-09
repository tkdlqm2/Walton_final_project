

function User(id, password) {
    this.id = id;
    this.password = password;
}


function connectDB() {
    var databaseUrl = 'mongodb://127.0.0.1:27017/local';

    mongoose.Promise = global.Promise; // 몽구스가 promise를 사용하기에 이렇게 설정을 해야함.
    mongoose.connect(databaseUrl); // db 연결을 해주는 상황.
    database = mongoose.connection;

    database.on('open', function () {
        console.log('db 연결됨. ' + databaseUrl);

        UsersSchema = mongoose.Schema({
            id: { type: String, required: true, unique: true },
            password: { type: String, required: true, },
            name: { type: String, index: 'hashed' },
            age: { type: Number, 'default': -1 },
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
        UserModel = mongoose.model('users2', UsersSchema);
        console.log('UserModel 정의함');
    }); // db 연결시 호출되는것
    database.on('disconnected', function () {
        console.log('데이터베이스 연결 끊어짐');
    });

    database.on('error', console.error.bind(console, '몽구스 연결 에러'));
}


var authUser = function (db, id, password, callback) {
    console.log('authUser 호출됨', id + '/' + password);

    UserModel.findById(id, function (err, results) {
        if (err) {
            callback(err, null);
            return;
        }
        console.log('Id : ' + this.id);
        if (results.length > 0) {
            if (results[0]._doc.password === password) {
                console.log('비밀번호 일치함');
                callback(null, results);
            } else {
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }
        } else {
            console.log('아이디를 찾을 수 없음');
            callback(null, null);
        }
    });

    UserModel.find({ "id": id, "password": password }, function (err, docs) {
        if (err) {
            callback(err, null);
            return;
        }
        if (docs.length > 0) {
            console.log('일치하는 사용자를 찾음.');
            callback(null, docs);
        } else {
            console.log('일치하는 사용자를 찾지 못함');
            callback(null, null);
        }
    });
}
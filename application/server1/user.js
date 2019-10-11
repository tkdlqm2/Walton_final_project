var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsersSchema = new Schema({
    id: { type: String, required: true, unique: true },
    password: { type: String, required: true, },
    admin: { type: String, index: 'hashed' },
    orgDepartment: { type: String, required: true },
    orgMSP: { type: String, required: true },
    network: { type: String, required: true },
    created_at: { type: Date, index: { unique: false }, 'default': Date.now() },
    updated_at: { type: Date, index: { unique: false }, 'defalut': Date.now() }
});

module.exports = mongoose.model('user', UsersSchema);
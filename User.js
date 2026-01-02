const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
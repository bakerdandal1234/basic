const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    permissions: {
        type: [String], // Array of strings, e.g., ['read', 'write', 'update', 'delete', 'manage_users']
        default: []
    }
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;

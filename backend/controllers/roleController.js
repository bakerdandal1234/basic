const Role = require('../models/Role');

// Create a new role
const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const newRole = new Role({ name, permissions });
        await newRole.save();
        res.status(201).json({ success: true, message: 'Role created successfully', role: newRole });
    } catch (error) {
        console.error('Error creating role:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Role with this name already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all roles
const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({});
        res.json({ success: true, roles });
    } catch (error) {
        console.error('Error getting all roles:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update a role
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;
        const updatedRole = await Role.findByIdAndUpdate(id, { name, permissions }, { new: true });
        if (!updatedRole) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        res.json({ success: true, message: 'Role updated successfully', role: updatedRole });
    } catch (error) {
        console.error('Error updating role:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Role with this name already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete a role
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRole = await Role.findByIdAndDelete(id);
        if (!deletedRole) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        res.json({ success: true, message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    createRole,
    getAllRoles,
    updateRole,
    deleteRole
};

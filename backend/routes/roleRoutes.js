const express = require('express');
const router = express.Router();
const { createRole, getAllRoles, updateRole, deleteRole } = require('../controllers/roleController');
const { authenticateUser, authorizeRole } = require('../middleware');

// All role management routes should be protected and only accessible by admins or superadmins
router.post('/', authenticateUser, authorizeRole('admin'), createRole);
router.get('/', authenticateUser, authorizeRole('admin'), getAllRoles);
router.put('/:id', authenticateUser, authorizeRole('admin'), updateRole);
router.delete('/:id', authenticateUser, authorizeRole('admin'), deleteRole);

module.exports = router;

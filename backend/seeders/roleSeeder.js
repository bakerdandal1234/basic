const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
require('dotenv').config({ path: './.env' });

const seedRolesAndAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding.');

        const rolesToSeed = [
            { name: 'user', permissions: [] },
            { name: 'admin', permissions: ['read', 'write', 'update', 'delete', 'manage_users', 'manage_roles'] },
            { name: 'superadmin', permissions: ['read', 'write', 'update', 'delete', 'manage_users', 'manage_roles', 'all_access'] }
        ];

        for (const roleData of rolesToSeed) {
            const existingRole = await Role.findOne({ name: roleData.name });
            if (!existingRole) {
                await Role.create(roleData);
                console.log(`Role '${roleData.name}' seeded successfully.`);
            } else {
                console.log(`Role '${roleData.name}' already exists, skipping.`);
            }
        }

        const adminRole = await Role.findOne({ name: 'admin' });

        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (!existingAdmin) {
            await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123', // سيتم تشفيره في pre-save hook
                role: adminRole._id, // هنا نخزن ObjectId الخاص بـ admin
            });
            console.log('Admin user created successfully.');
        } else {
            console.log('Admin user already exists, skipping.');
        }

        console.log('Seeding complete.');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected after seeding.');
    }
};

seedRolesAndAdmin();

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// User model (simple schema for deletion)
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

// Get command from arguments
const command = process.argv[2];
const email = process.argv[3];

const showHelp = () => {
    console.log(`
📚 User Management Script
========================

Usage:
  node deleteUser.js list              - List all users
  node deleteUser.js delete <email>    - Delete user by email
  node deleteUser.js deleteall         - Delete ALL users (careful!)

Examples:
  node deleteUser.js list
  node deleteUser.js delete qais.khan2023@tsecedu.org
    `);
};

const listUsers = async () => {
    try {
        const users = await User.find({}, 'name email role isEmailVerified isApproved');
        console.log('\n📋 All Users in Database:');
        console.log('========================\n');
        
        if (users.length === 0) {
            console.log('No users found in database.');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Email Verified: ${user.isEmailVerified || false}`);
                console.log(`   Approved: ${user.isApproved || false}`);
                console.log('');
            });
        }
        
        mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error:', err.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

const deleteUser = async (email) => {
    try {
        const result = await User.deleteOne({ email });
        
        if (result.deletedCount > 0) {
            console.log(`\n✅ Successfully deleted user: ${email}`);
        } else {
            console.log(`\n⚠️  No user found with email: ${email}`);
        }
        
        mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error:', err.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

const deleteAllUsers = async () => {
    try {
        console.log('⚠️  WARNING: This will delete ALL users from the database!');
        console.log('This action cannot be undone.');
        
        // In a real scenario, you'd want to add a confirmation prompt
        const result = await User.deleteMany({ role: { $ne: 'admin' } }); // Keep admin users
        
        console.log(`\n✅ Deleted ${result.deletedCount} users (kept admin accounts)`);
        
        mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error:', err.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

// Main execution
(async () => {
    if (!command) {
        showHelp();
        mongoose.connection.close();
        return;
    }

    switch (command.toLowerCase()) {
        case 'list':
            await listUsers();
            break;
        case 'delete':
            if (!email) {
                console.log('❌ Please provide an email address');
                console.log('Usage: node deleteUser.js delete <email>');
                mongoose.connection.close();
                return;
            }
            await deleteUser(email);
            break;
        case 'deleteall':
            await deleteAllUsers();
            break;
        default:
            console.log(`❌ Unknown command: ${command}`);
            showHelp();
            mongoose.connection.close();
    }
})();

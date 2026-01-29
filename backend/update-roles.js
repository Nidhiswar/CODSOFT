const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    phone: String,
    password: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    cart: Array,
    hasConsented: Boolean,
    consentDetails: Object,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function updateRoles() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Update specific users to 'user' role
    const emailsToUpdate = [
        'internationalsupport@novelexporters.com',
        'nidhiswarbalasubramanian@gmail.com'
    ];
    
    const result = await User.updateMany(
        { email: { $in: emailsToUpdate } },
        { $set: { role: 'user' } }
    );
    
    console.log('Updated', result.modifiedCount, 'users to role: user');
    
    // Verify the update
    const users = await User.find({}, 'email role');
    console.log('\nCurrent user roles:');
    users.forEach(u => console.log(`  ${u.email} -> ${u.role}`));
    
    await mongoose.disconnect();
    console.log('\nDone!');
}

updateRoles().catch(console.error);

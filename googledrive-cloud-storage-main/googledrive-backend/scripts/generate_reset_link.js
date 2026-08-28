const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const generateResetLink = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'swayam27062005@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found.`);
            return;
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL;
        const link = `${frontendUrl}/reset-password/${resetToken}`;

        // Write to file
        fs.writeFileSync(path.join(__dirname, 'reset_link.txt'), link);
        console.log('SUCCESS: Link written to reset_link.txt');
        console.log('LINK:', link);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

generateResetLink();

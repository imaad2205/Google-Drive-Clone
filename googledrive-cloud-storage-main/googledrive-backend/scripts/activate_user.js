const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const activateUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'swayam27062005@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            user.isActive = true;
            user.activationToken = undefined;
            user.activationTokenExpires = undefined;
            await user.save();
            console.log(`SUCCESS: User ${email} has been manually activated!`);
        } else {
            console.log(`User ${email} not found.`);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

activateUser();

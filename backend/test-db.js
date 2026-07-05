const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb+srv://admin:sinan123@cluster0.e4dpm.mongodb.net/reviews';
console.log('Connecting to:', uri);

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    });

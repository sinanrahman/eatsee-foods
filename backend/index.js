const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/eatsee';
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// Mongoose Review Schema & Model
const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, default: 'Customer' },
    content: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    status: { type: String, default: 'pending', enum: ['pending', 'approved'] },
    createdAt: { type: Date, default: Date.now }
});

reviewSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Review = mongoose.model('Review', reviewSchema);

// API Routes for Reviews

// GET /api/reviews
app.get('/api/reviews', async (req, res) => {
    try {
        // Fetch all reviews, removing the 'approved' requirement so they show instantly
        const reviews = await Review.find({}).sort({ createdAt: -1 });
        res.json({ reviews });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/reviews
app.post('/api/reviews', async (req, res) => {
    try {
        const { name, role, content, rating } = req.body;
        const newReview = new Review({ name, role, content, rating });
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH /api/reviews/:id/approve
app.patch('/api/reviews/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedReview = await Review.findByIdAndUpdate(
            id,
            { status: 'approved' },
            { new: true }
        );
        res.json(updatedReview);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/reviews/:id
app.delete('/api/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Review.findByIdAndDelete(id);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

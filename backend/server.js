require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./auth');

const app = express();

// Middleware
app.use(cors()); // Allow requests from your React app
app.use(express.json()); // To parse JSON request bodies

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch(error => console.error('Error connecting to MongoDB Atlas:', error));

// --- Mongoose Schema and Model for Users ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'member' },
    description: { type: String, default: '' },
    phone: { type: String, default: '' },
    profilePicture: { type: String, default: '' } // Storing as Base64 string
});

// --- Mongoose Schema and Model for Meetings ---
const meetingSchema = new mongoose.Schema({
    meetingId: { type: String, unique: true }, // No longer required on creation
    name: { type: String, required: true },
    description: String,
    datetime: String,
    currentAgendaIndex: { type: Number, default: 0 },
    currentMotionIndex: { type: Number, default: 0 },
    agenda: [String],
    motionQueue: [{
        name: String,
        description: String,
        creator: String
    }]
}, { collection: 'meetings' }); // Explicitly set collection name

// This middleware will add the meetingId based on the _id after it's created.
meetingSchema.pre('save', function(next) {
    if (this.isNew && !this.meetingId) {
        this.meetingId = this._id.toString();
    }
    next();
});

const User = mongoose.model('User', userSchema);
const Meeting = mongoose.model('Meeting', meetingSchema);


// --- API Endpoints ---

// --- User Authentication Endpoints ---

// User Signup
app.post('/api/users/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// User Login
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, email: user.email, role: user.role, name: user.name });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Profile Endpoints ---

// GET current user's profile
app.get('/api/profile', authMiddleware, async (req, res) => {
    try {
        // req.user.id is from the authMiddleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT (update) current user's profile
app.put('/api/profile', authMiddleware, async (req, res) => {
    const { name, description, phone, profilePicture } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { name, description, phone, profilePicture } },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Endpoints for the list of meetings on the homepage ---

// RENEW THIS LATER!!!! AFTER TESTING !!!!
// Get all meeting summaries
app.get('/api/meetings', async (req, res) => {
    try {
        console.log('[GET] Request received for all meetings.');
        const meetings = await Meeting.find({});
       res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Create a new meeting
app.post('/api/meetings', async (req, res) => {
    console.log('[POST] Received data to create new meeting:', req.body);
    const meetingData = {
        ...req.body,
        // meetingId will be generated from _id by the pre-save hook
        agenda: ["Call to order", "Approval of previous minutes"],
        motionQueue: [] // Start with an empty motion queue
    };
    const meeting = new Meeting(meetingData);
    try {
        const newMeeting = await meeting.save();
        console.log('[POST] Successfully saved new meeting:', newMeeting);
        res.status(201).json(newMeeting);
    } catch (error) {
        console.error('[POST] Error saving meeting:', error.message);
        res.status(400).json({ message: error.message });
    }
});

// Delete a meeting
app.delete('/api/meetings/:meetingId', async (req, res) => {
    console.log(`[DELETE] Attempting to delete meeting with _id: ${req.params.meetingId}`);
    try {
        const meeting = await Meeting.findById(req.params.meetingId);

        if (!meeting) {
            console.log(`[DELETE] Meeting with _id: ${req.params.meetingId} not found.`);
            return res.status(404).json({ message: 'Meeting not found' });
        }

        await Meeting.findByIdAndDelete(req.params.meetingId);
        console.log(`[DELETE] Successfully deleted meeting with _id: ${req.params.meetingId}`);

        res.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        console.error('[DELETE] Error deleting meeting:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Update Meeting Data
app.put('/api/meetings/:meetingId', async (req, res) => {
    try {
        console.log(`[PUT] Received update for meeting ${req.params.meetingId}:`, req.body);
        const updatedMeeting = await Meeting.findOneAndUpdate(
            { meetingId: req.params.meetingId },
            req.body,
            { new: true, upsert: true } // `new` returns the updated doc, `upsert` creates if it doesn't exist
        );
        res.json(updatedMeeting);
    } catch (error) {
        console.error(`[PUT] Error updating meeting ${req.params.meetingId}:`, error.message);
        res.status(500).json({ message: error.message });
    }
});

// --- Endpoints for a single meeting's detailed data ---
app.get('/api/meetings/:meetingId', async (req, res) => {
    try {
        let meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        res.json(meeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

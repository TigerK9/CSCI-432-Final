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
    // Flag indicating the meeting has been ended by the chairman
    ended: { type: Boolean, default: false },
    motionQueue: [{
        name: String,
        description: String,
        creator: String,
        // Include 'proposed' to be tolerant of legacy data; canonical value is 'pending'
        // Expanded enum to include final states for completed votes
        status: { type: String, enum: ['pending', 'proposed', 'approved', 'denied', 'active', 'voting', 'completed', 'failed', 'tied', 'no-votes'], default: 'pending' },
        proposedBy: String,
        votes: {
            aye: { type: Number, default: 0 },
            no: { type: Number, default: 0 }
        },
        voterIds: [String], // Array of user IDs who have voted
        votingEndsAt: Date
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

// Propose a new motion
app.post('/api/meetings/:meetingId/propose-motion', authMiddleware, async (req, res) => {
    try {
        const { name, description, creator } = req.body;
        console.log('[POST] Propose motion request:', { meetingId: req.params.meetingId, body: req.body });
        
        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }

        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        if (!meeting) {
            console.error('[POST] Meeting not found:', req.params.meetingId);
            return res.status(404).json({ message: 'Meeting not found', meetingId: req.params.meetingId });
        }

            // Create the new motion with the correct status enum value
            const newMotion = {
                name,
                description,
                creator: creator || req.user.name || 'Unknown',
                status: 'pending', // This must match the enum in the schema: ['pending', 'approved', 'denied', 'active', 'voting', 'completed']
                proposedBy: req.user.id,
                proposedAt: new Date(),
                votes: { aye: 0, no: 0 }
            };

            console.log('[POST] Creating new motion:', newMotion);

        meeting.motionQueue.push(newMotion);
        await meeting.save();
        
        console.log('[POST] Successfully added new motion:', newMotion);
        res.status(201).json(newMotion);
    } catch (error) {
        console.error('[POST] Error proposing motion:', error);
        res.status(500).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Handle motion approval/denial
app.post('/api/meetings/:meetingId/motions/:motionIndex/review', authMiddleware, async (req, res) => {
    try {
        const { action } = req.body; // 'approve' or 'deny'
        if (!['approve', 'deny'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        // Check if user is chairman/admin
        if (req.user.role !== 'chairman' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized: Only chairman/admin can review motions' });
        }

        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const motionIndex = parseInt(req.params.motionIndex);
        const motion = meeting.motionQueue[motionIndex];

        if (!motion || motion.status !== 'pending') {
            return res.status(400).json({ message: 'Motion is not pending review' });
        }

    if (action === 'approve') {
        // When chairman approves, remove the pending motion from its current
        // position and append it to the end of the motionQueue with status
        // 'proposed' so approval order is preserved.
        console.log('[REVIEW] Approving pending motion at index', motionIndex, 'current status:', motion.status);

        // Remove the motion from its current position
        const removed = meeting.motionQueue.splice(motionIndex, 1)[0];

        // Build the approved motion object preserving existing data but
        // setting the canonical status and review metadata. This ensures
        // the approved motion appears at the end of the queue (approval order).
        const approvedMotion = {
            name: removed.name,
            description: removed.description,
            creator: removed.creator,
            status: 'proposed',
            proposedBy: removed.proposedBy || req.user.id,
            votes: removed.votes || { aye: 0, no: 0 },
            voterIds: removed.voterIds || [],
            votingEndsAt: removed.votingEndsAt || null,
            reviewedBy: req.user.name,
            reviewedAt: new Date()
        };

        meeting.motionQueue.push(approvedMotion);
        await meeting.save();
        console.log('[REVIEW] Approved motion moved to end of queue:', approvedMotion);

        // Return the full updated meeting object
        res.json({ meeting });
    } else {
        // When chairman denies, remove the motion from the queue entirely
        meeting.motionQueue.splice(motionIndex, 1);
        await meeting.save();
        // Return the full updated meeting object
        res.json({ meeting });
    }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start voting on a motion
app.post('/api/meetings/:meetingId/start-vote/:motionIndex', authMiddleware, async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const motionIndex = parseInt(req.params.motionIndex);
        if (motionIndex < 0 || motionIndex >= meeting.motionQueue.length) {
            return res.status(400).json({ message: 'Invalid motion index' });
        }

        // Set voting period (10 seconds for development)
        const votingEndsAt = new Date(Date.now() + 10000);
        meeting.motionQueue[motionIndex].status = 'voting';
        meeting.motionQueue[motionIndex].votingEndsAt = votingEndsAt;
        meeting.motionQueue[motionIndex].votes = { aye: 0, no: 0 };
        meeting.motionQueue[motionIndex].result = null; // Reset result

        await meeting.save();
        res.json(meeting.motionQueue[motionIndex]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to determine motion result
// Determine the outcome of a vote. Returns one of:
// 'approved' (aye > no), 'failed' (aye < no), 'tied' (aye == no), 'no-votes' (0 votes)
const determineMotionResult = (votes) => {
    const totalVotes = (votes?.aye || 0) + (votes?.no || 0);
    if (totalVotes === 0) return 'no-votes';
    if ((votes.aye || 0) === (votes.no || 0)) return 'tied';
    return (votes.aye || 0) > (votes.no || 0) ? 'approved' : 'failed';
};

// Complete voting on a motion
app.post('/api/meetings/:meetingId/complete-voting/:motionIndex', async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const motionIndex = parseInt(req.params.motionIndex);
        const motion = meeting.motionQueue[motionIndex];

        if (!motion || motion.status !== 'voting') {
            return res.status(400).json({ message: 'Motion is not currently in voting state' });
        }

        // Determine result and mark the motion with that final state.
        const result = determineMotionResult(motion.votes);
        // Set both status and result so clients can display final outcome.
        motion.status = result;
        motion.result = result;
        await meeting.save();

        res.json({
            motion,
            message: 'Voting completed successfully',
            result: motion.result,
            votes: motion.votes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit a vote
app.post('/api/meetings/:meetingId/vote/:motionIndex', authMiddleware, async (req, res) => {
    try {
        const { vote } = req.body; // 'aye' or 'no'
        const userId = req.user.id;

        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const motionIndex = parseInt(req.params.motionIndex);
        const motion = meeting.motionQueue[motionIndex];

        if (!motion || motion.status !== 'voting') {
            return res.status(400).json({ message: 'Motion is not currently accepting votes' });
        }

        if (new Date() > new Date(motion.votingEndsAt)) {
            // Voting window expired — compute final result and set status accordingly
            console.log("Setting the motion result");
            const final = determineMotionResult(motion.votes);
            motion.status = final; // e.g., 'approved', 'failed', 'tied', or 'no-votes'
            motion.result = final;
            await meeting.save();
            return res.status(400).json({ 
                message: 'Voting period has ended',
                result: motion.result,
                votes: motion.votes
            });
        }

        // Check if user has already voted
        if (motion.voterIds && motion.voterIds.includes(userId)) {
            return res.status(400).json({ message: 'You have already voted on this motion' });
        }

        // Initialize voterIds array if it doesn't exist
        if (!motion.voterIds) {
            motion.voterIds = [];
        }

        // Add user to voters list and increment vote count
        motion.voterIds.push(userId);
        motion.votes[vote]++;
        await meeting.save();
        
        res.json({ 
            votes: motion.votes,
            hasVoted: true,
            message: 'Vote recorded successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

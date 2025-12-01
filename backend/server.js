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
    joinCode: { type: String, unique: true }, // 6-character code for members to join
    chairman: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // meeting owner
    name: { type: String, required: true },
    description: String,
    datetime: String,
    currentAgendaIndex: { type: Number, default: 0 },
    currentMotionIndex: { type: Number, default: 0 },
    agenda: [String],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs
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

// Helper function to generate a random 6-character alphanumeric code
const generateJoinCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like 0, O, 1, I
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// This middleware will add the meetingId and joinCode after it's created.
meetingSchema.pre('save', async function(next) {
    if (this.isNew) {
        if (!this.meetingId) {
            this.meetingId = this._id.toString();
        }
        if (!this.joinCode) {
            // Generate unique join code
            let code;
            let isUnique = false;
            while (!isUnique) {
                code = generateJoinCode();
                const existing = await mongoose.model('Meeting').findOne({ joinCode: code });
                if (!existing) {
                    isUnique = true;
                }
            }
            this.joinCode = code;
        }
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
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, userId: user.id, email: user.email, role: user.role, name: user.name });
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

// Get users by IDs (for displaying participant info)
app.get('/api/users/by-ids', async (req, res) => {
    try {
        const ids = req.query.ids ? req.query.ids.split(',') : [];
        if (ids.length === 0) {
            return res.json([]);
        }
        const users = await User.find({ _id: { $in: ids } }).select('_id name email');
        res.json(users);
    } catch (error) {
        console.error('[GET] Error fetching users by IDs:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Get all users (for adding participants to meetings)
app.get('/api/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({}).select('_id name email role');
        res.json(users);
    } catch (error) {
        console.error('[GET] Error fetching users:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Get user by email (for adding participants by email)
app.get('/api/users/by-email/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select('_id name email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('[GET] Error fetching user by email:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Get meetings visible to the requesting user
app.get('/api/meetings', authMiddleware, async (req, res) => {
    try {
        console.log('[GET] Request received for meetings for user:', req.user.id);
        const userId = req.user.id;

        // Admins see all meetings
        if (req.user.role === 'admin') {
            const meetings = await Meeting.find({});
            return res.json(meetings);
        }

        // Return only meetings the user created (chairman) or already joined (participants)
        const meetings = await Meeting.find({ $or: [ { participants: userId }, { chairman: userId } ] });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Create a new meeting
app.post('/api/meetings', authMiddleware, async (req, res) => {
    try {
        console.log('[POST] Received data to create new meeting (user):', req.user.id, req.body);
        const meetingData = {
            ...req.body,
            chairman: req.user.id,
            participants: [req.user.id],
            agenda: ["Call to order", "Approval of previous minutes"],
            motionQueue: []
        };
        const meeting = new Meeting(meetingData);
        const newMeeting = await meeting.save();
        console.log('[POST] Successfully saved new meeting:', newMeeting);
        res.status(201).json(newMeeting);
    } catch (error) {
        console.error('[POST] Error saving meeting:', error.message);
        res.status(400).json({ message: error.message });
    }
});

// Delete a meeting
app.delete('/api/meetings/:meetingId', authMiddleware, async (req, res) => {
    console.log(`[DELETE] Attempting to delete meeting with _id: ${req.params.meetingId} by user ${req.user.id}`);
    try {
        const meeting = await Meeting.findById(req.params.meetingId);

        if (!meeting) {
            console.log(`[DELETE] Meeting with _id: ${req.params.meetingId} not found.`);
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Only admins or the meeting chairman can delete
        if (req.user.role !== 'admin' && String(meeting.chairman) !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this meeting' });
        }

        await Meeting.findByIdAndDelete(req.params.meetingId);
        console.log(`[DELETE] Successfully deleted meeting with _id: ${req.params.meetingId}`);

        res.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        console.error('[DELETE] Error deleting meeting:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Update meeting participants
app.put('/api/meetings/:meetingId/participants', authMiddleware, async (req, res) => {
    try {
        const { participants } = req.body; // Array of user IDs
        console.log(`[PUT] Updating participants for meeting ${req.params.meetingId}:`, participants);

        const meeting = await Meeting.findById(req.params.meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Only admins or the meeting chairman can update participants
        if (req.user.role !== 'admin' && String(meeting.chairman) !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update participants' });
        }

        meeting.participants = participants;
        await meeting.save();

        res.json(meeting);
    } catch (error) {
        console.error('[PUT] Error updating participants:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Join a meeting using the 6-character code
app.post('/api/meetings/join', authMiddleware, async (req, res) => {
    try {
        const { joinCode } = req.body;
        const userId = req.user.id;
        
        if (!joinCode || joinCode.length !== 6) {
            return res.status(400).json({ message: 'Invalid join code' });
        }
        
        const meeting = await Meeting.findOne({ joinCode: joinCode.toUpperCase() });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        
        // Check if user is already a participant
        if (meeting.participants.includes(userId)) {
            return res.status(400).json({ message: 'You are already a participant of this meeting' });
        }
        
        // Add user to participants
        meeting.participants.push(userId);
        await meeting.save();
        
        console.log(`[POST] User ${userId} joined meeting ${meeting._id} with code ${joinCode}`);
        res.json({ message: 'Successfully joined meeting', meeting });
    } catch (error) {
        console.error('[POST] Error joining meeting:', error.message);
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
app.get('/api/meetings/:meetingId', authMiddleware, async (req, res) => {
    try {
        let meeting = await Meeting.findOne({ meetingId: req.params.meetingId })
            .populate('participants', '_id name email'); // Populate participant details
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        
        // Check if user is authorized to access this meeting
        const userId = req.user.id;
        const userRole = req.user.role;
        const isChairman = String(meeting.chairman) === userId;
        const isParticipant = meeting.participants.some(p => String(p._id) === userId);
        
        // Admins, chairman, and participants can access
        if (userRole !== 'admin' && !isChairman && !isParticipant) {
            return res.status(403).json({ message: 'You are not authorized to access this meeting' });
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

        // Fetch the meeting first so we can check whether the requester is the meeting's chairman
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Allow admins, accounts with role 'chairman', or the meeting's recorded chairman (creator)
        const isMeetingChair = String(meeting.chairman) === req.user.id;
        if (req.user.role !== 'admin' && req.user.role !== 'chairman' && !isMeetingChair) {
            return res.status(403).json({ message: 'Unauthorized: Only chairman/admin or meeting owner can review motions' });
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

        // Set voting period (45 seconds)
        const votingEndsAt = new Date(Date.now() + 45000);
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

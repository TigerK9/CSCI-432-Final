const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ msg: 'No Authorization header found' });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ msg: 'No token found in Authorization header' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ msg: 'Server configuration error' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.user) {
            return res.status(401).json({ msg: 'Invalid token format' });
        }

        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(401).json({ msg: 'Token verification failed', error: err.message });
    }
};

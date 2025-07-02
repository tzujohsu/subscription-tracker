import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import TokenBlacklist from '../models/tokenBlacklist.model.js';
import { JWT_SECRET } from '../config/env.js';


const authorize = async (req, res, next) => {
    try {
        // Authorization: protecting certain routes by allowing only specific authorized users to access them

        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }
        if(!token) return res.status(401).json({message: 'Unauthorized'});

        // Check if token is blacklisted
        const blacklistedToken = await TokenBlacklist.findOne({ token });
        if(blacklistedToken) {
            return res.status(401).json({message: 'Token has been invalidated'});
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.user_Id);

        if(!user) return res.status(401).json({message: 'Unauthorized'});

        req.user = user;
        next();


    } catch (error) {
        res.status(401).json({message: 'Unauthorized', error: error.message});
    }
}

export default authorize;
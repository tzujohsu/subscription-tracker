import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';
// request body: is an object containing the data sent by the client (POST)

export const signUp = async (req, res, next) => {
    // Implement sign up logic
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create a new user
        const { name, email, password } = req.body;

        // Check if a user already exists
        const existingUser = await User.findOne( { email });

        if(existingUser){
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUsers = await User.create([{ name, email, password: hashedPassword }], { session });
        console.log(newUsers);
        const token = jwt.sign({ user_Id: newUsers[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUsers[0], 
            }
        })


    } catch(error) {
        // at any point, if there is an error we abort the transaction and end the session
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    // Implement sign in logic
    try {
        const { email, password } = req.body;
        const user = await User.findOne( { email });

        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ user_Id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token,
                user,
            }
        });
        
        
    } catch (error) {
        next(error);
    }
}

export const signOut = async (req, res, next) => {
    // Implement sign out logic
}

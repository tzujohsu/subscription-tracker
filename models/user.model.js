import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, 'User Name is required'],
        trim: true,
        userLength: 2,
        maxLength: 30,
    },
    email: {
        type: String,
        required: [true, 'User Email is required'],
        trim: true,
        lowercase:true,
        match: [/\S+@\S+\.\S+/, 'Please fill a vaild email address']
    },
    password: {
        type: String,
        required: [true, 'User Password is required'],
        minLength: 6,
    }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;
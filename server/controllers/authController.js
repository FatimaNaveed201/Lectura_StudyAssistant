const User = require('../models/userModel')
const createError = require('../utils/apperror');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'secretkey123';


// Register a new user
exports.signup = async (req, res, next) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return next(new createError("User already exists", 400));
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        const newUser = await User.create({
            ...req.body,
            password: hashedPassword,
        });

        // ✅ Use newUser to generate the token
        const token = jwt.sign({ _id: newUser._id }, jwtSecret, { expiresIn: '90d' });

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }
        });

    } catch (error) {
        next(error);
    }
};


// Login an existing user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return next(new createError("User not found", 404));

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return next(new createError("Invalid email or password", 401));
        }

        //json web token
        const token = jwt.sign({ _id: user._id }, jwtSecret, { expiresIn: '90d' });


        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token,
            user:{
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        next(error);
    }
};
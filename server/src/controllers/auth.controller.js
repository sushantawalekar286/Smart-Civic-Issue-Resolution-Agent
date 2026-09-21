const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
  res.cookie('jwt', token, options);
};

exports.register = async (req, res, next) => {
  try {
    const name = (req.body.name || `${req.body.firstName || ''} ${req.body.lastName || ''}`).trim();
    const { email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email and password');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      res.status(400);
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'citizen',
    });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      res.status(401);
      throw new Error('User account is deactivated');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    user.lastLoginAt = Date.now();
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('jwt', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

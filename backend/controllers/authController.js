import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_super_secret_key_1234', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, address, city, state, country, bankName, accountNumber, ifscCode, accountHolder } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username, email, password,
      fullName: fullName || '',
      phone: phone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      country: country || '',
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode || '',
      accountHolder: accountHolder || '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, city, state, country, bankName, accountNumber, ifscCode, accountHolder } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fullName = fullName ?? user.fullName;
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;
    user.city = city ?? user.city;
    user.state = state ?? user.state;
    user.country = country ?? user.country;
    user.bankName = bankName ?? user.bankName;
    user.accountNumber = accountNumber ?? user.accountNumber;
    user.ifscCode = ifscCode ?? user.ifscCode;
    user.accountHolder = accountHolder ?? user.accountHolder;

    await user.save();
    const updated = await User.findById(req.user._id).select('-password');
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { username, email, newPassword } = req.body;

    if (!username || !email || !newPassword) {
      return res.status(400).json({ message: 'Username, email, and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    // Verify the user owns the account by matching both username AND email
    const user = await User.findOne({ username, email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that username and email combination.' });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


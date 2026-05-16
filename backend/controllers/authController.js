import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_super_secret_key_1234', {
    expiresIn: '30d',
  });
};

// ── Email transporter is created lazily inside sendOtp so it always
// reads the correct dotenv values after the server has fully started.
// ── Register ─────────────────────────────────────────────────────────────────
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

// ── Login ─────────────────────────────────────────────────────────────────────
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

// ── Get Profile ───────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, city, state, country, bankName, accountNumber, ifscCode, accountHolder } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fullName      = fullName      ?? user.fullName;
    user.phone         = phone         ?? user.phone;
    user.address       = address       ?? user.address;
    user.city          = city          ?? user.city;
    user.state         = state         ?? user.state;
    user.country       = country       ?? user.country;
    user.bankName      = bankName      ?? user.bankName;
    user.accountNumber = accountNumber ?? user.accountNumber;
    user.ifscCode      = ifscCode      ?? user.ifscCode;
    user.accountHolder = accountHolder ?? user.accountHolder;

    await user.save();
    const updated = await User.findById(req.user._id).select('-password');
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Send OTP ──────────────────────────────────────────────────────────────────
export const sendOtp = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required.' });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'No account found with that username.' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpiry = expiry;
    await user.save();

    // Create transporter fresh each time so env vars are always loaded
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('Sending OTP email via:', process.env.EMAIL_USER);

    // Send email
    await transporter.sendMail({
      from: `"AUTOmax 🏎️" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your AUTOmax Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #05090f; color: #fff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1a1000, #3a2a00); padding: 2rem; text-align: center; border-bottom: 1px solid #D4AF37;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 2rem; letter-spacing: 2px;">AUTOmax</h1>
            <p style="color: rgba(255,255,255,0.5); margin: 4px 0 0; font-style: italic;">Password Reset Request</p>
          </div>
          <div style="padding: 2rem; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 1.5rem;">Hi <strong style="color:#D4AF37">${user.username}</strong>, use the OTP below to reset your password:</p>
            <div style="background: rgba(212,175,55,0.1); border: 2px solid #D4AF37; border-radius: 12px; padding: 1.5rem; display: inline-block; margin: 0 auto;">
              <span style="font-size: 2.5rem; font-weight: 700; letter-spacing: 8px; color: #D4AF37;">${otp}</span>
            </div>
            <p style="color: rgba(255,255,255,0.4); font-size: 0.85rem; margin-top: 1.5rem;">⏱️ This OTP expires in <strong>10 minutes</strong>.</p>
            <p style="color: rgba(255,255,255,0.3); font-size: 0.8rem;">If you didn't request this, ignore this email. Your account is safe.</p>
          </div>
        </div>
      `,
    });

    // Mask the email for privacy: show only first 2 chars + domain
    const [localPart, domain] = user.email.split('@');
    const maskedEmail = localPart.slice(0, 2) + '****@' + domain;

    res.json({ message: `OTP sent to ${maskedEmail}`, maskedEmail });
  } catch (error) {
    console.error('sendOtp error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please check email configuration.' });
  }
};

// ── Verify OTP & Reset Password ───────────────────────────────────────────────
export const verifyOtpAndReset = async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;

    if (!username || !otp || !newPassword) {
      return res.status(400).json({ message: 'Username, OTP, and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }
    if (new Date() > new Date(user.resetOtpExpiry)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Reset password and clear OTP
    user.password = newPassword; // pre-save hook hashes it
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const db = require("../config/db");
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await UserModel.create({ name, email, hashedPassword });
    const token = generateToken(userId, 'user');

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email, role: 'user' }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // Check if user already exists
    let user = await UserModel.findByEmail(email);

    if (!user) {
      // Create new user with default role 'user', no password
      const [result] = await db.query(
        `INSERT INTO users (name, email, google_id, password, role, avatar)
         VALUES (?, ?, ?, NULL, 'user', ?)`,
        [name, email, googleId, picture || null]
      );

      user = {
        id: result.insertId,
        name,
        email,
        role: 'user',
        avatar: picture || null,
      };
    } else if (!user.google_id) {
      // Existing email/password user signing in with Google for the first time
      await db.query(
        `UPDATE users SET google_id = ? WHERE id = ?`,
        [googleId, user.id]
      );
    }

    const appToken = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Google authentication successful',
      token: appToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      }
    });

  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "No account found with that email."
      });
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      `UPDATE users
       SET reset_token = ?, reset_token_expiry = ?
       WHERE id = ?`,
      [token, expiry, user.id]
    );

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const html = `
      <h2>Password Reset</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn't request this, ignore this email.</p>
    `;

    await sendEmail(email, "Reset Your Password", html);

    res.json({ message: "Password reset link sent successfully." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const [users] = await db.query(
      `SELECT * FROM users
       WHERE reset_token = ?
       AND reset_token_expiry > NOW()`,
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users
       SET password = ?,
           reset_token = NULL,
           reset_token_expiry = NULL
       WHERE id = ?`,
      [hashedPassword, user.id]
    );

    res.json({ message: "Password reset successful." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getProfile,
  forgotPassword,
  resetPassword,
};

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendActivationEmail, sendPasswordResetEmail } = require('../config/email');
const auth = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user (inactive by default)
    const user = new User({
      firstName,
      lastName,
      email,
      password
    });

    // Generate activation token
    const activationToken = user.generateActivationToken();
    await user.save();

    // Send activation email
    try {
      await sendActivationEmail(user, activationToken);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Registration successful but failed to send activation email. Please contact support.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to activate your account.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   GET /api/auth/activate/:token
// @desc    Activate user account
router.get('/activate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Activation token is required'
      });
    }

    // Hash token to compare with database
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      activationToken: hashedToken,
      activationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired activation token'
      });
    }

    // Activate user
    user.isActive = true;
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Account activated successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during activation'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with password and isActive fields
    const user = await User.findOne({ email }).select('+password +isActive');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account not activated. Please check your email.'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    // Fetch full user data including storageUsed
    const fullUser = await User.findById(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: fullUser._id,
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        email: fullUser.email,
        storageUsed: fullUser.storageUsed || 0,
        isActive: fullUser.isActive,
        createdAt: fullUser.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // if (!user.isActive) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Account not activated. Please check your email first.'
    //   });
    // }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
      console.error('Email error code:', emailError.code);
      console.error('Email error response:', emailError.response);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent. Please check your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

// @route   POST /api/auth/resend-activation
// @desc    Resend activation email
router.post('/resend-activation', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is already activated.'
      });
    }

    // Generate new activation token
    const activationToken = user.generateActivationToken();
    await user.save();

    // Send activation email
    try {
      await sendActivationEmail(user, activationToken);
      res.json({
        success: true,
        message: 'Activation email sent. Please check your email.'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send activation email. Please contact support.'
      });
    }
  } catch (error) {
    console.error('Resend activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during activation resend'
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { token } = req.params;
    const { password } = req.body;

    // Hash token to compare with database
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential, email, firstName, lastName, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Email and Google ID are required'
      });
    }

    // Optional: Verify the credential token with Google
    if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        // Token is valid, payload contains user info
      } catch (verifyError) {
        console.log('Token verification skipped or failed:', verifyError.message);
        // Continue anyway if verification fails (for development)
      }
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google account
      user = new User({
        firstName: firstName || 'User',
        lastName: lastName || '',
        email,
        password: Math.random().toString(36).slice(-12) + 'Aa1!', // Random password
        isActive: true, // Google accounts are pre-verified
        googleId
      });
      await user.save();
    } else {
      // Update existing user with Google ID and activate if needed
      if (!user.isActive) {
        user.isActive = true;
      }
      if (!user.googleId) {
        user.googleId = googleId;
      }
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        storageUsed: user.storageUsed || 0,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
        storageUsed: user.storageUsed,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
});

module.exports = router;

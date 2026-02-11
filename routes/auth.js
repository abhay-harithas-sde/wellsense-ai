// AAP Authentication Routes
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { userSchemas, validate } = require('../lib/validation');
const { logger } = require('../lib/logger');

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email
    },
    process.env.JWT_SECRET || 'wellsense-super-secret-jwt-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper: Hash Password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Helper: Compare Password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// POST /api/auth/check-email - Check if email exists
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    res.json({
      success: true,
      exists: !!user,
      message: user ? 'User exists' : 'User not found'
    });
    
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check email'
    });
  }
});

// POST /api/auth/register - Traditional registration
router.post('/register', validate(userSchemas.register), async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.validatedData;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please login instead.'
      });
    }
    
    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        isActive: true,
        isVerified: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phoneNumber: true,
        profileImage: true,
        location: true,
        bio: true,
        heightCm: true,
        weight: true,
        height: true,
        age: true,
        bmi: true,
        bmiCategory: true,
        preferredUnits: true,
        timezone: true,
        language: true,
        isActive: true,
        isVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Generate token
    const token = generateToken(user);
    
    console.log('✅ New user registered:', user.email);
    
    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// POST /api/auth/login - Traditional login
router.post('/login', validate(userSchemas.login), async (req, res) => {
  try {
    const { email, password } = req.validatedData;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        shouldSignUp: true // Hint to frontend
      });
    }
    
    // Check if user has password (not OAuth-only)
    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in with Google'
      });
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    // Generate token
    const token = generateToken(user);
    
    // Get complete user data with health fields
    const completeUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phoneNumber: true,
        profileImage: true,
        location: true,
        bio: true,
        heightCm: true,
        weight: true,
        height: true,
        age: true,
        bmi: true,
        bmiCategory: true,
        preferredUnits: true,
        timezone: true,
        language: true,
        isActive: true,
        isVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log('✅ User logged in:', completeUser.email, '| Has health data:', {
      weight: !!completeUser.weight,
      height: !!completeUser.height,
      bmi: !!completeUser.bmi
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: completeUser
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// POST /api/auth/google/verify - Google Sign-In verification
router.post('/google/verify', async (req, res) => {
  try {
    const { credential, isSignUp } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub: googleId } = payload;
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (user) {
      // User exists - LOGIN
      
      // Update Google ID if not set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId,
            profileImage: picture || user.profileImage,
            lastLoginAt: new Date()
          }
        });
      } else {
        // Just update last login
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
      }
      
      // Generate token
      const token = generateToken(user);
      
      // Return user without password
      const { passwordHash, ...userWithoutPassword } = user;
      
      return res.json({
        success: true,
        message: 'Login successful',
        isNewUser: false,
        data: {
          token,
          user: userWithoutPassword
        }
      });
      
    } else {
      // User doesn't exist - SIGNUP
      
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          googleId,
          firstName: given_name || '',
          lastName: family_name || '',
          profileImage: picture,
          isActive: true,
          isVerified: true, // Google accounts are pre-verified
          emailVerifiedAt: new Date()
        }
      });
      
      // Generate token
      const token = generateToken(user);
      
      // Return user without password
      const { passwordHash, ...userWithoutPassword } = user;
      
      return res.json({
        success: true,
        message: 'Account created successfully',
        isNewUser: true,
        needsProfileCompletion: true,
        data: {
          token,
          user: userWithoutPassword
        }
      });
    }
    
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
});

// GET /api/auth/google - OAuth redirect (fallback)
router.get('/google', (req, res) => {
  const { type = 'signin' } = req.query;
  
  const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/google/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile&` +
    `state=${type}`;
  
  res.redirect(authUrl);
});

// GET /api/auth/google/callback - Handle OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    console.log('📥 Google OAuth callback received:', { 
      hasCode: !!code, 
      hasError: !!error,
      state 
    });
    
    if (error) {
      console.error('❌ Google OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=${encodeURIComponent('Google authentication failed')}`);
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=${encodeURIComponent('No authorization code received')}`);
    }
    
    console.log('🔄 Exchanging code for tokens...');
    
    // Exchange code for tokens
    const { OAuth2Client } = require('google-auth-library');
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    console.log('✅ Tokens received, verifying ID token...');
    
    // Verify the ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub: googleId } = payload;
    
    console.log('✅ ID token verified for:', email);
    console.log('🔍 Checking if user exists in database...');
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (user) {
      console.log('✅ User found, updating login time...');
      // User exists - LOGIN
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId,
            profileImage: picture || user.profileImage,
            lastLoginAt: new Date()
          }
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
      }
      console.log('✅ User logged in:', user.email);
    } else {
      console.log('📝 Creating new user...');
      // User doesn't exist - SIGNUP
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          googleId,
          firstName: given_name || '',
          lastName: family_name || '',
          profileImage: picture,
          isActive: true,
          isVerified: true,
          emailVerifiedAt: new Date()
        }
      });
      console.log('✅ New user created:', user.email);
    }
    
    // Generate JWT token
    const token = generateToken(user);
    console.log('✅ JWT token generated');
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log('🔄 Redirecting to frontend with token...');
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&provider=google`);
    
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent('Authentication failed: ' + error.message)}`);
  }
});

  // GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wellsense-super-secret-jwt-key');
    
    // Get user with all fields including health data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phoneNumber: true,
        profileImage: true,
        location: true,
        bio: true,
        heightCm: true,
        weight: true,
        height: true,
        age: true,
        bmi: true,
        bmiCategory: true,
        preferredUnits: true,
        timezone: true,
        language: true,
        isActive: true,
        isVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ User data fetched for:', user.email, '| Has health data:', {
      weight: !!user.weight,
      height: !!user.height,
      bmi: !!user.bmi
    });
    
    res.json({
      success: true,
      data: {
        user
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can add token blacklisting here if needed
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    console.log('[Profile Update] Request received:', {
      body: req.body,
      headers: req.headers.authorization ? 'Token present' : 'No token'
    });
    
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      console.log('[Profile Update] Error: No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'wellsense-super-secret-jwt-key');
      console.log('[Profile Update] Token verified for user:', decoded.id);
    } catch (error) {
      console.log('[Profile Update] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    // Extract only valid fields from request body
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      profileImage,
      heightCm,
      weight,
      height,
      age,
      bmi,
      bmiCategory,
      preferredUnits,
      timezone,
      language,
      location,
      bio
    } = req.body;
    
    // Build update data object with only provided fields
    const updateData = {};
    
    try {
      if (firstName !== undefined && firstName !== null) updateData.firstName = String(firstName);
      if (lastName !== undefined && lastName !== null) updateData.lastName = String(lastName);
      if (dateOfBirth !== undefined && dateOfBirth !== null) {
        updateData.dateOfBirth = new Date(dateOfBirth);
      }
      if (gender !== undefined && gender !== null) {
        const validGenders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];
        const upperGender = String(gender).toUpperCase();
        if (validGenders.includes(upperGender)) {
          updateData.gender = upperGender;
        }
      }
      if (phoneNumber !== undefined && phoneNumber !== null) updateData.phoneNumber = String(phoneNumber);
      if (profileImage !== undefined && profileImage !== null) updateData.profileImage = String(profileImage);
      if (location !== undefined && location !== null) updateData.location = String(location);
      if (bio !== undefined && bio !== null) updateData.bio = String(bio);
      if (heightCm !== undefined && heightCm !== null) {
        const heightValue = parseFloat(heightCm);
        if (!isNaN(heightValue) && heightValue > 0) {
          updateData.heightCm = heightValue;
          updateData.height = heightValue; // Also update height field
        }
      }
      if (height !== undefined && height !== null) {
        const heightValue = parseFloat(height);
        if (!isNaN(heightValue) && heightValue > 0) {
          updateData.height = heightValue;
          updateData.heightCm = heightValue; // Also update heightCm field
        }
      }
      if (weight !== undefined && weight !== null) {
        const weightValue = parseFloat(weight);
        if (!isNaN(weightValue) && weightValue > 0) {
          updateData.weight = weightValue;
        }
      }
      if (age !== undefined && age !== null) {
        const ageValue = parseInt(age);
        if (!isNaN(ageValue) && ageValue > 0) {
          updateData.age = ageValue;
        }
      }
      if (bmi !== undefined && bmi !== null) {
        const bmiValue = parseFloat(bmi);
        if (!isNaN(bmiValue) && bmiValue > 0) {
          updateData.bmi = bmiValue;
        }
      }
      if (bmiCategory !== undefined && bmiCategory !== null) {
        updateData.bmiCategory = String(bmiCategory);
      }
      if (preferredUnits !== undefined && preferredUnits !== null) {
        const validUnits = ['METRIC', 'IMPERIAL', 'MIXED'];
        const upperUnits = String(preferredUnits).toUpperCase();
        if (validUnits.includes(upperUnits)) {
          updateData.preferredUnits = upperUnits;
        }
      }
      if (timezone !== undefined && timezone !== null) updateData.timezone = String(timezone);
      if (language !== undefined && language !== null) updateData.language = String(language);
      
      // Always update the updatedAt timestamp
      updateData.updatedAt = new Date();
      
      console.log('[Profile Update] Update data prepared:', updateData);
      
    } catch (error) {
      console.log('[Profile Update] Data preparation error:', error.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        error: error.message
      });
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phoneNumber: true,
        profileImage: true,
        heightCm: true,
        preferredUnits: true,
        timezone: true,
        language: true,
        location: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log('[Profile Update] Success for user:', decoded.id);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
    
  } catch (error) {
    console.error('[Profile Update] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router;

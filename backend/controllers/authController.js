import User from '../models/User.js';
import Organization from '../models/Organization.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid'; // We might need to install uuid or just use crypto

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate simple Invite Code
const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const register = async (req, res) => {
  const { name, email, password, orgName, inviteCode } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      organizations: []
    });

    if (user) {
      // 1. Handle explicit Org Creation
      if (orgName) {
        const newCode = generateInviteCode();
        const org = await Organization.create({
          name: orgName,
          inviteCode: newCode,
          owner: user._id,
          members: [user._id]
        });
        user.organizations.push(org._id);
      }

      // 2. Handle Joining via Invite Code
      if (inviteCode) {
        const orgToJoin = await Organization.findOne({ inviteCode });
        if (orgToJoin) {
          if (!orgToJoin.members.includes(user._id)) {
             orgToJoin.members.push(user._id);
             // Remove from pending if exists
             orgToJoin.pendingInvites = orgToJoin.pendingInvites.filter(e => e !== email);
             await orgToJoin.save();
             user.organizations.push(orgToJoin._id);
          }
        }
      }

      // 3. Auto-join pending invites
      const pendingOrgs = await Organization.find({ pendingInvites: email });
      for (const org of pendingOrgs) {
        if (!org.members.includes(user._id)) {
          org.members.push(user._id);
          org.pendingInvites = org.pendingInvites.filter(e => e !== email);
          await org.save();
          user.organizations.push(org._id);
        }
      }

      await user.save();

      // Return response
      const populatedUser = await User.findById(user._id).populate('organizations', 'name inviteCode');
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        organizations: populatedUser.organizations,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const populatedUser = await User.findById(user._id).populate('organizations', 'name inviteCode');
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        organizations: populatedUser.organizations,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
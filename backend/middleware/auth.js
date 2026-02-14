import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const checkOrgAccess = async (req, res, next) => {
  const orgId = req.headers['x-org-id'] || req.query.organizationId || req.body.organizationId;

  if (!orgId) {
    return res.status(400).json({ message: 'Organization ID is required in headers (x-org-id)' });
  }

  try {
    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isMember = org.members.some(memberId => memberId.toString() === req.user._id.toString());
    
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to access this organization' });
    }

    req.organizationId = orgId;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying organization access' });
  }
};
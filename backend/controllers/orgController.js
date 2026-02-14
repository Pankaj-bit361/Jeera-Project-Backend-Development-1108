import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { sendInviteEmail } from '../utils/email.js';

const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const createOrganization = async (req, res) => {
  const { name } = req.body;
  try {
    const org = await Organization.create({
      name,
      inviteCode: generateInviteCode(),
      owner: req.user._id,
      members: [req.user._id]
    });

    req.user.organizations.push(org._id);
    await req.user.save();

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const joinOrganization = async (req, res) => {
  const { inviteCode } = req.body;
  try {
    const org = await Organization.findOne({ inviteCode });
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (org.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    org.members.push(req.user._id);
    // cleanup pending
    org.pendingInvites = org.pendingInvites.filter(email => email !== req.user.email);
    await org.save();

    req.user.organizations.push(org._id);
    await req.user.save();

    res.json({ message: 'Joined successfully', organization: org });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getUserOrganizations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('organizations');
    res.json(user.organizations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const inviteMember = async (req, res) => {
    const { email } = req.body;
    const orgId = req.organizationId;
  
    try {
      const org = await Organization.findById(orgId);
      const userToInvite = await User.findOne({ email });
  
      if (userToInvite) {
        // User exists in system
        if (org.members.includes(userToInvite._id)) {
          return res.status(400).json({ message: 'User is already a member' });
        }
        
        // Directly add them (Or usually you'd send a notification, but req says "directly add" or "invite code")
        // The prompt says: "If user exists → directly add"
        org.members.push(userToInvite._id);
        userToInvite.organizations.push(org._id);
        await userToInvite.save();
        await org.save();
        
        // Send notification email anyway
        await sendInviteEmail(email, org.name, org.inviteCode);
        
        return res.json({ message: 'User added to organization' });
      } else {
        // User does not exist
        if (!org.pendingInvites.includes(email)) {
            org.pendingInvites.push(email);
            await org.save();
        }
        
        await sendInviteEmail(email, org.name, org.inviteCode);
        return res.json({ message: 'Invitation sent' });
      }
    } catch (error) {
        console.error(error)
      res.status(500).json({ message: 'Server Error' });
    }
  };

export const getOrgMembers = async (req, res) => {
    const orgId = req.organizationId;
    try {
        const org = await Organization.findById(orgId).populate('members', 'name email');
        res.json(org.members);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
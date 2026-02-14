import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pendingInvites: [{
    type: String, // Storing emails of invited users who haven't joined yet
    lowercase: true,
    trim: true
  }]
}, { timestamps: true });

export default mongoose.model('Organization', organizationSchema);
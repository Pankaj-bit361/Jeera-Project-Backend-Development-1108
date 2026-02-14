import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  organizations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
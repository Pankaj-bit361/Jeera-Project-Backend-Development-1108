import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Done'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  sprintPoints: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String 
  }],
  // Time Tracking Summary
  timeSpent: {
    type: Number, // Total in seconds
    default: 0
  },
  // Detailed Time Logs for Charts
  timeLogs: [{
    startTime: Date,
    endTime: Date,
    duration: Number, // seconds
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  sprintIndex: {
    type: Number,
    default: 1
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    text: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Task', taskSchema);
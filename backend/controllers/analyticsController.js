import Task from '../models/Task.js';
import User from '../models/User.js';

export const getStats = async (req, res) => {
  try {
    const orgId = req.organizationId;

    const totalTasks = await Task.countDocuments({ organization: orgId });
    const completedTasks = await Task.countDocuments({ organization: orgId, status: 'Done' });
    const pendingTasks = await Task.countDocuments({ organization: orgId, status: { $ne: 'Done' } });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskDistribution = async (req, res) => {
  try {
    const orgId = req.organizationId;

    // Aggregate tasks by assignee
    const distribution = await Task.aggregate([
      { $match: { organization: new mongoose.Types.ObjectId(orgId) } },
      { $group: { _id: '$assignee', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { 
          name: { $ifNull: ['$user.name', 'Unassigned'] }, 
          count: 1 
        } 
      }
    ]);

    res.json(distribution);
  } catch (error) {
    // Import mongoose inside function if needed or top level. 
    // Mongoose is imported in models, but we need mongoose.Types here.
    // Let's assume top level import in this file.
    res.status(500).json({ message: error.message });
  }
};

export const getPerformance = async (req, res) => {
  try {
    const orgId = req.organizationId;

    const performance = await Task.aggregate([
      { $match: { organization: new mongoose.Types.ObjectId(orgId), status: 'Done' } },
      { $group: { _id: '$assignee', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { 
          name: { $ifNull: ['$user.name', 'Deleted User'] }, 
          completedCount: 1 
        } 
      }
    ]);

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Need to add mongoose import for aggregation ObjectId casting
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getStats = async (req, res) => {
  try {
    const orgId = req.organizationId;
    const totalTasks = await Task.countDocuments({ organization: orgId });
    const completedTasks = await Task.countDocuments({ organization: orgId, status: 'Done' });
    const pendingTasks = await Task.countDocuments({ organization: orgId, status: { $ne: 'Done' } });

    res.json({ totalTasks, completedTasks, pendingTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskDistribution = async (req, res) => {
  try {
    const orgId = req.organizationId;
    // Aggregate tasks by assignee and SUM sprint points
    const distribution = await Task.aggregate([
      { $match: { organization: new mongoose.Types.ObjectId(orgId) } },
      { 
        $group: { 
          _id: '$assignee', 
          count: { $sum: 1 },
          totalPoints: { $sum: '$sprintPoints' } // Summing sprint points (Weight)
        } 
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { 
        $project: { 
          name: { $ifNull: ['$user.name', 'Unassigned'] },
          count: 1,
          totalPoints: 1,
          userId: '$_id'
        } 
      }
    ]);

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPerformance = async (req, res) => {
  try {
    const orgId = req.organizationId;
    const performance = await Task.aggregate([
      { $match: { organization: new mongoose.Types.ObjectId(orgId), status: 'Done' } },
      { 
        $group: { 
          _id: '$assignee', 
          count: { $sum: 1 },
          totalPoints: { $sum: '$sprintPoints' }
        } 
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { 
        $project: { 
          name: { $ifNull: ['$user.name', 'Deleted User'] },
          completedCount: '$count',
          completedPoints: '$totalPoints'
        } 
      }
    ]);

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
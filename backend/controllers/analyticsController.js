import Task from '../models/Task.js';
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
    const distribution = await Task.aggregate([
      { $match: { organization: new mongoose.Types.ObjectId(orgId) } },
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

export const getActivityTimeline = async (req, res) => {
    try {
        const orgId = req.organizationId;
        const now = new Date();
        // Get start of current week (Monday)
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
        const monday = new Date(now.setDate(diff));
        monday.setHours(0,0,0,0);
        
        const endOfWeek = new Date(monday);
        endOfWeek.setDate(monday.getDate() + 7);

        const activity = await Task.aggregate([
            { $match: { organization: new mongoose.Types.ObjectId(orgId) } },
            { $unwind: '$timeLogs' },
            { 
                $match: { 
                    'timeLogs.startTime': { $gte: monday, $lt: endOfWeek } 
                } 
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$timeLogs.startTime' }, // 1 (Sun) to 7 (Sat)
                    totalSeconds: { $sum: '$timeLogs.duration' }
                }
            }
        ]);

        // Map Mongo dayOfWeek (1=Sun, 2=Mon) to our chart format
        // We want Mon, Tue, Wed...
        const map = { 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat', 1: 'Sun' };
        const result = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

        activity.forEach(item => {
            const dayName = map[item._id];
            if (dayName) result[dayName] = Math.round(item.totalSeconds / 60); // Minutes
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
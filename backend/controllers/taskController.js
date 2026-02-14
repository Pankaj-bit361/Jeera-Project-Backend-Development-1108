import Task from '../models/Task.js';
import Organization from '../models/Organization.js';

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, sprintPoints, startDate, dueDate } = req.body;
    const org = await Organization.findById(req.organizationId);
    
    // Calculate Sprint Index based on Monday-start weeks
    const taskStart = startDate ? new Date(startDate) : new Date();
    const orgStart = new Date(org.createdAt);
    
    // Adjust orgStart to the previous Monday
    const day = orgStart.getDay();
    const diff = orgStart.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const orgMonday = new Date(orgStart.setDate(diff));
    orgMonday.setHours(0,0,0,0);

    const diffTime = Math.abs(taskStart - orgMonday);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const sprintIndex = Math.floor(diffDays / 7) + 1;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      sprintPoints: sprintPoints || 0,
      assignee: assignee || null,
      organization: req.organizationId,
      createdBy: req.user._id,
      startDate: taskStart,
      dueDate: dueDate,
      sprintIndex: sprintIndex
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { status, priority, assignee, sprint } = req.query;
    const query = { organization: req.organizationId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;
    if (sprint) query.sprintIndex = sprint;

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const query = { organization: req.organizationId, assignee: req.user._id };
    const tasks = await Task.find(query).sort({ priority: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      req.body,
      { new: true }
    ).populate('assignee', 'name email');
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, organization: req.organizationId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findOne({ _id: req.params.id, organization: req.organizationId });
    task.comments.push({ text, user: req.user._id });
    await task.save();
    const populated = await Task.findById(task._id).populate('comments.user', 'name');
    res.json(populated.comments[populated.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Log Time Session
export const logTime = async (req, res) => {
    try {
        const { duration, startTime, endTime } = req.body;
        const task = await Task.findOne({ _id: req.params.id, organization: req.organizationId });
        
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.timeSpent = (task.timeSpent || 0) + duration;
        task.timeLogs.push({
            startTime,
            endTime,
            duration,
            user: req.user._id
        });

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
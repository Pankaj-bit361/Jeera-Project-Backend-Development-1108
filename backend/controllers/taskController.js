import Task from '../models/Task.js';
import Organization from '../models/Organization.js';

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, sprintPoints, startDate, dueDate } = req.body;
    
    // Fetch Organization to calculate Sprint
    const org = await Organization.findById(req.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const taskStart = startDate ? new Date(startDate) : new Date();
    const orgStart = new Date(org.createdAt);
    
    // Calculate Sprint Index: (Days since Org Creation / 7) + 1
    const diffTime = Math.abs(taskStart - orgStart);
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

// Get All Tasks (with Filtering)
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

// Get My Tasks
export const getMyTasks = async (req, res) => {
  try {
    const query = {
      organization: req.organizationId,
      assignee: req.user._id
    };
    const tasks = await Task.find(query).sort({ priority: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update Task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // If startDate changes, recalculate Sprint (Optional, usually sprints are fixed on creation, but let's allow update)
    let updateData = { ...req.body };
    if (req.body.startDate) {
         const org = await Organization.findById(req.organizationId);
         const taskStart = new Date(req.body.startDate);
         const orgStart = new Date(org.createdAt);
         const diffTime = Math.abs(taskStart - orgStart);
         const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
         updateData.sprintIndex = Math.floor(diffDays / 7) + 1;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assignee', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, organization: req.organizationId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = {
      text,
      user: req.user._id,
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();

    const populatedTask = await Task.findById(task._id).populate('comments.user', 'name');
    const newComment = populatedTask.comments[populatedTask.comments.length - 1];

    res.json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import Task from '../models/Task.js';

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, sprintPoints } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      sprintPoints: sprintPoints || 0,
      assignee: assignee || null, // Can be null if unassigned
      organization: req.organizationId,
      createdBy: req.user._id
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Tasks (with Filtering)
export const getTasks = async (req, res) => {
  try {
    const { status, priority, assignee } = req.query;
    const query = { organization: req.organizationId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;

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

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
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

    // Populate the user in the comment we just added for the frontend
    // We need to reload the task to populate the subdocument array correctly
    const populatedTask = await Task.findById(task._id).populate('comments.user', 'name');
    
    // Return the last comment (the one we just added)
    const newComment = populatedTask.comments[populatedTask.comments.length - 1];
    
    res.json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
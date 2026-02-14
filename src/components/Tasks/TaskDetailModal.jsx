import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiClock, FiUser, FiZap, FiMessageSquare } from 'react-icons/fi';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getInitials, cn } from '../../lib/utils';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const TaskDetailModal = ({ isOpen, onClose, task, members, onSave, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'Todo', priority: 'Medium', assignee: '', sprintPoints: 0
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignee: task.assignee?._id || '',
        sprintPoints: task.sprintPoints || 0
      });
      setComments(task.comments || []);
    } else {
      setFormData({
        title: '', description: '', status: 'Todo', priority: 'Medium', assignee: '', sprintPoints: 0
      });
      setComments([]);
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (isOpen && task) {
       scrollToBottom();
    }
  }, [comments, isOpen, task]);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...formData, _id: task?._id });
      if (!task) onClose(); // Close on create, stay open on update
    } finally {
      setSaving(false);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setCommentLoading(true);
    try {
      const { data } = await api.post(`/tasks/${task._id}/comments`, { text: newComment });
      setComments([...comments, data]);
      setNewComment('');
      if (onUpdate) onUpdate(); // Refresh parent list
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Left Side: Details */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6 md:hidden">
             <h2 className="text-xl font-bold text-gray-900">{task ? 'Edit Task' : 'New Task'}</h2>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><FiX /></button>
          </div>

          <form id="taskForm" onSubmit={handleSubmit} className="space-y-6">
            <Input
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Task Title"
              className="text-xl font-bold border-none px-0 shadow-none focus:ring-0 placeholder:text-gray-400"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Assignee</label>
                    <div className="relative">
                        <select
                            value={formData.assignee}
                            onChange={e => setFormData({...formData, assignee: e.target.value})}
                            className="w-full p-2 pl-9 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        >
                            <option value="">Unassigned</option>
                            {members.map(m => (
                                <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                        </select>
                        <FiUser className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Sprint Points</label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            value={formData.sprintPoints}
                            onChange={e => setFormData({...formData, sprintPoints: parseInt(e.target.value) || 0})}
                            className="w-full p-2 pl-9 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <FiZap className="absolute left-3 top-2.5 text-orange-400" />
                    </div>
                </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Add a more detailed description..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm min-h-[150px] focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="submit" isLoading={saving} className="flex-1 md:flex-none">
                    {task ? 'Save Changes' : 'Create Task'}
                </Button>
                {task && <Button type="button" variant="ghost" onClick={onClose} className="hidden md:block">Close</Button>}
            </div>
          </form>
        </div>

        {/* Right Side: Chat & Activity (Only in Edit Mode) */}
        {task ? (
          <div className="w-full md:w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-[500px] md:h-auto">
             <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <FiMessageSquare /> Comments
                </h3>
                <button onClick={onClose} className="hidden md:block p-1 hover:bg-gray-100 rounded text-gray-400"><FiX /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        No comments yet. Start the conversation!
                    </div>
                ) : (
                    comments.map((comment, idx) => (
                        <div key={idx} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                                {getInitials(comment.user?.name || 'User')}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline justify-between mb-1">
                                    <span className="text-sm font-semibold text-gray-900">{comment.user?.name || 'Unknown'}</span>
                                    <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-700 break-words">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={commentsEndRef} />
             </div>

             <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendComment} className="relative">
                    <input
                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={commentLoading || !newComment.trim()}
                        className="absolute right-2 top-2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        <FiSend />
                    </button>
                </form>
             </div>
          </div>
        ) : (
            // In Create Mode, show a placeholder or nothing on the right
            <div className="hidden md:flex w-80 bg-gray-50 border-l border-gray-200 flex-col items-center justify-center p-8 text-center">
                 <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 mb-4">
                    <FiMessageSquare className="text-2xl" />
                 </div>
                 <h3 className="text-gray-900 font-medium mb-2">Collaboration Hub</h3>
                 <p className="text-gray-500 text-sm">Create the task first to start adding comments, sprint points, and tracking history.</p>
                 <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full text-gray-400"><FiX /></button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
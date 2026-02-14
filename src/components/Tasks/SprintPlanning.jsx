import React, { useState } from 'react';
import { FiPlus, FiChevronDown, FiChevronRight, FiFlag, FiZap, FiTag, FiCalendar } from 'react-icons/fi';
import { getInitials, cn } from '../../lib/utils';
import { format } from 'date-fns';

const StatusSection = ({ title, count, tasks, isOpen, onToggle, onAdd, onEdit, color }) => {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-4">
            {/* Section Header */}
            <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                        {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                    </span>
                    <h3 className={cn("text-sm font-bold uppercase tracking-wider", color)}>{title}</h3>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-bold">{count}</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onAdd(); }}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <FiPlus /> ADD
                </button>
            </div>

            {/* Task List */}
            {isOpen && (
                <div className="border-t border-slate-100">
                    {/* Column Headers (Only visible if tasks exist) */}
                    {tasks.length > 0 && (
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <div className="col-span-12 md:col-span-5">Task</div>
                            <div className="hidden md:block md:col-span-2">Assignee</div>
                            <div className="hidden md:block md:col-span-2">Due Date</div>
                            <div className="hidden md:block md:col-span-1">Priority</div>
                            <div className="hidden md:block md:col-span-1">Pts</div>
                            <div className="hidden md:block md:col-span-1">Tag</div>
                        </div>
                    )}

                    <div className="divide-y divide-slate-50">
                        {tasks.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm italic">No tasks in this stage.</div>
                        ) : (
                            tasks.map(task => (
                                <div 
                                    key={task._id} 
                                    onClick={() => onEdit(task)}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-all cursor-pointer group"
                                >
                                    {/* Task Title */}
                                    <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", 
                                            task.status === 'Done' ? 'bg-emerald-400' : 
                                            task.status === 'In Progress' ? 'bg-orange-400' : 'bg-slate-300'
                                        )} />
                                        <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                            {task.title}
                                        </span>
                                    </div>

                                    {/* Assignee */}
                                    <div className="hidden md:flex col-span-2 items-center">
                                        {task.assignee ? (
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm" title={task.assignee.name}>
                                                {getInitials(task.assignee.name)}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                                        )}
                                    </div>

                                    {/* Due Date */}
                                    <div className="hidden md:flex col-span-2 text-xs font-medium text-slate-500 items-center gap-2">
                                        {task.dueDate ? (
                                            <>
                                                <FiCalendar className="text-slate-400" />
                                                {format(new Date(task.dueDate), 'MMM dd')}
                                            </>
                                        ) : '-'}
                                    </div>

                                    {/* Priority */}
                                    <div className="hidden md:flex col-span-1">
                                        <span className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase border",
                                            task.priority === 'High' ? "bg-red-50 text-red-600 border-red-100" :
                                            task.priority === 'Medium' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                            "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>
                                            <FiFlag /> {task.priority}
                                        </span>
                                    </div>

                                    {/* Points */}
                                    <div className="hidden md:flex col-span-1 items-center gap-1 text-slate-600 text-sm font-bold">
                                        <FiZap className="text-orange-400" /> {task.sprintPoints || 0}
                                    </div>

                                    {/* Tag */}
                                    <div className="hidden md:flex col-span-1">
                                        <FiTag className="text-slate-300 hover:text-indigo-500 transition-colors" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SprintPlanning = ({ tasks, onEdit, onCreate }) => {
    const [sections, setSections] = useState({
        todo: true,
        inProgress: true,
        done: true
    });

    const toggleSection = (key) => setSections(prev => ({ ...prev, [key]: !prev[key] }));

    const todoTasks = tasks.filter(t => t.status === 'Todo');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
    const doneTasks = tasks.filter(t => t.status === 'Done');

    return (
        <div className="space-y-2 animate-in fade-in duration-300">
            <StatusSection 
                title="To Do" 
                count={todoTasks.length} 
                tasks={todoTasks} 
                isOpen={sections.todo} 
                onToggle={() => toggleSection('todo')}
                onAdd={() => onCreate('Todo')}
                onEdit={onEdit}
                color="text-slate-600"
            />
            <StatusSection 
                title="In Progress" 
                count={inProgressTasks.length} 
                tasks={inProgressTasks} 
                isOpen={sections.inProgress} 
                onToggle={() => toggleSection('inProgress')}
                onAdd={() => onCreate('In Progress')}
                onEdit={onEdit}
                color="text-indigo-600"
            />
            <StatusSection 
                title="Closed" 
                count={doneTasks.length} 
                tasks={doneTasks} 
                isOpen={sections.done} 
                onToggle={() => toggleSection('done')}
                onAdd={() => onCreate('Done')}
                onEdit={onEdit}
                color="text-emerald-600"
            />
        </div>
    );
};

export default SprintPlanning;
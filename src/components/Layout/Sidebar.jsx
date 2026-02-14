import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiList, FiUsers, FiPieChart, FiLogOut, FiPlus } from 'react-icons/fi';
import { MdOutlineDashboard } from 'react-icons/md';
import { cn, getInitials } from '../../lib/utils';

const Sidebar = () => {
  const { user, currentOrg, organizations, logout, switchOrganization } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: MdOutlineDashboard, label: 'Dashboard', path: '/' },
    { icon: FiList, label: 'Tasks', path: '/tasks' },
    { icon: FiUsers, label: 'Team', path: '/team' },
    { icon: FiPieChart, label: 'Analytics', path: '/analytics' },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <FiGrid className="text-xl" />
          </div>
          <span className="text-xl font-bold tracking-tight">Jeera</span>
        </div>

        {/* Org Switcher */}
        <div className="relative group">
          <button className="w-full flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                {currentOrg ? getInitials(currentOrg.name) : '+'}
              </div>
              <span className="truncate text-sm font-medium text-white">
                {currentOrg ? currentOrg.name : 'Select Org'}
              </span>
            </div>
          </button>
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 w-full mt-1 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden hidden group-hover:block z-50">
            {organizations.map(org => (
              <div 
                key={org._id}
                onClick={() => switchOrganization(org._id)}
                className={cn(
                  "px-4 py-2 text-sm cursor-pointer hover:bg-slate-700 transition-colors",
                  currentOrg?._id === org._id ? "text-indigo-400 bg-slate-700/50" : "text-slate-300"
                )}
              >
                {org.name}
              </div>
            ))}
            <div className="border-t border-slate-700 mt-1">
                <button 
                    onClick={() => navigate('/create-org')}
                    className="w-full text-left px-4 py-2 text-xs text-indigo-400 hover:bg-slate-700 flex items-center gap-2"
                >
                    <FiPlus /> Create / Join Organization
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <item.icon className="text-lg" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <FiLogOut />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
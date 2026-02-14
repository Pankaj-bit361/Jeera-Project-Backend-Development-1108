import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiBell, FiHelpCircle } from 'react-icons/fi';
import { getInitials } from '../../lib/utils';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tasks, projects, or team members..." 
            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:bg-white transition-all hover:bg-slate-100 focus:hover:bg-white"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-4">
        <div className="flex items-center gap-4 border-r border-slate-200 pr-6">
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
                <FiBell className="text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <FiHelpCircle className="text-xl" />
            </button>
        </div>

        <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs text-green-500 font-medium flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold border-2 border-white shadow-md">
                {getInitials(user?.name)}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
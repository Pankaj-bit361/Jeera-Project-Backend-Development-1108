import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiList, FiUsers, FiPieChart, FiLogOut, FiPlus, FiSettings, FiCalendar, FiChevronRight, FiZap, FiFolder, FiPlayCircle } from 'react-icons/fi';
import { cn, getInitials, calculateSprint } from '../../lib/utils';
import { MdOutlineDashboard } from 'react-icons/md';
import { format, addDays } from 'date-fns';

const Sidebar = () => {
  const { user, currentOrg, organizations, logout, switchOrganization } = useAuth();
  const navigate = useNavigate();
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate current sprint and generate list
  const sprintData = useMemo(() => {
    if (!currentOrg) return { current: 1, list: [] };
    const current = calculateSprint(currentOrg.createdAt);
    
    // Generate previous 2, current, and next 5 sprints with dates
    const list = [];
    const orgStart = new Date(currentOrg.createdAt);
    
    for (let i = 1; i <= current + 5; i++) {
        const sprintStart = addDays(orgStart, (i - 1) * 7);
        const sprintEnd = addDays(sprintStart, 6);
        list.push({
            index: i,
            label: `Sprint ${i}`,
            dateRange: `${format(sprintStart, 'MMM d')} - ${format(sprintEnd, 'MMM d')}`,
            isActive: i === current
        });
    }
    return { current, list };
  }, [currentOrg]);

  const menuGroups = [
    {
      title: 'MAIN MENU',
      items: [
        { icon: MdOutlineDashboard, label: 'Dashboard', path: '/' },
        { icon: FiList, label: 'Tasks', path: '/tasks' },
      ]
    },
    {
      title: 'ANALYZE',
      items: [
        { icon: FiPieChart, label: 'Analytics', path: '/analytics' },
      ]
    },
    {
      title: 'MANAGE',
      items: [
        { icon: FiUsers, label: 'Team', path: '/team' },
      ]
    }
  ];

  return (
    <div className="h-screen w-[280px] bg-[#FDFDFD] border-r border-slate-200 flex flex-col shrink-0 z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <FiGrid className="text-lg" />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">Jeera<span className="text-slate-400 font-normal">.io</span></span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-thin">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive 
                        ? "text-slate-900 bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn("text-lg transition-colors", isActive ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600")} />
                      <span>{item.label}</span>
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Sprint Folder Section */}
        <div>
            <div className="flex items-center justify-between px-4 mb-2">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FiFolder className="text-slate-400" /> Sprints
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">Weekly</span>
            </div>
            <div className="space-y-0.5">
                {sprintData.list.map((sprint) => (
                    <NavLink 
                        key={sprint.index}
                        to={`/tasks?sprint=${sprint.index}`}
                        className={({ isActive }) => cn(
                            "flex items-center justify-between px-4 py-2 mx-2 rounded-lg text-xs transition-colors",
                            sprint.isActive ? "bg-indigo-50/50 text-indigo-700 font-medium" : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            {sprint.isActive ? <FiPlayCircle className="text-indigo-500" /> : <div className="w-3.5" />}
                            <span>{sprint.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{sprint.dateRange}</span>
                    </NavLink>
                ))}
            </div>
        </div>
      </nav>

      {/* Workspace Switcher (Bottom) */}
      <div className="p-4 border-t border-slate-100 bg-white relative">
        {/* Dropdown Menu - Positioned absolutely bottom-full */}
        {isOrgMenuOpen && (
            <div className="absolute bottom-[calc(100%+10px)] left-4 right-4 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Switch Workspace</p>
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                    {organizations.map(org => (
                        <button 
                            key={org._id}
                            onClick={() => {
                                switchOrganization(org._id);
                                setIsOrgMenuOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm mb-1 transition-colors text-left",
                                currentOrg?._id === org._id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                            )}
                        >   
                            <div className={cn("w-2 h-2 rounded-full", currentOrg?._id === org._id ? "bg-indigo-500" : "bg-slate-300")} />
                            <span className="truncate">{org.name}</span>
                        </button>
                    ))}
                </div>
                <div className="h-px bg-slate-100 my-1" />
                <div className="p-1">
                    <button 
                        onClick={() => navigate('/create-org')}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-indigo-600 hover:bg-indigo-50 transition-colors text-left"
                    >
                        <FiPlus /> New Workspace
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                        <FiLogOut /> Sign Out
                    </button>
                </div>
            </div>
        )}
        
        {/* Toggle Button */}
        <button 
            onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
            className={cn(
                "w-full flex items-center gap-3 p-2 rounded-xl transition-all border text-left",
                isOrgMenuOpen ? "bg-slate-50 border-slate-200" : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
            )}
        >
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-white shadow-sm">
                {currentOrg ? getInitials(currentOrg.name) : <FiPlus />}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{currentOrg ? currentOrg.name : 'Select Org'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <FiChevronRight className={cn("text-slate-400 transition-transform", isOrgMenuOpen && "rotate-90")} />
        </button>
      </div>
      
      {/* Click Overlay to close menu */}
      {isOrgMenuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsOrgMenuOpen(false)}></div>
      )}
    </div>
  );
};

export default Sidebar;
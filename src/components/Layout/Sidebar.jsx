import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiList, FiUsers, FiPieChart, FiLogOut, FiPlus, FiChevronRight, FiFolder, FiPlayCircle, FiMoreVertical } from 'react-icons/fi';
import { cn, getInitials, generateSprintList } from '../../lib/utils';
import { MdOutlineDashboard } from 'react-icons/md';

const Sidebar = () => {
  const { user, currentOrg, organizations, logout, switchOrganization } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const currentSprintParam = searchParams.get('sprint');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sprintList = useMemo(() => {
    if (!currentOrg) return [];
    return generateSprintList(currentOrg.createdAt);
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
    <div className="h-screen w-[280px] bg-[#FDFDFD] border-r border-slate-200 flex flex-col shrink-0 z-20 font-sans">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
            <FiGrid className="text-xl" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Jira<span className="text-slate-400 font-normal">.io</span></span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-thin pb-4">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive 
                        ? "text-slate-900 bg-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.06)] border border-slate-100" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn("text-xl transition-colors", isActive ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600")} />
                      <span>{item.label}</span>
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Sprint Folder Section */}
        <div>
            <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FiFolder className="text-slate-400" /> Sprints
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold">Weekly</span>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin pl-2">
                {sprintList.map((sprint) => {
                    const isSelected = currentSprintParam === String(sprint.index) || (!currentSprintParam && sprint.isActive && location.pathname === '/tasks');
                    return (
                        <NavLink 
                            key={sprint.index}
                            to={`/tasks?sprint=${sprint.index}`}
                            className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group",
                                isSelected 
                                    ? "bg-indigo-50/60 text-indigo-900 font-semibold" 
                                    : "text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {isSelected ? (
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                ) : (
                                    <div className="w-1.5 h-1.5" />
                                )}
                                <span>{sprint.label}</span>
                            </div>
                            <span className={cn("text-[10px] font-mono", isSelected ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-400")}>
                                {sprint.dateRange}
                            </span>
                        </NavLink>
                    );
                })}
            </div>
        </div>
      </nav>

      {/* Workspace Switcher (Bottom) */}
      <div className="p-4 border-t border-slate-100 bg-[#FDFDFD] relative">
        {/* Dropdown */}
        {isOrgMenuOpen && (
            <div className="absolute bottom-[calc(100%+12px)] left-4 right-4 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-200 z-50 ring-1 ring-black/5">
                <div className="bg-slate-50/80 backdrop-blur px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Switch Workspace</p>
                </div>
                <div className="max-h-48 overflow-y-auto p-2">
                    {organizations.map(org => (
                        <button 
                            key={org._id}
                            onClick={() => {
                                switchOrganization(org._id);
                                setIsOrgMenuOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm mb-1 transition-all text-left",
                                currentOrg?._id === org._id ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                            )}
                        >   
                            <div className={cn("w-2 h-2 rounded-full", currentOrg?._id === org._id ? "bg-indigo-500" : "bg-slate-300")} />
                            <span className="truncate">{org.name}</span>
                        </button>
                    ))}
                </div>
                <div className="h-px bg-slate-100 mx-2" />
                <div className="p-2">
                    <button 
                        onClick={() => navigate('/create-org')}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-indigo-600 hover:bg-indigo-50 transition-colors text-left"
                    >
                        <FiPlus /> New Workspace
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                        <FiLogOut /> Sign Out
                    </button>
                </div>
            </div>
        )}
        
        {/* Profile Card */}
        <button 
            onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
            className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all border text-left group",
                isOrgMenuOpen ? "bg-white border-slate-200 shadow-lg" : "bg-[#FDFDFD] border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm"
            )}
        >
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-white shadow-sm">
                {user ? getInitials(user.name) : <FiPlus />}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <FiChevronRight className={cn("text-slate-300 transition-transform group-hover:text-slate-400", isOrgMenuOpen && "rotate-90")} />
        </button>
      </div>
      
      {isOrgMenuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsOrgMenuOpen(false)}></div>
      )}
    </div>
  );
};

export default Sidebar;
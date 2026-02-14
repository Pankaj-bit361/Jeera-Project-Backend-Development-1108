import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  const { user, currentOrg } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto w-full">
            {!currentOrg && window.location.pathname !== '/create-org' ? (
               <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🏢</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">No Workspace Selected</h2>
                  <p className="text-slate-500 mb-8 max-w-sm">You need to create or join a workspace to start managing your projects.</p>
                  <a href="/create-org" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">Get Started</a>
               </div>
            ) : (
               <Outlet />
            )}
          </div>
        </main>
      </div>
      <Toaster 
        position="top-right" 
        toastOptions={{
            style: {
                background: '#333',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '14px'
            }
        }}
      />
    </div>
  );
};

export default MainLayout;
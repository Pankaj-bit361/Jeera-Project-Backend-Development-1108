import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  const { user, currentOrg } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {!currentOrg && window.location.pathname !== '/create-org' ? (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Organization Selected</h2>
                <p className="text-gray-500 mb-6">Please create or join an organization to get started.</p>
                <a href="/create-org" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Get Started</a>
             </div>
          ) : (
             <Outlet />
          )}
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout;
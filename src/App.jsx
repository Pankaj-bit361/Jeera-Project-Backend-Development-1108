import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import TaskBoard from './pages/Tasks/TaskBoard';
import Team from './pages/Team/Team';
import Analytics from './pages/Analytics/Analytics';
import CreateOrg from './pages/Dashboard/CreateOrg';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<TaskBoard />} />
            <Route path="team" element={<Team />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="create-org" element={<CreateOrg />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
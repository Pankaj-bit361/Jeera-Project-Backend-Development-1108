import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedOrgId = localStorage.getItem('currentOrgId');

      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setOrganizations(parsedUser.organizations || []);

        if (savedOrgId && parsedUser.organizations) {
            const org = parsedUser.organizations.find(o => o._id === savedOrgId);
            if (org) setCurrentOrg(org);
            else if (parsedUser.organizations.length > 0) {
                // Fallback if saved org ID is invalid
                setCurrentOrg(parsedUser.organizations[0]);
                localStorage.setItem('currentOrgId', parsedUser.organizations[0]._id);
            }
        } else if (parsedUser.organizations?.length > 0) {
            setCurrentOrg(parsedUser.organizations[0]);
            localStorage.setItem('currentOrgId', parsedUser.organizations[0]._id);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      handleAuthSuccess(data);
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const signup = async (userData) => {
    try {
      const { data } = await api.post('/auth/signup', userData);
      handleAuthSuccess(data);
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return false;
    }
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    setOrganizations(data.organizations);
    
    if (data.organizations?.length > 0) {
      setCurrentOrg(data.organizations[0]);
      localStorage.setItem('currentOrgId', data.organizations[0]._id);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentOrgId');
    setUser(null);
    setCurrentOrg(null);
    setOrganizations([]);
  };

  const switchOrganization = (orgId) => {
    const org = organizations.find(o => o._id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('currentOrgId', org._id);
      toast.success(`Switched to ${org.name}`);
      // Reload page to refresh data or trigger re-fetch via effect in components
      window.location.reload(); 
    }
  };
  
  const refreshUser = async () => {
      try {
        // Assuming there isn't a direct /me endpoint, we use the stored data or re-login logic
        // For now, we rely on updated responses from other endpoints if needed, 
        // but let's implement a quick fetch of orgs to keep sidebar updated
        const { data } = await api.get('/organizations');
        setOrganizations(data);
        
        // Update local storage user object with new orgs
        const updatedUser = { ...user, organizations: data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {
          console.error("Failed to refresh user data");
      }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentOrg, 
      organizations, 
      login, 
      signup, 
      logout, 
      loading,
      switchOrganization,
      refreshUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
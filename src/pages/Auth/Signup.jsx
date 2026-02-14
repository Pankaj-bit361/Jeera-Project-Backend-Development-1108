import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FiGrid } from 'react-icons/fi';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    orgName: '',
    inviteCode: ''
  });
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Only send relevant fields based on mode
    const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(mode === 'create' ? { orgName: formData.orgName } : { inviteCode: formData.inviteCode })
    };
    
    const success = await signup(payload);
    setIsLoading(false);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-4">
            <FiGrid className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button 
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'create' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setMode('create')}
            >
                New Organization
            </button>
            <button 
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'join' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setMode('join')}
            >
                Join with Code
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
          
          {mode === 'create' ? (
              <Input
                label="Organization Name"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                required
                placeholder="Acme Corp"
              />
          ) : (
              <Input
                label="Invite Code"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                required
                placeholder="ENTER-CODE"
              />
          )}

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            {mode === 'create' ? 'Sign Up & Create Org' : 'Sign Up & Join'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FiGrid, FiUser, FiMail, FiLock, FiBriefcase, FiKey } from 'react-icons/fi';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    orgName: '',
    inviteCode: ''
  });
  const [mode, setMode] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4 font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/30">
            <FiGrid className="text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">Get Started</h2>
          <p className="text-slate-500">Create your account and start collaborating.</p>
        </div>

        <div className="flex bg-slate-50 p-1.5 rounded-xl mb-8 border border-slate-100">
            <button 
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'create' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setMode('create')}
            >
                Create Workspace
            </button>
            <button 
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'join' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setMode('join')}
            >
                Join Team
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
            icon={FiUser}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="name@company.com"
            icon={FiMail}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            icon={FiLock}
          />
          
          <div className="pt-2">
            {mode === 'create' ? (
                <Input
                    label="Workspace Name"
                    name="orgName"
                    value={formData.orgName}
                    onChange={handleChange}
                    required
                    placeholder="Acme Corp"
                    icon={FiBriefcase}
                />
            ) : (
                <Input
                    label="Invite Code"
                    name="inviteCode"
                    value={formData.inviteCode}
                    onChange={handleChange}
                    required
                    placeholder="XYZ-123"
                    icon={FiKey}
                />
            )}
          </div>

          <Button type="submit" className="w-full py-3 mt-4 shadow-orange-500/25" isLoading={isLoading}>
            {mode === 'create' ? 'Create Account' : 'Join Workspace'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-slate-900 hover:text-orange-600 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
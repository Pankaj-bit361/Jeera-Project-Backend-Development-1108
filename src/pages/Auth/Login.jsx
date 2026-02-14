import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FiGrid, FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4 font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/30">
            <FiGrid className="text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500">Enter your credentials to access your workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@company.com"
            icon={FiMail}
          />
          <div>
            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                icon={FiLock}
            />
            <div className="flex justify-end mt-2">
                <Link to="#" className="text-xs font-medium text-orange-600 hover:text-orange-700">Forgot Password?</Link>
            </div>
          </div>
          
          <Button type="submit" className="w-full py-3 shadow-orange-500/25" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-slate-900 hover:text-orange-600 transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
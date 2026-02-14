import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const CreateOrg = () => {
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [mode, setMode] = useState('create');
    const [loading, setLoading] = useState(false);
    const { refreshUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'create') {
                await api.post('/organizations', { name });
                toast.success('Organization Created!');
            } else {
                await api.post('/organizations/join', { inviteCode });
                toast.success('Joined Organization!');
            }
            await refreshUser();
            navigate('/');
            window.location.reload(); // Force context update
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Get Started with an Organization</h2>
            
            <div className="flex gap-4 mb-6 border-b border-gray-100 pb-2">
                <button 
                    className={`pb-2 text-sm font-medium ${mode === 'create' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                    onClick={() => setMode('create')}
                >
                    Create New
                </button>
                <button 
                    className={`pb-2 text-sm font-medium ${mode === 'join' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                    onClick={() => setMode('join')}
                >
                    Join Existing
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'create' ? (
                    <Input 
                        label="Organization Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="My Startup"
                        required 
                    />
                ) : (
                    <Input 
                        label="Invite Code" 
                        value={inviteCode} 
                        onChange={e => setInviteCode(e.target.value)} 
                        placeholder="XYZ123"
                        required 
                    />
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="ghost" onClick={() => navigate('/')}>Cancel</Button>
                    <Button type="submit" isLoading={loading}>
                        {mode === 'create' ? 'Create' : 'Join'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateOrg;
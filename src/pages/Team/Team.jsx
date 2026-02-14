import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FiMail, FiCopy, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getInitials } from '../../lib/utils';

const Team = () => {
    const { currentOrg } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        if (currentOrg) fetchMembers();
    }, [currentOrg]);

    const fetchMembers = async () => {
        try {
            const { data } = await api.get('/organizations/members');
            setMembers(data);
        } catch (error) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        try {
            await api.post('/organizations/invite', { email: inviteEmail });
            toast.success('Invitation sent successfully!');
            setInviteEmail('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send invite');
        } finally {
            setInviting(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(currentOrg?.inviteCode);
        toast.success('Invite code copied!');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                <p className="text-gray-500">Manage who has access to {currentOrg?.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Members List */}
                <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Active Members ({members.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-6 text-center text-gray-500">Loading...</div>
                        ) : (
                            members.map(member => (
                                <div key={member._id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        {getInitials(member.name)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Invite Section */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FiUserPlus /> Invite Member
                        </h3>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <Input 
                                placeholder="colleague@example.com"
                                type="email"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                required
                            />
                            <Button type="submit" className="w-full" isLoading={inviting}>
                                Send Invite
                            </Button>
                        </form>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                        <h3 className="font-semibold text-indigo-900 mb-2">Invite Code</h3>
                        <p className="text-sm text-indigo-700 mb-4">Share this code to let people join instantly.</p>
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-200">
                            <code className="flex-1 text-center font-mono font-bold text-indigo-600 text-lg">
                                {currentOrg?.inviteCode}
                            </code>
                            <button 
                                onClick={copyCode}
                                className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                            >
                                <FiCopy />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Team;
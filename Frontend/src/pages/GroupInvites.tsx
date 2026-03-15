import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';

interface InviteItem {
    _id: string;
    message?: string;
    sender?: {
        name?: string;
    };
    group?: {
        _id: string;
        name: string;
        batchYear: number;
        description?: string;
    };
    createdAt: string;
}

interface GroupItem {
    _id: string;
    name: string;
    batchYear: number;
    description?: string;
    members?: Array<{ _id: string }>;
}

const GroupInvites: React.FC = () => {
    const { user } = useAuth();
    const [invites, setInvites] = useState<InviteItem[]>([]);
    const [groups, setGroups] = useState<GroupItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyInviteId, setBusyInviteId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!user?.token) return;

        setLoading(true);
        setError(null);

        try {
            const [inviteRes, groupRes] = await Promise.all([
                axios.get('http://localhost:5000/api/groups/invites', {
                    headers: { Authorization: `Bearer ${user.token}` },
                }),
                axios.get('http://localhost:5000/api/groups/my', {
                    headers: { Authorization: `Bearer ${user.token}` },
                }),
            ]);

            setInvites(inviteRes.data?.invites || []);
            setGroups(groupRes.data?.groups || []);
        } catch (err) {
            console.error('Failed to load group invites:', err);
            setError('Failed to load group invites. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const respondToInvite = async (inviteId: string, action: 'accept' | 'reject') => {
        if (!user?.token) return;

        setBusyInviteId(inviteId);
        try {
            await axios.patch(
                `http://localhost:5000/api/groups/invites/${inviteId}/respond`,
                { action },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setInvites((prev) => prev.filter((invite) => invite._id !== inviteId));

            if (action === 'accept') {
                await fetchData();
            }
        } catch (err) {
            console.error('Failed to respond to invite:', err);
            setError('Could not update invite status. Please try again.');
        } finally {
            setBusyInviteId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0D14] text-gray-100">
            <Navigation />
            <main className="mx-auto max-w-6xl px-6 py-8">
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h1 className="text-2xl font-bold">Group Invitations</h1>
                    <p className="mt-1 text-sm text-gray-400">Accept or reject alumni batch group requests.</p>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-300">Loading invites...</div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>
                ) : (
                    <>
                        <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
                            <h2 className="text-lg font-semibold">Pending Invites</h2>
                            {invites.length === 0 ? (
                                <p className="mt-2 text-sm text-gray-400">No pending group invites.</p>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {invites.map((invite) => (
                                        <div key={invite._id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                                            <p className="font-medium text-gray-100">{invite.group?.name || 'Batch Group'} ({invite.group?.batchYear || '-'})</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Invited by {invite.sender?.name || 'Alumni'} • {new Date(invite.createdAt).toLocaleString()}
                                            </p>
                                            {invite.message && <p className="mt-2 text-sm text-gray-300">{invite.message}</p>}
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    disabled={busyInviteId === invite._id}
                                                    onClick={() => respondToInvite(invite._id, 'accept')}
                                                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    disabled={busyInviteId === invite._id}
                                                    onClick={() => respondToInvite(invite._id, 'reject')}
                                                    className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600 disabled:opacity-60"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <h2 className="text-lg font-semibold">My Groups</h2>
                            {groups.length === 0 ? (
                                <p className="mt-2 text-sm text-gray-400">You have not joined any groups yet.</p>
                            ) : (
                                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {groups.map((group) => (
                                        <div key={group._id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                                            <p className="font-semibold">{group.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">Batch {group.batchYear}</p>
                                            {group.description && <p className="mt-2 text-sm text-gray-300 line-clamp-2">{group.description}</p>}
                                            <p className="mt-2 text-xs text-amber-300">Members: {group.members?.length || 0}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default GroupInvites;
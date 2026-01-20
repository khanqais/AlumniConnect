import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: number;
    platform: string;
    meetingLink: string;
    organizer: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    registeredUsers: string[];
    maxParticipants: number;
    status: 'upcoming' | 'ongoing' | 'completed';
    category: string;
    tags: string[];
    skillsCovered: string[];
    recordingAllowed: boolean;
    prerequisites: string;
    createdAt: string;
}

const WebinarList = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [myRegistrations, setMyRegistrations] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('upcoming');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'registered' | 'my'>('all');

    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/events', {
                params: { status, search },
            });
            setEvents(res.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, [status, search]);

    const fetchMyEvents = useCallback(async () => {
        if (!user?.token || user.role !== 'alumni') return;
        
        try {
            const res = await axios.get('http://localhost:5000/api/events/my/events', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setMyEvents(res.data);
        } catch (error) {
            console.error('Error fetching my events:', error);
        }
    }, [user?.token, user?.role]);

    const fetchMyRegistrations = useCallback(async () => {
        if (!user?.token) return;
        
        try {
            const res = await axios.get('http://localhost:5000/api/events');
            const registered = res.data.filter((event: Event) => 
                event.registeredUsers.includes(user._id)
            );
            setMyRegistrations(registered);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    }, [user?.token, user?._id]);

    useEffect(() => {
        fetchEvents();
        if (user) {
            fetchMyRegistrations();
            if (user.role === 'alumni') {
                fetchMyEvents();
            }
        }
    }, [fetchEvents, fetchMyRegistrations, fetchMyEvents, user]);

    const handleRegister = async (eventId: string) => {
        if (!user?.token) return;

        try {
            await axios.post(
                `http://localhost:5000/api/events/register/${eventId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            fetchEvents();
            fetchMyRegistrations();
            alert('Registration updated successfully!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to register');
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!user?.token) return;
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            fetchEvents();
            fetchMyEvents();
            alert('Event deleted successfully!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Failed to delete event');
        }
    };

    const handleRefresh = () => {
        fetchEvents();
        if (user) {
            fetchMyRegistrations();
            if (user.role === 'alumni') {
                fetchMyEvents();
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-100 opacity-50 blur-3xl"></div>
            </div>

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Title & Actions */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Webinars & Events</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                            title="Refresh"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        {user?.role === 'alumni' && (
                            <button
                                onClick={() => navigate('/webinar-scheduler')}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Webinar
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'all'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        }`}
                    >
                        All Webinars
                    </button>
                    <button
                        onClick={() => setActiveTab('registered')}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'registered'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        }`}
                    >
                        My Registrations ({myRegistrations.length})
                    </button>
                    {user?.role === 'alumni' && (
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'my'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                            }`}
                        >
                            My Webinars ({myEvents.length})
                        </button>
                    )}
                </div>

                {/* Search & Filter - Only show for 'all' tab */}
                {activeTab === 'all' && (
                    <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-2">
                            {['upcoming', 'ongoing', 'completed'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                        status === s
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search webinars..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {/* Events Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'my' ? (
                            // My Webinars
                            user?.role === 'alumni' ? (
                                myEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-20">
                                        <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mb-4 text-lg text-gray-600">You haven't created any webinars yet</p>
                                        <button
                                            onClick={() => navigate('/webinar-scheduler')}
                                            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                                        >
                                            Create Your First Webinar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {myEvents.map((event) => (
                                            <EventCard 
                                                key={event._id} 
                                                event={event} 
                                                onRegister={handleRegister}
                                                onDelete={handleDelete}
                                                isOrganizer={true}
                                            />
                                        ))}
                                    </div>
                                )
                            ) : null
                        ) : activeTab === 'registered' ? (
                            // My Registrations
                            myRegistrations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-20">
                                    <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="text-lg text-gray-600">You haven't registered for any webinars yet</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {myRegistrations.map((event) => (
                                        <EventCard 
                                            key={event._id} 
                                            event={event} 
                                            onRegister={handleRegister}
                                            onDelete={handleDelete}
                                            isOrganizer={user?._id === event.organizer._id}
                                            isRegistered={true}
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            // All Webinars
                            events.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-20">
                                    <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-lg text-gray-600">No webinars found</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {events.map((event) => (
                                        <EventCard 
                                            key={event._id} 
                                            event={event} 
                                            onRegister={handleRegister}
                                            onDelete={handleDelete}
                                            isOrganizer={user?._id === event.organizer._id}
                                            isRegistered={event.registeredUsers.includes(user?._id || '')}
                                        />
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

// Event Card Component
const EventCard = ({ 
    event, 
    onRegister, 
    onDelete,
    isOrganizer = false,
    isRegistered = false
}: { 
    event: Event; 
    onRegister: (id: string) => void;
    onDelete: (id: string) => void;
    isOrganizer?: boolean;
    isRegistered?: boolean;
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isFull = event.registeredUsers.length >= event.maxParticipants;
    const canRegister = !isOrganizer && !isFull && event.status === 'upcoming';

    return (
        <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-4 flex items-start justify-between">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                    event.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
                {isFull && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                        Full
                    </span>
                )}
            </div>

            <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {event.title}
            </h3>

            <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                {event.description}
            </p>

            <div className="mb-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(event.date)} at {event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{event.registeredUsers.length}/{event.maxParticipants} registered</span>
                </div>
            </div>

            {event.skillsCovered && event.skillsCovered.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {event.skillsCovered.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            {skill}
                        </span>
                    ))}
                    {event.skillsCovered.length > 3 && (
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            +{event.skillsCovered.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="mt-auto border-t border-gray-100 pt-4">
                <div 
                    className="mb-3 flex cursor-pointer items-center gap-2"
                    onClick={() => navigate(`/profile/${event.organizer._id}`)}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-bold text-white">
                        {event.organizer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{event.organizer.name}</p>
                        <p className="text-xs text-gray-500">Organizer</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {canRegister && (
                        <button
                            onClick={() => onRegister(event._id)}
                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                isRegistered
                                    ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-lg'
                            }`}
                        >
                            {isRegistered ? 'Unregister' : 'Register'}
                        </button>
                    )}
                    {isOrganizer && (
                        <>
                            <button
                                onClick={() => navigate(`/webinar-scheduler/${event._id}`)}
                                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(event._id)}
                                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                Delete
                            </button>
                        </>
                    )}
                    {event.meetingLink && event.status !== 'completed' && (isRegistered || isOrganizer) && (
                        <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-700"
                        >
                            Join Meeting
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebinarList;

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

interface Event {
    _id: string;
    webinarName: string;
    description: string;
    scheduledAt: string;
    time: string;
    duration: number;
    platform: string;
    roomId?: string;
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
    meetingLink?: string;
}

const WebinarList = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [myRegistrations, setMyRegistrations] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'registered' | 'my'>('all');

    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch all webinars
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
            const res = await axios.get('http://localhost:5000/api/webinars', {
                params: { status, search },
                headers,
            });
            setEvents(res.data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, [status, search, user?.token]);

    // Fetch webinars created by this user (alumni only)
    const fetchMyEvents = useCallback(async () => {
        if (!user?.token || user?.role !== 'alumni') return;
        try {
            const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
            const res = await axios.get('http://localhost:5000/api/webinars', {
                headers,
            });
            const myWebinars = (res.data || []).filter((event: Event) => event.organizer?._id === user._id);
            setMyEvents(myWebinars);
        } catch (error) {
            console.error('Error fetching my events:', error);
        }
    }, [user?.token, user?.role, user?._id]);

    // Fetch webinars the user registered for
    const fetchMyRegistrations = useCallback(async () => {
        if (!user?.token) return;
        try {
            const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
            const res = await axios.get('http://localhost:5000/api/webinars', { headers });
            const registered = (res.data || []).filter((event: Event) =>
                event.registeredUsers?.includes(user._id)
            );
            setMyRegistrations(registered);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    }, [user?.token, user?._id]);

    useEffect(() => {
        fetchEvents();
        fetchMyRegistrations();
        if (user?.role === 'alumni') {
            fetchMyEvents();
        }
    }, [fetchEvents, fetchMyRegistrations, fetchMyEvents, user?.role]);

    // Register/Unregister
    const handleRegister = async (eventId: string) => {
        if (!user?.token) return;

        try {
            const headers = { Authorization: `Bearer ${user.token}` };
            await axios.post(
                `http://localhost:5000/api/webinars/register/${eventId}`,
                {},
                { headers }
            );
            fetchEvents();
            fetchMyRegistrations();
            alert('Registration updated successfully!');
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Failed to register');
        }
    };

    // Delete event
    const handleDelete = async (eventId: string) => {
        if (!user?.token) return;
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const headers = { Authorization: `Bearer ${user.token}` };
            await axios.delete(`http://localhost:5000/api/webinars/${eventId}`, { headers });
            fetchEvents();
            fetchMyEvents();
            alert('Event deleted successfully!');
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Failed to delete event');
        }
    };

    const handleRefresh = () => {
        fetchEvents();
        fetchMyRegistrations();
        if (user?.role === 'alumni') {
            fetchMyEvents();
        }
    };

    const displayedEvents = activeTab === 'all' ? events : activeTab === 'registered' ? myRegistrations : myEvents;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-100 opacity-50 blur-3xl"></div>
            </div>

            <Navigation />

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Title & Actions */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Webinars & Events</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Join live sessions with alumni or create your own webinars
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                            title="Refresh"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
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
                    <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        {/* Status Filters */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            {['upcoming', 'ongoing', 'completed'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s as 'upcoming' | 'ongoing' | 'completed')}
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
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search webinars by name, description, or skills..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* Events Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    </div>
                ) : displayedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-20">
                        <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mb-2 text-lg font-medium text-gray-900">
                            {activeTab === 'my' ? "You haven't created any webinars yet" :
                             activeTab === 'registered' ? "You haven't registered for any webinars yet" :
                             "No webinars found"}
                        </p>
                        <p className="text-sm text-gray-600">
                            {activeTab === 'my' ? "Create your first webinar to get started" :
                             activeTab === 'registered' ? "Browse all webinars to find events that interest you" :
                             "Try adjusting your search or filter criteria"}
                        </p>
                        {activeTab === 'my' && user?.role === 'alumni' && (
                            <button
                                onClick={() => navigate('/webinar-scheduler')}
                                className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                            >
                                Create Your First Webinar
                            </button>
                        )}
                        {activeTab === 'registered' && (
                            <button
                                onClick={() => setActiveTab('all')}
                                className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                            >
                                Browse All Webinars
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {displayedEvents
                            .filter(event => event?._id && event?.organizer)
                            .map((event) => (
                                <EventCard
                                    key={event._id}
                                    event={event}
                                    onRegister={handleRegister}
                                    onDelete={handleDelete}
                                    isOrganizer={user?._id === event.organizer?._id}
                                    isRegistered={event.registeredUsers?.includes(user?._id || '')}
                                />
                            ))}
                    </div>
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
    isRegistered = false,
}: {
    event: Event;
    onRegister: (id: string) => void;
    onDelete: (id: string) => void;
    isOrganizer?: boolean;
    isRegistered?: boolean;
}) => {
    const navigate = useNavigate();

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const isFull = (event.registeredUsers?.length || 0) >= event.maxParticipants;
    const canRegister = !isOrganizer && !isFull && event.status === 'upcoming';

    return (
        <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg">
            {/* Card Header with Status Badge */}
            <div className="p-6 pb-4">
                <div className="mb-3 flex items-start justify-between">
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            event.status === 'upcoming'
                                ? 'bg-green-100 text-green-800'
                                : event.status === 'ongoing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {(event.status ?? '').charAt(0).toUpperCase() + (event.status ?? '').slice(1)}
                    </span>
                    {isFull && (
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                            Full
                        </span>
                    )}
                </div>

                <h3 className="mb-2 text-xl font-semibold text-gray-900 line-clamp-2">{event.webinarName}</h3>
                <p className="mb-4 text-sm text-gray-600 line-clamp-3">{event.description}</p>

                {/* Event Details */}
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(event.scheduledAt)} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{event.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{event.registeredUsers?.length || 0}/{event.maxParticipants} registered</span>
                    </div>
                </div>

                {/* Skills Covered */}
                {event.skillsCovered?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {event.skillsCovered.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                {skill}
                            </span>
                        ))}
                        {event.skillsCovered.length > 3 && (
                            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                +{event.skillsCovered.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Card Footer */}
            <div className="mt-auto border-t border-gray-100 bg-gray-50 p-4">
                {/* Organizer Info */}
                {event.organizer && (
                    <div
                        className="mb-3 flex cursor-pointer items-center gap-2 transition-colors hover:text-blue-600"
                        onClick={() => event.organizer?._id && navigate(`/profile/${event.organizer._id}`)}
                    >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-bold text-white">
                            {event.organizer?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">{event.organizer?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">Organizer</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                    {canRegister && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRegister(event._id);
                            }}
                            className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                isRegistered
                                    ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-lg'
                            }`}
                        >
                            {isRegistered ? 'Unregister' : 'Register Now'}
                        </button>
                    )}
                    {isOrganizer && (
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/webinar-scheduler/${event._id}`);
                                }}
                                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(event._id);
                                }}
                                className="flex-1 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                    {event.meetingLink && event.status !== 'completed' && (isRegistered || isOrganizer) && (
                        <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-medium text-white transition-all hover:bg-green-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join Meeting
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebinarList;

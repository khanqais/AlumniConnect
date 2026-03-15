import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type FeedItemMeta = {
    likes?: number;
    downloads?: number;
    views?: number;
    readTime?: number | null;
    answers?: number;
    isSolved?: boolean;
    date?: string;
    mode?: string;
    status?: string;
    registrations?: number;
    tags?: string[];
};

export type FeedItem = {
    _id: string;
    type: 'resource' | 'blog' | 'question' | 'event' | 'announcement';
    title: string;
    description: string;
    category: string;
    actorName: string;
    actorRole: string;
    actorAvatar?: string;
    meta: FeedItemMeta;
    createdAt: string;
};

interface FeedCardProps {
    item: FeedItem;
}

const TYPE_CONFIG = {
    resource: {
        label: 'Resource',
        icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        bg: 'bg-blue-500/10',
        text: 'text-blue-300',
        border: 'border-blue-400/20',
        badge: 'bg-blue-500/15 text-blue-300 border border-blue-400/30',
        action: 'uploaded a resource',
        route: '/resources',
    },
    blog: {
        label: 'Blog',
        icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
        bg: 'bg-purple-500/10',
        text: 'text-purple-300',
        border: 'border-purple-400/20',
        badge: 'bg-purple-500/15 text-purple-300 border border-purple-400/30',
        action: 'published a blog',
        route: '/blogs',
    },
    question: {
        label: 'Q&A',
        icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
        bg: 'bg-amber-500/10',
        text: 'text-amber-300',
        border: 'border-amber-400/20',
        badge: 'bg-amber-500/15 text-amber-300 border border-amber-400/30',
        action: 'asked a question',
        route: '/community',
    },
    event: {
        label: 'Event',
        icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-300',
        border: 'border-emerald-400/20',
        badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
        action: 'created an event',
        route: '/webinars',
    },
    announcement: {
        label: 'Announcement',
        icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882A1 1 0 0112.447 5l6.382 3.191A1 1 0 0119.447 9v6a1 1 0 01-.618.927L12.447 19a1 1 0 01-.894 0l-6.382-3.073A1 1 0 014.553 15V9a1 1 0 01.618-.927L11.553 5z" />
            </svg>
        ),
        bg: 'bg-rose-500/10',
        text: 'text-rose-300',
        border: 'border-rose-400/20',
        badge: 'bg-rose-500/15 text-rose-300 border border-rose-400/30',
        action: 'posted an announcement',
        route: '/dashboard',
    },
} as const;

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const FeedCard = ({ item }: FeedCardProps) => {
    const navigate = useNavigate();
    const config = TYPE_CONFIG[item.type];
    const [avatarError, setAvatarError] = useState(false);
    const avatarSrc = avatarError || !item.actorAvatar
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(item.actorName)}&background=EEF2FF&color=4338CA&bold=true`
        : `http://localhost:5000/${item.actorAvatar}`;

    return (
        <div
            className={`rounded-2xl border border-white/10 bg-[#121620]/85 backdrop-blur-md p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 cursor-pointer`}
            onClick={() => navigate(config.route)}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <img
                        src={avatarSrc}
                        alt={item.actorName}
                        onError={() => setAvatarError(true)}
                        className="h-12 w-12 flex-shrink-0 rounded-full border border-white/20 object-cover"
                    />
                    {/* Actor info */}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                            {item.actorName}
                            <span className="font-normal text-gray-400 ml-1">{config.action}</span>
                        </p>
                        <p className="text-xs text-gray-500">{item.actorRole} • {timeAgo(item.createdAt)}</p>
                    </div>
                </div>

                {/* Type badge */}
                <span className={`flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.badge}`}>
                    {config.icon}
                    {config.label}
                </span>
            </div>

            {/* Content */}
            <div className={`rounded-lg border ${config.border} ${config.bg} p-3`}>
                <h3 className="text-sm font-semibold text-white line-clamp-1">{item.title}</h3>
                <p className="mt-1 text-xs text-gray-300 line-clamp-2">{item.description}</p>

                {/* Meta stats */}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    {/* Resource stats */}
                    {item.type === 'resource' && (
                        <>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {item.meta.likes ?? 0}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {item.meta.downloads ?? 0} downloads
                            </span>
                        </>
                    )}

                    {/* Blog stats */}
                    {item.type === 'blog' && (
                        <>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {item.meta.likes ?? 0}
                            </span>
                            {item.meta.readTime && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {item.meta.readTime} min read
                                </span>
                            )}
                        </>
                    )}

                    {/* Question stats */}
                    {item.type === 'question' && (
                        <>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                {item.meta.answers ?? 0} answers
                            </span>
                            {item.meta.isSolved && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 text-xs font-medium text-emerald-300">
                                    ✓ Solved
                                </span>
                            )}
                        </>
                    )}

                    {/* Event stats */}
                    {item.type === 'event' && item.meta.date && (
                        <>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(item.meta.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-xs capitalize text-gray-300">{item.meta.mode}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                item.meta.status === 'upcoming' ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300' :
                                item.meta.status === 'ongoing' ? 'bg-blue-500/15 border border-blue-400/30 text-blue-300' :
                                'bg-white/10 border border-white/15 text-gray-300'
                            }`}>
                                {item.meta.status}
                            </span>
                        </>
                    )}

                    {/* Announcement stats */}
                    {item.type === 'announcement' && (
                        <>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-6 2h4a2 2 0 002-2V10a2 2 0 00-2-2H9m0 8l-4 2V6l4 2m0 8V8" />
                                </svg>
                                {item.meta.views ?? 0} views
                            </span>
                        </>
                    )}

                    {/* Category chip */}
                    <span className="ml-auto rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-xs capitalize text-gray-300">
                        {item.category.replace(/-/g, ' ')}
                    </span>
                </div>
            </div>

            {/* Tags */}
            {item.meta.tags && item.meta.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {item.meta.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="rounded-full bg-white/5 border border-white/15 px-2 py-0.5 text-xs text-gray-300">
                            #{tag}
                        </span>
                    ))}
                    {item.meta.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{item.meta.tags.length - 3}</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default FeedCard;

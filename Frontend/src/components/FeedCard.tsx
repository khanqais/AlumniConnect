import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, BookOpen, MessageSquare, Calendar, Megaphone, Heart, Download, Eye } from 'lucide-react';

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
        icon: <FileText className="h-4 w-4" />,
        bg: 'bg-blue-500/10',
        text: 'text-blue-300',
        border: 'border-blue-400/20',
        badge: 'bg-blue-500/15 text-blue-300 border border-blue-400/30',
        action: 'uploaded a resource',
        route: '/resources',
    },
    blog: {
        label: 'Blog',
        icon: <BookOpen className="h-4 w-4" />,
        bg: 'bg-purple-500/10',
        text: 'text-purple-300',
        border: 'border-purple-400/20',
        badge: 'bg-purple-500/15 text-purple-300 border border-purple-400/30',
        action: 'published a blog',
        route: '/blogs',
    },
    question: {
        label: 'Q&A',
        icon: <MessageSquare className="h-4 w-4" />,
        bg: 'bg-amber-500/10',
        text: 'text-amber-300',
        border: 'border-amber-400/20',
        badge: 'bg-amber-500/15 text-amber-300 border border-amber-400/30',
        action: 'asked a question',
        route: '/community',
    },
    event: {
        label: 'Event',
        icon: <Calendar className="h-4 w-4" />,
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-300',
        border: 'border-emerald-400/20',
        badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
        action: 'created an event',
        route: '/webinars',
    },
    announcement: {
        label: 'Announcement',
        icon: <Megaphone className="h-4 w-4" />,
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
                                <Heart className="h-3.5 w-3.5" />
                                {item.meta.likes ?? 0}
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
                                <Heart className="h-3.5 w-3.5" />
                                {item.meta.likes ?? 0}
                            </span>
                            )}
                        </>
                    )}

                    {/* Question stats */}
                    {item.type === 'question' && (
                        <>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Download className="h-3.5 w-3.5" />
                                {item.meta.downloads ?? 0} downloads
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
                                <Calendar className="h-3.5 w-3.5" />
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
                                <Eye className="h-3.5 w-3.5" />
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

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
    type: 'resource' | 'blog' | 'question' | 'event';
    title: string;
    description: string;
    category: string;
    actorName: string;
    actorRole: string;
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
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-100',
        badge: 'bg-blue-100 text-blue-700',
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
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-100',
        badge: 'bg-purple-100 text-purple-700',
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
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-100',
        badge: 'bg-amber-100 text-amber-700',
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
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-100',
        badge: 'bg-green-100 text-green-700',
        action: 'created an event',
        route: '/webinars',
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

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const FeedCard = ({ item }: FeedCardProps) => {
    const navigate = useNavigate();
    const config = TYPE_CONFIG[item.type];

    return (
        <div
            className={`rounded-xl border ${config.border} bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer`}
            onClick={() => navigate(config.route)}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.bg} ${config.text} text-sm font-semibold`}>
                        {getInitials(item.actorName)}
                    </div>
                    {/* Actor info */}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {item.actorName}
                            <span className="font-normal text-gray-500 ml-1">{config.action}</span>
                        </p>
                        <p className="text-xs text-gray-400">{timeAgo(item.createdAt)}</p>
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
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                <p className="mt-1 text-xs text-gray-600 line-clamp-2">{item.description}</p>

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
                                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
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
                            <span className="text-xs capitalize text-gray-500">{item.meta.mode}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                item.meta.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                                item.meta.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {item.meta.status}
                            </span>
                        </>
                    )}

                    {/* Category chip */}
                    <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-500">
                        {item.category.replace(/-/g, ' ')}
                    </span>
                </div>
            </div>

            {/* Tags */}
            {item.meta.tags && item.meta.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {item.meta.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs text-gray-500">
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

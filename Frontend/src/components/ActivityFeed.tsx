import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import FeedCard, { type FeedItem } from './FeedCard';

type FilterType = 'all' | 'resource' | 'blog' | 'question' | 'event' | 'announcement';

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Resources', value: 'resource' },
    { label: 'Blogs', value: 'blog' },
    { label: 'Q&A', value: 'question' },
    { label: 'Events', value: 'event' },
    { label: 'Announcements', value: 'announcement' },
];

const ActivityFeed = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchFeed = useCallback(async (selectedFilter: FilterType, pageNum: number, replace: boolean) => {
        try {
            if (replace) setLoading(true);
            else setLoadingMore(true);

            const token = user?.token ?? localStorage.getItem('token');
            const res = await api.get(
                `/feed?filter=${selectedFilter}&page=${pageNum}&limit=10`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data: FeedItem[] = res.data?.data ?? [];

            setItems(prev => replace ? data : [...prev, ...data]);
            setHasMore(res.data?.pagination?.hasMore ?? false);
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError(error.message ?? 'Failed to load feed');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [user]);


    useEffect(() => {
        setPage(1);
        setItems([]);
        fetchFeed(filter, 1, true);
    }, [filter, fetchFeed]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchFeed(filter, nextPage, false);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-syne text-white">Activity Feed</h2>
                <button
                    onClick={() => fetchFeed(filter, 1, true)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-gray-200 shadow-sm transition-all duration-200 hover:scale-[1.03] hover:bg-white/10 hover:text-white"
                    title="Refresh feed"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
                {FILTER_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                            filter === opt.value
                                ? 'bg-amber-500 text-[#0A0D14] shadow-sm'
                                : 'bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Feed content */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse rounded-xl border border-white/10 bg-[#121620]/85 p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-9 w-9 rounded-full bg-white/10" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3.5 w-2/3 rounded bg-white/10" />
                                    <div className="h-3 w-1/4 rounded bg-white/10" />
                                </div>
                                <div className="h-6 w-20 rounded-full bg-white/10" />
                            </div>
                            <div className="rounded-lg bg-white/5 p-3 space-y-2">
                                <div className="h-3.5 w-3/4 rounded bg-white/10" />
                                <div className="h-3 w-full rounded bg-white/10" />
                                <div className="h-3 w-5/6 rounded bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-6 text-center">
                    <svg className="mx-auto mb-2 h-8 w-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-200">{error}</p>
                    <button
                        onClick={() => fetchFeed(filter, 1, true)}
                        className="mt-3 rounded-lg bg-red-500/80 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-500"
                    >
                        Try again
                    </button>
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-[#121620]/85 p-10 text-center">
                    <svg className="mx-auto mb-3 h-10 w-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-300">No activity yet</p>
                    <p className="mt-1 text-xs text-gray-400">Be the first to share something with the community!</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-3 transition-opacity duration-300">
                        {items.map(item => (
                            <FeedCard key={`${item.type}-${item._id}`} item={item} />
                        ))}
                    </div>

                    {/* Load more */}
                    {hasMore && (
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="w-full rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-gray-200 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:bg-white/10 disabled:opacity-60"
                        >
                            {loadingMore ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                'Load more'
                            )}
                        </button>
                    )}

                    {!hasMore && items.length > 0 && (
                        <p className="text-center text-xs text-gray-400 py-2">You're all caught up! 🎉</p>
                    )}
                </>
            )}
        </div>
    );
};

export default ActivityFeed;

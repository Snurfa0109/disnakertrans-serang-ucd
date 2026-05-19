import db from '@/lib/db';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Tag, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export const dynamic = 'force-dynamic';

/**
 * Auto-detect URLs in text and render them as clickable links.
 * Matches http://, https://, bit.ly/, and similar patterns.
 */
function renderWithLinks(text: string): React.ReactNode {
    const urlRegex = /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+|wa\.me\/[^\s]+)/gi;
    const parts = text.split(urlRegex);

    if (parts.length === 1) return text;

    return parts.map((part, i) => {
        if (urlRegex.test(part) || /^https?:\/\//i.test(part) || /^bit\.ly\//i.test(part) || /^wa\.me\//i.test(part)) {
            const href = part.startsWith('http') ? part : `https://${part}`;
            return (
                <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1E3A8A] underline underline-offset-2 hover:text-[#FBBF24] transition-colors font-medium break-all"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const item = db.prepare('SELECT * FROM news WHERE id = ?').get(id) as any;
    if (!item) return { title: 'Not Found' };
    return {
        title: `${item.title} | Disnakertrans Serang`,
        description: item.description || item.title,
    };
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const news = db.prepare('SELECT * FROM news WHERE id = ?').get(id) as any;

    if (!news) {
        notFound();
    }

    // Get related news (same category, exclude current)
    const related = db.prepare(
        'SELECT id, title, thumbnail, date, category FROM news WHERE id != ? ORDER BY date DESC LIMIT 3'
    ).all(id) as any[];

    return (
        <div className="min-h-screen pb-0 bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Hero Image */}
            {news.thumbnail && (
                <div className="relative w-full h-[300px] lg:h-[450px] bg-gray-200">
                    <img src={news.thumbnail} alt={news.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 via-transparent to-[#0A192F]/20" />
                </div>
            )}

            {!news.thumbnail && (
                <div className="pt-24 lg:pt-32" />
            )}

            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                {/* Article Card */}
                <article className={`bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${news.thumbnail ? '-mt-24 relative z-10' : 'mt-6'}`}>
                    <div className="p-8 lg:p-12">
                        {/* Back link */}
                        <Link href="/berita" className="inline-flex items-center text-[#1E3A8A] font-semibold mb-8 hover:gap-2 gap-1 transition-all text-sm">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Berita
                        </Link>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#0F172A] px-3 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {new Date(news.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            {news.category && (
                                <div className="flex items-center gap-1.5 bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 px-3 py-1.5 rounded-full text-sm text-[#1E3A8A] dark:text-[#93C5FD] font-medium">
                                    <Tag className="w-3.5 h-3.5" />
                                    {news.category}
                                </div>
                            )}
                            {news.source_name && (
                                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#0F172A] px-3 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400">
                                    <User className="w-3.5 h-3.5" />
                                    {news.source_name}
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
                            {news.title}
                        </h1>

                        {/* Description */}
                        {news.description && (
                            <div className="bg-[#F1F5F9] dark:bg-[#0F172A] rounded-xl p-5 mb-8 border-l-4 border-[#FBBF24]">
                                {news.description.split('\n').filter((line: string) => line.trim()).map((line: string, idx: number) => (
                                    <p key={idx} className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic mb-2 last:mb-0">
                                        {renderWithLinks(line)}
                                    </p>
                                ))}
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                            {(news.content || '').split('\n').filter((p: string) => p.trim()).map((paragraph: string, idx: number) => (
                                <p key={idx} className="leading-relaxed mb-4 text-[15px]">
                                    {renderWithLinks(paragraph)}
                                </p>
                            ))}
                        </div>

                        {/* Link Terkait Button */}
                        {news.link_url && (
                            <div className="mt-8 p-5 bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 rounded-xl border border-[#BFDBFE] dark:border-[#1E3A8A]/40">
                                <p className="text-xs font-semibold text-[#1E3A8A] mb-3 uppercase tracking-wider">Link Terkait</p>
                                <a
                                    href={news.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors shadow-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Buka Link
                                </a>
                                <p className="text-xs text-[#1E3A8A]/60 mt-2 break-all">{news.link_url}</p>
                            </div>
                        )}

                        {/* Source attribution (text only, no link) */}
                        {news.source_name && (
                            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-400">
                                    Sumber: {news.source_name}
                                </p>
                            </div>
                        )}
                    </div>
                </article>

                {/* Related News */}
                {related.length > 0 && (
                    <div className="mt-12 mb-16">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Berita Lainnya</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {related.map((item: any) => (
                                <Link href={`/berita/${item.id}`} key={item.id} className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-all">
                                    <div className="h-36 bg-gray-200 overflow-hidden">
                                        {item.thumbnail ? (
                                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                <Tag className="w-8 h-8 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[10px] text-gray-400 mb-1.5">
                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors">
                                            {item.title}
                                        </h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

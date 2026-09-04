"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, FileText, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryFallbackImage } from '@/lib/utils';

const PER_PAGE = 9;

interface NewsItem {
    id: number;
    title: string;
    description: string;
    category: string | null;
    thumbnail: string | null;
    source_name: string | null;
    date: string;
}

export default function BeritaPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const totalPages = Math.ceil(total / PER_PAGE);

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/news?page=${page}&perPage=${PER_PAGE}`);
            const data = await res.json();
            setNews(data.data || []);
            setTotal(data.meta?.total || 0);
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchNews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch { return dateStr; }
    };

    const featured = page === 1 ? news[0] : null;
    const gridNews = page === 1 ? news.slice(1) : news;

    // Generate page numbers with ellipsis logic
    const getPageNumbers = (): (number | "...")[] => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push("...");
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                pages.push(i);
            }
            if (page < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="min-h-screen pb-0 bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Hero Section */}
            <section className="bg-[#0A192F] pt-32 pb-24 lg:pt-40 lg:pb-32 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-80 h-80 bg-[#FBBF24] rounded-full blur-[140px]" />
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[120px]" />
                </div>
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center rounded-full border border-[#FBBF24] px-4 py-1.5 text-xs font-bold text-[#FBBF24] tracking-widest uppercase mb-6">
                            Pusat Informasi
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Berita & <span className="text-[#FBBF24]">Publikasi</span>
                        </h1>
                        <p className="text-base md:text-xl text-white/80 max-w-2xl leading-relaxed">
                            Kumpulan berita, pengumuman, dan artikel terbaru dari kegiatan Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 xl:px-12 py-12 lg:py-16">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" />
                    </div>
                ) : news.length === 0 ? (
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-16 text-center shadow-sm border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada berita diterbitkan</h3>
                        <p className="text-gray-500">Berita akan muncul di sini setelah data diambil dari sumber atau admin menambahkan artikel baru.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Article (page 1 only) */}
                        {featured && (
                            <Link href={`/berita/${featured.id}`} className="block mb-12 lg:mb-16 group">
                                <div className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="relative lg:w-7/12 h-64 lg:h-[420px] bg-gray-200 overflow-hidden">
                                            <img
                                                src={featured.thumbnail || getCategoryFallbackImage(featured.category)}
                                                alt={featured.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute top-5 left-5">
                                                <span className="bg-[#FBBF24] text-[#0A192F] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                                                    {featured.category || 'Berita Utama'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="lg:w-5/12 p-8 lg:p-10 flex flex-col justify-center">
                                            <div className="flex items-center text-xs text-gray-500 mb-4 gap-4">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(featured.date)}</span>
                                            </div>
                                            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors line-clamp-3">
                                                {featured.title}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-4 mb-6">
                                                {featured.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-[#1E3A8A] font-bold text-sm group-hover:gap-3 transition-all">
                                                Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                                            </div>
                                            {featured.source_name && (
                                                <p className="text-[10px] text-gray-400 mt-4 pt-4 border-t border-gray-100">
                                                    Sumber: {featured.source_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* News Grid */}
                        {gridNews.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {gridNews.map((item: NewsItem) => (
                                    <Link href={`/berita/${item.id}`} key={item.id} className="group flex flex-col bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1">
                                        <div className="h-52 bg-gray-200 relative overflow-hidden">
                                            <img
                                                src={item.thumbnail || getCategoryFallbackImage(item.category)}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {item.category && (
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-white/90 backdrop-blur-sm text-[10px] uppercase font-bold px-3 py-1.5 rounded-full text-[#1E3A8A] shadow-sm">
                                                        {item.category}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center text-xs text-gray-500 mb-3 gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formatDate(item.date)}</span>
                                            </div>
                                            <h3 className="text-lg font-bold mb-3 group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors leading-snug line-clamp-2 text-gray-900 dark:text-white">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                                                {item.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <span className="text-[#1E3A8A] font-bold text-xs flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                                                    Baca Artikel <ArrowRight className="w-3.5 h-3.5" />
                                                </span>
                                                {item.source_name && (
                                                    <span className="text-[10px] text-gray-400">{item.source_name}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center mt-16 gap-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {/* Page Numbers */}
                                {getPageNumbers().map((p, idx) =>
                                    p === "..." ? (
                                        <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
                                                page === p
                                                    ? "bg-[#0A192F] text-white shadow-md"
                                                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                                {/* Next Button */}
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Page info */}
                        {totalPages > 1 && (
                            <p className="text-center text-xs text-gray-400 mt-4">
                                Halaman {page} dari {totalPages} • Total {total} berita
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

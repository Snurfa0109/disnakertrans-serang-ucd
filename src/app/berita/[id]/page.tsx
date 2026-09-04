import sql from '@/lib/db';
import { notFound } from 'next/navigation';
import { Calendar, User, Eye, ChevronRight, Home, Phone, Mail, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import ShareButtons from '@/components/ShareButtons';
import { getCategoryFallbackImage } from '@/lib/utils';

export const revalidate = 60;

function renderWithLinks(text: string): React.ReactNode {
    const urlRegex = /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+|wa\.me\/[^\s]+)/gi;
    const parts = text.split(urlRegex);
    if (parts.length === 1) return text;
    return parts.map((part, i) => {
        if (/^https?:\/\//i.test(part) || /^bit\.ly\//i.test(part) || /^wa\.me\//i.test(part)) {
            const href = part.startsWith('http') ? part : `https://${part}`;
            return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] underline underline-offset-2 hover:text-[#FBBF24] transition-colors break-all">{part}</a>;
        }
        return part;
    });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const rows = await sql`SELECT * FROM news WHERE id = ${parseInt(id)}`;
    const item = rows[0] as any;
    if (!item) return { title: 'Berita Tidak Ditemukan | Disnakertrans Serang' };

    const title = `${item.title} | Disnakertrans Serang`;
    const description = item.description || item.title;
    const thumbnail = item.thumbnail || getCategoryFallbackImage(item.category);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime: item.date,
            section: item.category || 'Berita',
            images: thumbnail ? [{ url: thumbnail, alt: item.title }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: thumbnail ? [thumbnail] : [],
        },
    };
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const newsRows = await sql`SELECT * FROM news WHERE id = ${parseInt(id)}`;
    const news = newsRows[0] as any;
    if (!news) notFound();

    const related = await sql`SELECT id, title, thumbnail, date, category FROM news WHERE id != ${parseInt(id)} ORDER BY date DESC LIMIT 3` as any[];

    const paragraphs = ((news.content && news.content.trim()) ? news.content : (news.description || ''))
        .split('\n').filter((p: string) => p.trim());

    const date = new Date(news.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const tags = [news.category, 'Disnakertrans', 'Serang'].filter(Boolean);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
            <div className="bg-white dark:bg-[#111827] border-b border-gray-100 dark:border-gray-800 pt-20 lg:pt-24">
                <div className="container mx-auto px-4 xl:px-12 py-3">
                    <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
                        <Link href="/" className="hover:text-gray-700 flex items-center gap-1 transition-colors">
                            <Home className="w-3 h-3" />Beranda
                        </Link>
                        <ChevronRight className="w-3 h-3 shrink-0" />
                        <Link href="/berita" className="hover:text-gray-700 transition-colors">Berita</Link>
                        <ChevronRight className="w-3 h-3 shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[220px]">{news.title}</span>
                    </nav>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border-b border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 xl:px-12 pt-8 pb-6">
                    {news.category && (
                        <span className="inline-block bg-[#FBBF24] text-[#78350F] text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded mb-4">
                            {news.category}
                        </span>
                    )}
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-5 max-w-4xl">
                        {news.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#FBBF24]" />
                            {date}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-[#FBBF24]" />
                            {news.source_name || 'Humas Disnakertrans'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-[#FBBF24]" />
                            1.245 Kali Dibaca
                        </span>
                    </div>
                </div>
            </div>

            <div className="w-full overflow-hidden bg-gray-200 dark:bg-gray-800" style={{ maxHeight: '460px' }}>
                <img
                    src={news.thumbnail || getCategoryFallbackImage(news.category)}
                    alt={news.title}
                    className="w-full object-cover object-center"
                    style={{ maxHeight: '460px', width: '100%' }}
                />
            </div>

            <div className="container mx-auto px-4 xl:px-12 py-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <article className="flex-1 min-w-0">

                        {/* Description / Lead */}
                        {news.description && (
                            <div className="bg-[#F1F5F9] dark:bg-[#1E293B] rounded-xl p-5 mb-6 border-l-4 border-[#FBBF24]">
                                <p className="text-gray-700 dark:text-gray-300 text-sm italic leading-relaxed">
                                    {news.description}
                                </p>
                            </div>
                        )}

                        {/* Body text with drop-cap on first paragraph */}
                        <div className="space-y-4">
                            {paragraphs.map((para: string, idx: number) => (
                                <p
                                    key={idx}
                                    className={`text-gray-700 dark:text-gray-300 leading-[1.9] text-[15px] ${idx === 0 && !news.description ? 'first-letter:text-[4rem] first-letter:font-extrabold first-letter:leading-[0.75] first-letter:float-left first-letter:mr-3 first-letter:text-[#0A192F] dark:first-letter:text-white' : ''}`}
                                >
                                    {renderWithLinks(para)}
                                </p>
                            ))}
                        </div>

                        {/* External link */}
                        {news.link_url && (
                            <div className="mt-8 p-5 bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 rounded-xl border border-[#BFDBFE] dark:border-[#1E3A8A]/40">
                                <p className="text-xs font-bold text-[#1E3A8A] mb-2 uppercase tracking-wider">Tautan Terkait</p>
                                <a href={news.link_url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#172554] transition-colors">
                                    Buka Tautan →
                                </a>
                            </div>
                        )}

                        {news.thumbnail && (
                            <div className="mt-10">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-4 h-0.5 bg-[#FBBF24] inline-block" />
                                    Galeri Dokumentasi
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[news.thumbnail, news.thumbnail, news.thumbnail].map((img, i) => (
                                        <div key={i} className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in">
                                            <img src={img} alt={`Dokumentasi ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                            <p className="text-xs text-gray-400">Sumber: {news.source_name || 'Disnakertrans Kab. Serang'}</p>
                            <ShareButtons title={news.title} />
                        </div>

                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/berita"
                                className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-[#FBBF24] transition-colors group">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">← Berita Sebelumnya</p>
                                <p className="text-sm font-semibold text-gray-700 dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors">
                                    Kembali ke Daftar Berita
                                </p>
                            </Link>
                            <Link href="/berita"
                                className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-[#FBBF24] transition-colors text-right group">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Berita Selanjutnya →</p>
                                <p className="text-sm font-semibold text-gray-700 dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors">
                                    Lihat Berita Terbaru
                                </p>
                            </Link>
                        </div>
                    </article>

                    <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0 space-y-5 lg:sticky lg:top-28">

                        {/* Contact card */}
                        <div className="bg-[#0A192F] rounded-2xl p-6 text-white">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-[#FBBF24] mb-5">
                                Informasi Kontak
                            </p>
                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <Phone className="w-3.5 h-3.5 text-[#FBBF24]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Telepon</p>
                                        <p className="text-sm text-white font-medium">+62 (0254) 200513</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <Mail className="w-3.5 h-3.5 text-[#FBBF24]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Email</p>
                                        <p className="text-xs text-white font-medium break-all">disnakertrans@serangkab.go.id</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <MapPin className="w-3.5 h-3.5 text-[#FBBF24]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Alamat</p>
                                        <p className="text-xs text-white/80 leading-relaxed">Jl. Raya Serang - Pandeglang No. 34, Kramatwatu, Kab. Serang</p>
                                    </div>
                                </div>
                            </div>
                            <a href="/pengaduan"
                                className="block w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-[#78350F] font-bold py-3 rounded-xl text-center text-sm transition-colors">
                                Hubungi Kami Sekarang
                            </a>
                        </div>

                        {/* Tags */}
                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 flex items-center gap-2">
                                <Tag className="w-3 h-3" /> Tags Populer
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <span key={i}
                                        className="bg-[#F1F5F9] dark:bg-[#0F172A] text-gray-600 dark:text-gray-400 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#FBBF24] hover:text-[#78350F] transition-colors cursor-pointer">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Recent news in sidebar */}
                        {related.length > 0 && (
                            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">Berita Terkini</p>
                                <div className="space-y-4">
                                    {related.map((item: any) => (
                                        <Link key={item.id} href={`/berita/${item.id}`} className="flex gap-3 group">
                                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                                                {item.thumbnail
                                                    ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium line-clamp-2 leading-snug group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors">
                                                    {item.title}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {/* ── Related News (full-width) ── */}
            {related.length > 0 && (
                <section className="bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800 py-14">
                    <div className="container mx-auto px-4 xl:px-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-[#B45309]">Lanjut Membaca</span>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">Berita Terkait</h2>
                            </div>
                            <Link href="/berita" className="text-sm font-semibold text-[#1E3A8A] hover:underline">
                                Lihat Semua Berita →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {related.map((item: any) => (
                                <Link href={`/berita/${item.id}`} key={item.id} className="group">
                                    <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-4 relative">
                                        {item.thumbnail
                                            ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            : <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />}
                                        {item.category && (
                                            <span className="absolute top-3 left-3 bg-[#FBBF24] text-[#78350F] text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

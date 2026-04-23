import db from '@/lib/db';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const item = db.prepare('SELECT * FROM news WHERE id = ?').get(id) as any;
    if (!item) return { title: 'Not Found' };
    return { title: `${item.title} | Disnakertrans` };
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const news = db.prepare('SELECT * FROM news WHERE id = ?').get(id) as any;

    if (!news) {
        notFound();
    }

    return (
        <div className="min-h-screen pb-20 bg-gray-50/30">
            <div className="container mx-auto px-4 lg:px-8 mt-12 max-w-4xl">
                <Link href="/berita" className="inline-flex items-center text-primary font-semibold mb-8 hover:gap-2 gap-1 transition-all">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Berita
                </Link>

                <article className="bg-white rounded-3xl p-6 lg:p-12 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                            <Calendar className="w-4 h-4" />
                            {new Date(news.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full hidden sm:flex">
                            <User className="w-4 h-4" />
                            Admin
                        </div>
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
                        {news.title}
                    </h1>

                    {news.thumbnail && (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden mb-10 shadow-sm">
                            <img src={news.thumbnail} alt={news.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                        {news.content.split('\n').map((paragraph: string, idx: number) => (
                            <p key={idx} className="leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </article>
            </div>
        </div>
    );
}

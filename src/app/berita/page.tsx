import Link from 'next/link';
import db from '@/lib/db';
import { ArrowRight, FileText, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = { title: "Berita | Disnakertrans Serang" };

export default function BeritaPage() {
    const news = db.prepare('SELECT * FROM news ORDER BY date DESC').all() as any[];

    return (
        <div className="min-h-screen pb-20 bg-gray-50/30">
            <div className="bg-primary pt-12 pb-16 text-white text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Berita Terkini</h1>
                    <p className="text-white/80 max-w-2xl mx-auto text-lg">
                        Kumpulan berita, pengumuman, dan artikel terbaru kegiatan Disnakertrans Kabupaten Serang.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-12">
                {news.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada berita diterbitkan</h3>
                        <p className="text-gray-500">Berita akan muncul di sini setelah admin menambahkan artikel baru.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {news.map((item) => (
                            <Link href={`/berita/${item.id}`} key={item.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                                <div className="h-56 bg-gray-200 relative overflow-hidden flex items-center justify-center text-gray-400">
                                    {item.thumbnail ? (
                                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <FileText className="w-16 h-16 opacity-50" />
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center text-xs font-semibold text-primary mb-4 bg-primary/10 w-fit px-3 py-1.5 rounded-full mt-2">
                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 drop-shadow-sm">{item.description}</p>
                                    <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all border-t border-gray-100 pt-4 mt-auto">Baca Artikel <ArrowRight className="w-4 h-4" /></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

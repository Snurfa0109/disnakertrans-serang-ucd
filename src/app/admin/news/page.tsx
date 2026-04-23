"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, FileText } from "lucide-react";

export default function AdminNewsDashboard() {
    const [news, setNews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', content: '', thumbnail: '' });

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/news');
            const data = await res.json();
            setNews(data);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                date: new Date().toISOString()
            };
            await fetch('/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            setIsAdding(false);
            setFormData({ title: '', description: '', content: '', thumbnail: '' });
            fetchNews();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus berita ini?')) return;
        try {
            await fetch(`/api/news/${id}`, { method: 'DELETE' });
            fetchNews();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard: Berita</h1>
                    <p className="text-gray-500">Kelola artikel dan berita website</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-primary-hover"
                >
                    <Plus className="w-4 h-4" /> Tambah Berita
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-xl font-bold mb-6">Tulis Berita Baru</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Utama</label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat (Snippet)</label>
                            <input required type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Thumbnail (Opsional)</label>
                            <input type="text" value={formData.thumbnail} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} className="w-full border rounded-lg p-2" placeholder="https://example.com/image.jpg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konten Berita</label>
                            <textarea required rows={8} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full border rounded-lg p-2"></textarea>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 font-medium">Batal</button>
                            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-medium">Simpan & Terbitkan</button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                <th className="p-4 font-semibold">Judul Berita</th>
                                <th className="p-4 font-semibold w-1/4">Tanggal</th>
                                <th className="p-4 font-semibold w-24 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center text-gray-500">Belum ada berita</td></tr>
                            ) : (
                                news.map(item => (
                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{item.title}</td>
                                        <td className="p-4 text-gray-500 text-sm flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-5 h-5 mx-auto" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

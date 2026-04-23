"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const dataTenagaKerja = [
    { name: '2023', 'Pencari Kerja': 12000, 'Terserap': 8500 },
    { name: '2024', 'Pencari Kerja': 14500, 'Terserap': 10200 },
    { name: '2025', 'Pencari Kerja': 15800, 'Terserap': 12100 },
];

export default function DataLayananPage() {
    return (
        <div className="min-h-screen pb-20 bg-gray-50">
            <div className="bg-primary pt-12 pb-16 text-white text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Data Layanan Ketenagakerjaan</h1>
                    <p className="text-white/80 max-w-2xl mx-auto text-lg">
                        Statistik dan data terbuka mengenai ketenagakerjaan, pelatihan, dan penempatan di Kabupaten Serang.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-12 max-w-6xl space-y-12">
                {/* Statistik Pencari Kerja vs Terserap */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Penyerapan Tenaga Kerja (Tahunan)</h2>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dataTenagaKerja}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                barSize={40}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="Pencari Kerja" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Terserap" fill="#1B5E20" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tabel Data Layanan */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 lg:px-8 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">Peserta Pelatihan Kerja Berbasis Kompetensi</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-700">
                                    <th className="py-4 px-6 font-semibold border-b border-gray-200">Kejuruan</th>
                                    <th className="py-4 px-6 font-semibold border-b border-gray-200 text-center">Peserta</th>
                                    <th className="py-4 px-6 font-semibold border-b border-gray-200 text-center">Lulus Tersertifikasi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                                    <td className="py-4 px-6">Teknik Las (Welding)</td>
                                    <td className="py-4 px-6 text-center">120</td>
                                    <td className="py-4 px-6 text-center text-green-600 font-medium">105</td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                                    <td className="py-4 px-6">Menjahit Garmen</td>
                                    <td className="py-4 px-6 text-center">80</td>
                                    <td className="py-4 px-6 text-center text-green-600 font-medium">78</td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                                    <td className="py-4 px-6">Teknologi Informasi (Desain Grafis)</td>
                                    <td className="py-4 px-6 text-center">150</td>
                                    <td className="py-4 px-6 text-center text-green-600 font-medium">142</td>
                                </tr>
                                <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                                    <td className="py-4 px-6">Tata Boga</td>
                                    <td className="py-4 px-6 text-center">60</td>
                                    <td className="py-4 px-6 text-center text-green-600 font-medium">60</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

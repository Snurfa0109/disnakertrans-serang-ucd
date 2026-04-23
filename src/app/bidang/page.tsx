import { Users, Briefcase, UserCog, Building2, Map } from "lucide-react";

export const metadata = {
    title: "Bidang | Disnakertrans Serang"
};

export default function BidangPage() {
    const bidangList = [
        {
            title: "Sekretariat",
            description: "Menyelenggarakan pelayanan administrasi umum, kepegawaian, keuangan, dan perencanaan evaluasi pelaporan dinas.",
            icon: <Building2 className="w-8 h-8" />
        },
        {
            title: "Pembinaan Penempatan Tenaga Kerja (Binapenta)",
            description: "Menangani informasi pasar kerja, penyuluhan jabatan, dan fasilitasi penempatan tenaga kerja lokal, antar daerah maupun antar negara.",
            icon: <Briefcase className="w-8 h-8" />
        },
        {
            title: "Pelatihan dan Produktivitas Tenaga Kerja (Lattas)",
            description: "Melaksanakan program peningkatan kompetensi tenaga kerja melalui balai latihan kerja dan penyelenggaraan sertifikasi profesi.",
            icon: <UserCog className="w-8 h-8" />
        },
        {
            title: "Hubungan Industrial & Jamsostek",
            description: "Membina dan mengawasi pelaksanaan persyarat kerja, jaminan sosial tenaga kerja, ruang dialog bipartit, serta penyelesaian perselisihan.",
            icon: <Users className="w-8 h-8" />
        },
        {
            title: "Ketransmigrasian",
            description: "Melaksanakan program pembangunan dan pengembangan kawasan transmigrasi demi pemerataan penduduk dan kesejahteraan.",
            icon: <Map className="w-8 h-8" />
        }
    ];

    return (
        <div className="min-h-screen pb-20 bg-gray-50">
            <div className="bg-white border-b border-gray-200 pt-16 pb-16">
                <div className="container mx-auto px-4 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">Bidang Pelayanan</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Bidang-bidang operasional di bawah naungan Dinas Tenaga Kerja dan Transmigrasi untuk melayani masyarakat.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bidangList.map((bidang, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all group hover:-translate-y-1">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {bidang.icon}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">{bidang.title}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {bidang.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

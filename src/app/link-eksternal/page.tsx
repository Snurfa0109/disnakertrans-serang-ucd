import { ExternalLink } from "lucide-react";

export const metadata = { title: "Link Eksternal | Disnakertrans" };

export default function LinkEksternalPage() {
    const links = [
        { title: "E-SAKIP", url: "#", desc: "Sistem Akuntabilitas Kinerja Instansi Pemerintah" },
        { title: "AK-1 (Kartu Kuning)", url: "#", desc: "Pembuatan Kartu Pencari Kerja secara online" },
        { title: "OSS RBA", url: "#", desc: "Online Single Submission Risk Based Approach (Perizinan)" },
        { title: "Karirhub", url: "#", desc: "Portal Lowongan Kerja Nasional dari Kemnaker RI" }
    ];

    return (
        <div className="min-h-screen pb-20 bg-gray-50/30">
            <div className="bg-primary pt-12 pb-16 text-white text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Link Eksternal</h1>
                    <p className="text-white/80 max-w-2xl mx-auto text-lg">
                        Akses cepat ke berbagai sistem layanan terintegrasi milik instansi pemerintah terkait.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-12 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {links.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all group flex flex-col justify-between min-h-[160px]"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{link.title}</h2>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                        <ExternalLink className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-gray-600">
                                    {link.desc}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

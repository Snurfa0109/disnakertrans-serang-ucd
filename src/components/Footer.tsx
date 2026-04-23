import { MapPin, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#F8FAFC] text-gray-700 mt-auto flex flex-col pt-16 pb-8 border-t border-gray-200">
            <div className="container mx-auto px-4 xl:px-12 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand Col */}
                    <div className="space-y-6">
                        <h2 className="text-[#1E3A8A] font-extrabold text-xl tracking-wider">
                            DISNAKERTRANS
                        </h2>
                        <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
                            Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang. Melayani dengan integritas dan inovasi untuk masyarakat Serang.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center hover:bg-opacity-80 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center hover:bg-opacity-80 transition-opacity">
                                <Globe className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Tautan Cepat */}
                    <div>
                        <h4 className="text-[15px] font-bold mb-6 text-[#1E3A8A]">Tautan Cepat</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">Hubungi Kami</Link></li>
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">Media Sosial</Link></li>
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">Alamat Kantor</Link></li>
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">Peta Lokasi</Link></li>
                        </ul>
                    </div>

                    {/* Kontak Kami */}
                    <div>
                        <h4 className="text-[15px] font-bold mb-6 text-[#1E3A8A]">Kontak Kami</h4>
                        <ul className="space-y-5 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                                <span className="leading-relaxed">
                                    Jl. K.H. Abdul Fatah Hasan No.24, Serang, Kec. Serang, Kota Serang, Banten 42118
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-[#1E3A8A] shrink-0" />
                                <span>(0254) 200234</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-[#1E3A8A] shrink-0" />
                                <span className="truncate">disnakertrans@serangkab.go.id</span>
                            </li>
                        </ul>
                    </div>

                    {/* Lokasi Kantor */}
                    <div>
                        <h4 className="text-[15px] font-bold mb-6 text-[#1E3A8A]">Lokasi Kantor</h4>
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-200">
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Map Placeholder" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Strip */}
            <div className="mt-16 pt-8 border-t border-gray-200">
                <div className="container mx-auto px-4 xl:px-12 text-center">
                    <p className="text-xs text-gray-500">
                        © 2024 Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

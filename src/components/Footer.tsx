import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#F8FAFC] text-gray-700 mt-auto flex flex-col pt-16 pb-8 border-t border-gray-200">
            <div className="container mx-auto px-4 xl:px-12 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand Col */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 shrink-0">
                                <img src="/images/logokabserang.png" alt="Logo Kab Serang" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-1 h-12 bg-[#1E3A8A]/20 rounded-full mx-1"></div>
                            <div className="flex flex-col">
                                <span className="text-[#1E3A8A] font-extrabold text-[15px] lg:text-[17px] tracking-tight leading-[1.1]">
                                    Dinas Tenaga Kerja <br />
                                    & Transmigrasi
                                </span>
                                <span className="text-gray-700 text-[9px] lg:text-[11px] font-medium tracking-wide mt-1">Pemerintah Kabupaten Serang</span>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
                            Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang. Melayani dengan integritas dan inovasi untuk masyarakat Serang.
                        </p>
                        <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
                            <a href="https://www.facebook.com/DisnakertransKab.Srg/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm cursor-pointer hover:-translate-y-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/disnakertrans.kabserang?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm cursor-pointer hover:-translate-y-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Tautan Cepat */}
                    <div>
                        <h4 className="text-[15px] font-bold mb-6 text-[#1E3A8A]">Tautan Cepat</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li><a href="mailto:disnakertrans@serangkab.go.id" className="hover:text-[#1E3A8A] transition-colors">Hubungi Kami</a></li>
                            <li><a href="https://www.instagram.com/disnakertrans.kabserang" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E3A8A] transition-colors">Media Sosial</a></li>
                            <li><a href="https://maps.app.goo.gl/wTa7unGsbCJjCZdb8" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E3A8A] transition-colors">Alamat Kantor</a></li>
                            <li><a href="https://maps.app.goo.gl/wTa7unGsbCJjCZdb8" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E3A8A] transition-colors">Peta Lokasi</a></li>
                        </ul>
                    </div>

                    {/* Kontak Kami */}
                    <div>
                        <h4 className="text-[15px] font-bold mb-6 text-[#1E3A8A]">Kontak Kami</h4>
                        <ul className="space-y-5 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                                <a href="https://maps.app.goo.gl/wTa7unGsbCJjCZdb8" target="_blank" rel="noopener noreferrer" className="leading-relaxed hover:text-[#1E3A8A] hover:underline transition-colors">
                                    Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kabupaten Serang, Banten
                                </a>
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
                        <a href="https://maps.app.goo.gl/wTa7unGsbCJjCZdb8" target="_blank" rel="noopener noreferrer" className="block w-full h-32 rounded-lg overflow-hidden relative shadow-sm border border-gray-200 group">
                            <iframe
                                src="https://maps.google.com/maps?q=V752%2BQ7%20Kaserangan%2C%20Kabupaten%20Serang%2C%20Banten&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                className="w-full h-full pointer-events-none"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="bg-white text-[#1E3A8A] text-xs font-bold px-3 py-1.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                    Buka di Google Maps
                                </span>
                            </div>
                        </a>
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

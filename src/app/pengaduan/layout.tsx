import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pengaduan Ketenagakerjaan Online',
  description: 'Layanan aspirasi dan pengaduan ketenagakerjaan online resmi Disnakertrans Kabupaten Serang. Sampaikan pengaduan umum, sengketa hubungan industrial, K3, dan hak pekerja secara aman dan transparan.',
  openGraph: {
    title: 'Pengaduan Ketenagakerjaan Online | Disnakertrans Kab. Serang',
    description: 'Sampaikan pengaduan ketenagakerjaan secara langsung dan aman kepada Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang. Respon terverifikasi maksimal 3x24 jam kerja.',
    type: 'website',
  },
};

export default function PengaduanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

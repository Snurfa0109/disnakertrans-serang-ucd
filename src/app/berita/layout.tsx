import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warta & Berita Terkini',
  description: 'Informasi dan berita terkini seputar ketenagakerjaan, pelatihan vokasi, program transmigrasi, dan agenda Disnakertrans Kabupaten Serang.',
  openGraph: {
    title: 'Warta & Berita Terkini | Disnakertrans Kab. Serang',
    description: 'Informasi dan berita terkini seputar ketenagakerjaan dan kegiatan Pemerintah Kabupaten Serang.',
    type: 'website',
  },
};

export default function BeritaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

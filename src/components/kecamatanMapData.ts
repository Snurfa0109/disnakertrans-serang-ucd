export interface KecamatanInfo {
  id: string;
  name: string;
  jumlahDesa: number;
  desa: string[];
  color: string;
  hoverColor: string;
  textColor: string;
  cx: number;
  cy: number;
  path: string;
}

export const kecamatanData: KecamatanInfo[] = [
  {
    id:'pulo-ampel', name:'Pulo Ampel', jumlahDesa:9,
    desa:['Argawana','Banyuwangi','Mangunreja','Pulo Ampel','Salira','Margasari','Sumuranja','Tembulun','Tembulun Sari'],
    color:'#6366F1', hoverColor:'#4F46E5', textColor:'#fff',
    cx:370, cy:75,
    path:'M340,15 L355,10 L390,10 L415,25 L425,60 L430,100 L420,140 L395,155 L370,158 L345,150 L325,130 L315,95 L318,55 L330,30 Z'
  },
  {
    id:'bojonegara', name:'Bojonegara', jumlahDesa:11,
    desa:['Bojonegara','Karang Kepuh','Kertasana','Lambangsari','Mangkunegara','Margagiri','Mekar Jaya','Pakuncen','Pengarengan','Ukirsari','Wanakarta'],
    color:'#67E8F9', hoverColor:'#22D3EE', textColor:'#0E7490',
    cx:310, cy:220,
    path:'M235,145 L270,130 L315,130 L345,150 L370,158 L395,155 L405,175 L400,210 L385,245 L360,275 L330,290 L290,295 L255,285 L235,260 L225,225 L225,180 Z'
  },
  {
    id:'kramatwatu', name:'Kramatwatu', jumlahDesa:15,
    desa:['Harjatani','Kramatwatu','Lebakwana','Margasana','Pamengkang','Pegadingan','Pejaten','Pelamunan','Serdang','Terate','Wanayasa','Toyomerto','Teluk Terate','Kaserangan','Kamasan'],
    color:'#E2E8F0', hoverColor:'#CBD5E1', textColor:'#1E293B',
    cx:420, cy:330,
    path:'M360,275 L385,255 L405,260 L440,265 L480,275 L510,300 L525,335 L515,375 L490,400 L450,415 L410,410 L375,395 L350,370 L340,340 Z'
  },
  {
    id:'tirtayasa', name:'Tirtayasa', jumlahDesa:14,
    desa:['Alang-alang','Kebon','Lontar','Pontang Legon','Sujung','Tirtayasa','Laban','Samparwadi','Susukan','Pematang Baru','Tengkurak','Sewor','Wargasara','Karangkesombang'],
    color:'#BEF264', hoverColor:'#A3E635', textColor:'#365314',
    cx:700, cy:175,
    path:'M620,75 L670,65 L720,75 L760,110 L775,160 L770,220 L740,265 L700,280 L660,270 L630,240 L610,200 L605,150 L610,110 Z'
  },
  {
    id:'tanara', name:'Tanara', jumlahDesa:9,
    desa:['Bendung','Cerukcuk','Lempuyang','Sukamanah','Tanara','Tenjo Ayu','Pedaleman','Sireman','Domas Awal'],
    color:'#EF4444', hoverColor:'#DC2626', textColor:'#fff',
    cx:830, cy:175,
    path:'M775,90 L815,75 L860,80 L895,105 L910,145 L905,195 L885,240 L855,270 L820,275 L785,255 L770,220 L775,160 L780,120 Z'
  },
  {
    id:'pontang', name:'Pontang', jumlahDesa:11,
    desa:['Domas','Keserangan','Kubang Puji','Pontang','Singarajan','Linduk','Pulo Kencana','Sukanagara','Wanakerta','Kaserangan','Mangkunegara'],
    color:'#FDA4AF', hoverColor:'#FB7185', textColor:'#881337',
    cx:645, cy:310,
    path:'M590,245 L630,235 L660,270 L700,280 L740,265 L730,310 L710,350 L680,380 L640,385 L600,370 L580,340 L575,300 Z'
  },
  {
    id:'lebak-wangi', name:'Lebak Wangi', jumlahDesa:10,
    desa:['Bolang','Kamaruton','Lebak Wangi','Purwadadi','Tegalwangi','Keboncau','Melati','Sindangmandi','Tirem','Parakan'],
    color:'#FDBA74', hoverColor:'#FB923C', textColor:'#7C2D12',
    cx:700, cy:395,
    path:'M660,355 L680,380 L710,350 L730,310 L755,330 L770,365 L760,410 L730,440 L695,445 L660,430 L645,400 Z'
  },
  {
    id:'carenang', name:'Carenang', jumlahDesa:8,
    desa:['Carenang','Mandaya','Mekarsari','Pamanuk','Panenjoan','Ragasmesigit','Teras','Walikukun'],
    color:'#A5F3FC', hoverColor:'#67E8F9', textColor:'#155E75',
    cx:790, cy:345,
    path:'M740,265 L770,255 L820,275 L855,310 L850,370 L825,405 L790,415 L760,410 L755,370 L755,330 L740,310 Z'
  },
  {
    id:'ciruas', name:'Ciruas', jumlahDesa:15,
    desa:['Beberan','Bumijaya','Ciruas','Citerep','Kadikaran','Karangpilang','Kepandean','Pamong','Penggalang','Plawad','Singamerta','Ranjeng','Gosara','Kalanganyar','Pulo'],
    color:'#4ADE80', hoverColor:'#22C55E', textColor:'#14532D',
    cx:635, cy:430,
    path:'M590,380 L640,385 L660,400 L660,430 L695,445 L695,470 L670,490 L635,500 L600,485 L580,455 L575,420 Z'
  },
  {
    id:'kragilan', name:'Kragilan', jumlahDesa:12,
    desa:['Cisait','Dukuh','Jeruktipis','Kendayakan','Kragilan','Kramatjati','Pematang','Sentul','Undar-Andir','Tegalmaja','Sukajadi','Tegal'],
    color:'#E9D5FF', hoverColor:'#D8B4FE', textColor:'#581C87',
    cx:680, cy:500,
    path:'M635,455 L670,490 L695,470 L730,470 L745,500 L740,545 L715,570 L680,575 L645,560 L620,530 L615,490 Z'
  },
  {
    id:'binuang', name:'Binuang', jumlahDesa:7,
    desa:['Binuang','Cakung','Gembor','Lamaran','Renged','Sukamaju','Warakas'],
    color:'#BFDBFE', hoverColor:'#93C5FD', textColor:'#1E3A8A',
    cx:810, cy:450,
    path:'M770,395 L790,415 L825,405 L855,420 L865,470 L850,510 L820,520 L785,510 L760,480 L755,445 L760,415 Z'
  },
  {
    id:'kibin', name:'Kibin', jumlahDesa:9,
    desa:['Barengkok','Ciagel','Cijeruk','Kibin','Nagara','Nambo Ilir','Sukamaju','Tambak','Tegal Gandu'],
    color:'#BAE6FD', hoverColor:'#7DD3FC', textColor:'#0C4A6E',
    cx:810, cy:545,
    path:'M770,500 L820,520 L850,510 L870,540 L870,580 L845,610 L810,620 L775,610 L750,580 L745,545 L755,515 Z'
  },
  {
    id:'cikande', name:'Cikande', jumlahDesa:13,
    desa:['Bakung','Cikande','Cikande Permai','Gembor Udik','Kamurang','Koper','Leuwilimus','Nambo Udik','Parik','Situterate','Songgom Jaya','Sukatani','Julang'],
    color:'#C084FC', hoverColor:'#A855F7', textColor:'#fff',
    cx:855, cy:640,
    path:'M810,590 L845,610 L870,580 L900,600 L915,645 L905,690 L875,710 L840,705 L810,685 L795,650 L800,615 Z'
  },
  {
    id:'bandung', name:'Bandung', jumlahDesa:8,
    desa:['Babakan','Bandung','Blokang','Malabar','Mander','Panamping','Pringwulung','Sodong'],
    color:'#FCA5A5', hoverColor:'#F87171', textColor:'#7F1D1D',
    cx:755, cy:630,
    path:'M715,590 L750,580 L775,610 L810,620 L800,660 L780,685 L750,690 L720,675 L705,645 L705,615 Z'
  },
  {
    id:'cikeusal', name:'Cikeusal', jumlahDesa:17,
    desa:['Bantarpanjang','Cikeusal','Cilayang','Cilayang Guha','Cimaung','Dahu','Gandayasa','Harundang','Katulisan','Mongpok','Panyabrangan','Sukarame','Sukaratu','Sukamaju','Kadomas','Karang Tanjung','Cilayang Mandiri'],
    color:'#F0ABFC', hoverColor:'#E879F9', textColor:'#701A75',
    cx:660, cy:570,
    path:'M615,530 L645,560 L680,575 L715,570 L740,590 L730,630 L705,650 L670,650 L640,635 L615,600 L600,565 Z'
  },
  {
    id:'petir', name:'Petir', jumlahDesa:15,
    desa:['Mekarbaru','Padasuka','Petir','Seuat','Sindangsari','Cilayang','Terbangbawah','Ciherang','Kaduagung','Kadumadang','Karang Tanjung','Lebak Keumit','Sindangmandi','Tanjungsari','Cibojong'],
    color:'#F9A8D4', hoverColor:'#F472B6', textColor:'#831843',
    cx:620, cy:670,
    path:'M570,620 L615,600 L640,635 L670,650 L680,690 L660,725 L625,740 L585,730 L560,700 L555,660 Z'
  },
  {
    id:'anyar', name:'Anyar', jumlahDesa:12,
    desa:['Anyar','Bandulu','Banjarsari','Bunihara','Cikoneng','Grogol Indah','Kosambironyok','Mekarsari','Pasauran','Sankanwangi','Sindangkarya','Tambang Ayam'],
    color:'#FDE047', hoverColor:'#FACC15', textColor:'#713F12',
    cx:170, cy:440,
    path:'M90,380 L140,355 L195,345 L240,365 L265,400 L275,440 L268,490 L240,520 L200,535 L145,530 L100,500 L80,460 L78,420 Z'
  },
  {
    id:'mancak', name:'Mancak', jumlahDesa:14,
    desa:['Angsana','Balekambang','Batukuda','Cikedung','Ciwarna','Labuan','Mancak','Pasirwaru','Sangiang','Sigedong','Waringin','Batu Rante','Cibuah','Mander'],
    color:'#FEF9C3', hoverColor:'#FEF08A', textColor:'#713F12',
    cx:290, cy:470,
    path:'M240,420 L275,400 L330,400 L375,430 L385,475 L375,520 L340,550 L290,555 L250,540 L225,510 L220,465 L230,435 Z'
  },
  {
    id:'waringinkurung', name:'Waringinkurung', jumlahDesa:11,
    desa:['Binangun','Cokopsulanjana','Kemuning','Sasahan','Sukadalem','Waringinkurung','Cilayang','Cipayung','Sumber Agung','Tambiluk','Parigi'],
    color:'#DDD6FE', hoverColor:'#C4B5FD', textColor:'#5B21B6',
    cx:385, cy:445,
    path:'M340,400 L375,395 L410,410 L450,415 L465,445 L455,490 L425,520 L385,530 L355,520 L335,490 L330,455 L330,420 Z'
  },
  {
    id:'gunungsari', name:'Gunung Sari', jumlahDesa:7,
    desa:['Ciherang','Gunungsari','Luwuk','Sukalaba','Tamiang','Kopo','Cipayung'],
    color:'#FDBA74', hoverColor:'#FB923C', textColor:'#7C2D12',
    cx:400, cy:540,
    path:'M355,500 L385,530 L425,520 L460,535 L465,570 L445,600 L410,615 L370,605 L340,580 L330,550 L335,520 Z'
  },
  {
    id:'pabuaran', name:'Pabuaran', jumlahDesa:8,
    desa:['Kadubeureum','Pabuaran','Pasanggrahan','Sindangheula','Tanjungsari','Cisitu','Kadumadang','Kadugenep'],
    color:'#F9A8D4', hoverColor:'#F472B6', textColor:'#831843',
    cx:445, cy:605,
    path:'M410,565 L445,570 L480,560 L515,575 L525,610 L510,645 L475,660 L440,655 L410,640 L395,615 L395,585 Z'
  },
  {
    id:'ciomas', name:'Ciomas', jumlahDesa:11,
    desa:['Ciomas','Cisitu','Citaman','Lebak','Panyaungan Jaya','Sukabares','Ujungtebu','Karangasem','Pasir Kecapi','Simpang','Sindanghayu'],
    color:'#FED7AA', hoverColor:'#FDBA74', textColor:'#7C2D12',
    cx:380, cy:710,
    path:'M320,650 L370,635 L415,645 L450,660 L465,700 L455,740 L420,765 L375,770 L330,755 L305,725 L305,685 Z'
  },
  {
    id:'padarincang', name:'Padarincang', jumlahDesa:14,
    desa:['Barugbug','Batukuwung','Bugel','Citasuk','Curuggoong','Kadubeureum','Kalumpang','Padarincang','Cisaat','Cipayung','Karangasem','Cibojong','Kadumaneuh','Citaman'],
    color:'#FCA5A5', hoverColor:'#F87171', textColor:'#7F1D1D',
    cx:290, cy:635,
    path:'M220,555 L260,540 L310,545 L355,570 L395,600 L400,640 L380,670 L340,690 L295,690 L250,675 L215,640 L200,600 Z'
  },
  {
    id:'cinangka', name:'Cinangka', jumlahDesa:14,
    desa:['Bantarwangi','Bulakan','Cikolelet','Cinangka','Kamasan','Karang Suraga','Kubang Baros','Pasauran','Rancasanggal','Sindanglaya','Karanganjung','Cikarelang','Curuglanglang','Kadutamiang'],
    color:'#FDE047', hoverColor:'#FACC15', textColor:'#713F12',
    cx:140, cy:610,
    path:'M40,530 L100,505 L145,530 L200,535 L240,555 L250,600 L240,650 L200,710 L140,730 L80,720 L35,670 L25,610 Z'
  },
  {
    id:'baros', name:'Baros', jumlahDesa:14,
    desa:['Baros','Cisalam','Curugpancan','Panyirapan','Sidamukti','Sinarmukti','Sukamanah','Sukamenak','Sukaminah','Tamansari','Tejamari','Kadumaneuh','Pangawinan','Cilayang'],
    color:'#FEF08A', hoverColor:'#FDE047', textColor:'#713F12',
    cx:510, cy:660,
    path:'M465,615 L510,610 L555,620 L580,650 L580,695 L555,725 L515,740 L475,735 L450,710 L440,675 L445,645 Z'
  },
  {
    id:'tunjungteja', name:'Tunjung Teja', jumlahDesa:9,
    desa:['Bojong Catang','Malanggah','Sukasari','Tunjungteja','Parumasan','Kadubale','Ciherang','Cilayang','Pasir Gombong'],
    color:'#FCD34D', hoverColor:'#FBBF24', textColor:'#78350F',
    cx:615, cy:775,
    path:'M565,730 L610,720 L655,735 L680,770 L675,815 L645,845 L600,855 L565,840 L545,800 L545,760 Z'
  },
  {
    id:'pamarayan', name:'Pamarayan', jumlahDesa:10,
    desa:['Binong','Kebon','Pamarayan','Pasir Kembang','Sangiang','Wirana','Kampung Baru','Pudar','Damping','Kalumpang'],
    color:'#FED7AA', hoverColor:'#FDBA74', textColor:'#7C2D12',
    cx:725, cy:720,
    path:'M670,675 L710,660 L755,670 L790,700 L790,755 L765,785 L725,795 L685,785 L660,755 L655,720 Z'
  },
  {
    id:'jawilan', name:'Jawilan', jumlahDesa:9,
    desa:['Bojot','Cemplang','Jawilan','Junti','Kareo','Majasari','Pagintungan','Parakan','Pasirbuyut'],
    color:'#A7F3D0', hoverColor:'#6EE7B7', textColor:'#064E3B',
    cx:795, cy:800,
    path:'M755,755 L790,755 L830,770 L860,805 L855,845 L830,875 L790,880 L755,865 L735,835 L735,795 Z'
  },
  {
    id:'kopo', name:'Kopo', jumlahDesa:10,
    desa:['Babakan Jaya','Cidahu','Gabus','Garot','Kopo','Mekarbaru','Nanggung','Nyompok','Pidada','Ranca Gede'],
    color:'#C084FC', hoverColor:'#A855F7', textColor:'#fff',
    cx:830, cy:890,
    path:'M790,850 L830,845 L870,855 L905,885 L900,930 L870,960 L830,965 L795,945 L775,915 L775,880 Z'
  },
];

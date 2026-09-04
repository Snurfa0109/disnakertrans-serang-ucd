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
    // Kuning keemasan (gold/yellow)
    color:'#F5C842', hoverColor:'#E0B030', textColor:'#5C3D00',
    cx:370, cy:75,
    path:'M340,15 L355,10 L390,10 L415,25 L425,60 L430,100 L420,140 L395,155 L370,158 L345,150 L325,130 L315,95 L318,55 L330,30 Z'
  },
  {
    id:'bojonegara', name:'Bojonegara', jumlahDesa:11,
    desa:['Bojonegara','Karang Kepuh','Kertasana','Lambangsari','Mangkunegara','Margagiri','Mekar Jaya','Pakuncen','Pengarengan','Ukirsari','Wanakarta'],
    // Hijau muda (light green)
    color:'#8BC98A', hoverColor:'#6DB56C', textColor:'#1A4A19',
    cx:310, cy:220,
    path:'M235,145 L270,130 L315,130 L345,150 L370,158 L395,155 L405,175 L400,210 L385,245 L360,275 L330,290 L290,295 L255,285 L235,260 L225,225 L225,180 Z'
  },
  {
    id:'kramatwatu', name:'Kramatwatu', jumlahDesa:15,
    desa:['Harjatani','Kramatwatu','Lebakwana','Margasana','Pamengkang','Pegadingan','Pejaten','Pelamunan','Serdang','Terate','Wanayasa','Toyomerto','Teluk Terate','Kaserangan','Kamasan'],
    // Ungu lavender (purple/lavender)
    color:'#B89FD8', hoverColor:'#9A80C0', textColor:'#3B1F6A',
    cx:420, cy:330,
    path:'M360,275 L385,255 L405,260 L440,265 L480,275 L510,300 L525,335 L515,375 L490,400 L450,415 L410,410 L375,395 L350,370 L340,340 Z'
  },
  {
    id:'tirtayasa', name:'Tirtayasa', jumlahDesa:14,
    desa:['Alang-alang','Kebon','Lontar','Pontang Legon','Sujung','Tirtayasa','Laban','Samparwadi','Susukan','Pematang Baru','Tengkurak','Sewor','Wargasara','Karangkesombang'],
    // Biru muda (light blue)
    color:'#90CAEE', hoverColor:'#6AAFE0', textColor:'#0D3F6F',
    cx:700, cy:175,
    path:'M620,75 L670,65 L720,75 L760,110 L775,160 L770,220 L740,265 L700,280 L660,270 L630,240 L610,200 L605,150 L610,110 Z'
  },
  {
    id:'tanara', name:'Tanara', jumlahDesa:9,
    desa:['Bendung','Cerukcuk','Lempuyang','Sukamanah','Tanara','Tenjo Ayu','Pedaleman','Sireman','Domas Awal'],
    // Pink (pink)
    color:'#E88FAA', hoverColor:'#D4607F', textColor:'#5C0A22',
    cx:830, cy:175,
    path:'M775,90 L815,75 L860,80 L895,105 L910,145 L905,195 L885,240 L855,270 L820,275 L785,255 L770,220 L775,160 L780,120 Z'
  },
  {
    id:'pontang', name:'Pontang', jumlahDesa:11,
    desa:['Domas','Keserangan','Kubang Puji','Pontang','Singarajan','Linduk','Pulo Kencana','Sukanagara','Wanakerta','Kaserangan','Mangkunegara'],
    // Oranye (orange)
    color:'#F5A64A', hoverColor:'#E08830', textColor:'#5C2C00',
    cx:645, cy:310,
    path:'M590,245 L630,235 L660,270 L700,280 L740,265 L730,310 L710,350 L680,380 L640,385 L600,370 L580,340 L575,300 Z'
  },
  {
    id:'lebak-wangi', name:'Lebak Wangi', jumlahDesa:10,
    desa:['Bolang','Kamaruton','Lebak Wangi','Purwadadi','Tegalwangi','Keboncau','Melati','Sindangmandi','Tirem','Parakan'],
    // Kuning muda (light yellow)
    color:'#F0E080', hoverColor:'#D8C660', textColor:'#5C4200',
    cx:700, cy:395,
    path:'M660,355 L680,380 L710,350 L730,310 L755,330 L770,365 L760,410 L730,440 L695,445 L660,430 L645,400 Z'
  },
  {
    id:'carenang', name:'Carenang', jumlahDesa:8,
    desa:['Carenang','Mandaya','Mekarsari','Pamanuk','Panenjoan','Ragasmesigit','Teras','Walikukun'],
    // Hijau (green)
    color:'#7DC67A', hoverColor:'#58A855', textColor:'#143A13',
    cx:790, cy:345,
    path:'M740,265 L770,255 L820,275 L855,310 L850,370 L825,405 L790,415 L760,410 L755,370 L755,330 L740,310 Z'
  },
  {
    id:'ciruas', name:'Ciruas', jumlahDesa:15,
    desa:['Beberan','Bumijaya','Ciruas','Citerep','Kadikaran','Karangpilang','Kepandean','Pamong','Penggalang','Plawad','Singamerta','Ranjeng','Gosara','Kalanganyar','Pulo'],
    // Biru muda (light blue / sky)
    color:'#8DC8E8', hoverColor:'#65AAD4', textColor:'#0A3A5E',
    cx:635, cy:430,
    path:'M590,380 L640,385 L660,400 L660,430 L695,445 L695,470 L670,490 L635,500 L600,485 L580,455 L575,420 Z'
  },
  {
    id:'kragilan', name:'Kragilan', jumlahDesa:12,
    desa:['Cisait','Dukuh','Jeruktipis','Kendayakan','Kragilan','Kramatjati','Pematang','Sentul','Undar-Andir','Tegalmaja','Sukajadi','Tegal'],
    // Teal kehijau (teal)
    color:'#6ECFBB', hoverColor:'#48B09A', textColor:'#0D3D35',
    cx:680, cy:500,
    path:'M635,455 L670,490 L695,470 L730,470 L745,500 L740,545 L715,570 L680,575 L645,560 L620,530 L615,490 Z'
  },
  {
    id:'binuang', name:'Binuang', jumlahDesa:7,
    desa:['Binuang','Cakung','Gembor','Lamaran','Renged','Sukamaju','Warakas'],
    // Ungu muda (light purple)
    color:'#C4A8E0', hoverColor:'#A888C8', textColor:'#3A1A65',
    cx:810, cy:450,
    path:'M770,395 L790,415 L825,405 L855,420 L865,470 L850,510 L820,520 L785,510 L760,480 L755,445 L760,415 Z'
  },
  {
    id:'kibin', name:'Kibin', jumlahDesa:9,
    desa:['Barengkok','Ciagel','Cijeruk','Kibin','Nagara','Nambo Ilir','Sukamaju','Tambak','Tegal Gandu'],
    // Kuning (yellow)
    color:'#F2D65A', hoverColor:'#D8BC38', textColor:'#4A3000',
    cx:810, cy:545,
    path:'M770,500 L820,520 L850,510 L870,540 L870,580 L845,610 L810,620 L775,610 L750,580 L745,545 L755,515 Z'
  },
  {
    id:'cikande', name:'Cikande', jumlahDesa:13,
    desa:['Bakung','Cikande','Cikande Permai','Gembor Udik','Kamurang','Koper','Leuwilimus','Nambo Udik','Parik','Situterate','Songgom Jaya','Sukatani','Julang'],
    // Biru langit (sky blue)
    color:'#92C8E8', hoverColor:'#6AAED4', textColor:'#0A3555',
    cx:855, cy:640,
    path:'M810,590 L845,610 L870,580 L900,600 L915,645 L905,690 L875,710 L840,705 L810,685 L795,650 L800,615 Z'
  },
  {
    id:'bandung', name:'Bandung', jumlahDesa:8,
    desa:['Babakan','Bandung','Blokang','Malabar','Mander','Panamping','Pringwulung','Sodong'],
    // Oranye (orange)
    color:'#F5A64A', hoverColor:'#E08830', textColor:'#5C2C00',
    cx:755, cy:630,
    path:'M715,590 L750,580 L775,610 L810,620 L800,660 L780,685 L750,690 L720,675 L705,645 L705,615 Z'
  },
  {
    id:'cikeusal', name:'Cikeusal', jumlahDesa:17,
    desa:['Bantarpanjang','Cikeusal','Cilayang','Cilayang Guha','Cimaung','Dahu','Gandayasa','Harundang','Katulisan','Mongpok','Panyabrangan','Sukarame','Sukaratu','Sukamaju','Kadomas','Karang Tanjung','Cilayang Mandiri'],
    // Biru/cyan muda (light cyan/blue)
    color:'#88D4D0', hoverColor:'#60B8B4', textColor:'#0A3A38',
    cx:660, cy:570,
    path:'M615,530 L645,560 L680,575 L715,570 L740,590 L730,630 L705,650 L670,650 L640,635 L615,600 L600,565 Z'
  },
  {
    id:'petir', name:'Petir', jumlahDesa:15,
    desa:['Mekarbaru','Padasuka','Petir','Seuat','Sindangsari','Cilayang','Terbangbawah','Ciherang','Kaduagung','Kadumadang','Karang Tanjung','Lebak Keumit','Sindangmandi','Tanjungsari','Cibojong'],
    // Pink/rose (pink)
    color:'#E890A8', hoverColor:'#D06888', textColor:'#5A0A25',
    cx:620, cy:670,
    path:'M570,620 L615,600 L640,635 L670,650 L680,690 L660,725 L625,740 L585,730 L560,700 L555,660 Z'
  },
  {
    id:'anyar', name:'Anyar', jumlahDesa:12,
    desa:['Anyar','Bandulu','Banjarsari','Bunihara','Cikoneng','Grogol Indah','Kosambironyok','Mekarsari','Pasauran','Sankanwangi','Sindangkarya','Tambang Ayam'],
    // Pink (pink — same shade as Anyar in image)
    color:'#ECA8B8', hoverColor:'#D4808E', textColor:'#5A0A20',
    cx:170, cy:440,
    path:'M90,380 L140,355 L195,345 L240,365 L265,400 L275,440 L268,490 L240,520 L200,535 L145,530 L100,500 L80,460 L78,420 Z'
  },
  {
    id:'mancak', name:'Mancak', jumlahDesa:14,
    desa:['Angsana','Balekambang','Batukuda','Cikedung','Ciwarna','Labuan','Mancak','Pasirwaru','Sangiang','Sigedong','Waringin','Batu Rante','Cibuah','Mander'],
    // Kuning (yellow)
    color:'#F0D660', hoverColor:'#D8BE40', textColor:'#4A3200',
    cx:290, cy:470,
    path:'M240,420 L275,400 L330,400 L375,430 L385,475 L375,520 L340,550 L290,555 L250,540 L225,510 L220,465 L230,435 Z'
  },
  {
    id:'waringinkurung', name:'Waringinkurung', jumlahDesa:11,
    desa:['Binangun','Cokopsulanjana','Kemuning','Sasahan','Sukadalem','Waringinkurung','Cilayang','Cipayung','Sumber Agung','Tambiluk','Parigi'],
    // Biru periwinkle (blue periwinkle)
    color:'#9AAEE0', hoverColor:'#7890C8', textColor:'#1A2C6A',
    cx:385, cy:445,
    path:'M340,400 L375,395 L410,410 L450,415 L465,445 L455,490 L425,520 L385,530 L355,520 L335,490 L330,455 L330,420 Z'
  },
  {
    id:'gunungsari', name:'Gunung Sari', jumlahDesa:7,
    desa:['Ciherang','Gunungsari','Luwuk','Sukalaba','Tamiang','Kopo','Cipayung'],
    // Oranye (orange)
    color:'#F0A848', hoverColor:'#D88A28', textColor:'#5C2C00',
    cx:400, cy:540,
    path:'M355,500 L385,530 L425,520 L460,535 L465,570 L445,600 L410,615 L370,605 L340,580 L330,550 L335,520 Z'
  },
  {
    id:'pabuaran', name:'Pabuaran', jumlahDesa:8,
    desa:['Kadubeureum','Pabuaran','Pasanggrahan','Sindangheula','Tanjungsari','Cisitu','Kadumadang','Kadugenep'],
    // Biru muda (light blue)
    color:'#8EC4E8', hoverColor:'#68AADC', textColor:'#0A3558',
    cx:445, cy:605,
    path:'M410,565 L445,570 L480,560 L515,575 L525,610 L510,645 L475,660 L440,655 L410,640 L395,615 L395,585 Z'
  },
  {
    id:'ciomas', name:'Ciomas', jumlahDesa:11,
    desa:['Ciomas','Cisitu','Citaman','Lebak','Panyaungan Jaya','Sukabares','Ujungtebu','Karangasem','Pasir Kecapi','Simpang','Sindanghayu'],
    // Hijau zaitun/olive (olive green)
    color:'#96C06A', hoverColor:'#78A848', textColor:'#1C3A08',
    cx:380, cy:710,
    path:'M320,650 L370,635 L415,645 L450,660 L465,700 L455,740 L420,765 L375,770 L330,755 L305,725 L305,685 Z'
  },
  {
    id:'padarincang', name:'Padarincang', jumlahDesa:14,
    desa:['Barugbug','Batukuwung','Bugel','Citasuk','Curuggoong','Kadubeureum','Kalumpang','Padarincang','Cisaat','Cipayung','Karangasem','Cibojong','Kadumaneuh','Citaman'],
    // Ungu (purple)
    color:'#B098D8', hoverColor:'#9278C0', textColor:'#32126A',
    cx:290, cy:635,
    path:'M220,555 L260,540 L310,545 L355,570 L395,600 L400,640 L380,670 L340,690 L295,690 L250,675 L215,640 L200,600 Z'
  },
  {
    id:'cinangka', name:'Cinangka', jumlahDesa:14,
    desa:['Bantarwangi','Bulakan','Cikolelet','Cinangka','Kamasan','Karang Suraga','Kubang Baros','Pasauran','Rancasanggal','Sindanglaya','Karanganjung','Cikarelang','Curuglanglang','Kadutamiang'],
    // Teal (teal/turquoise)
    color:'#6CCCC4', hoverColor:'#48B0A8', textColor:'#0A3835',
    cx:140, cy:610,
    path:'M40,530 L100,505 L145,530 L200,535 L240,555 L250,600 L240,650 L200,710 L140,730 L80,720 L35,670 L25,610 Z'
  },
  {
    id:'baros', name:'Baros', jumlahDesa:14,
    desa:['Baros','Cisalam','Curugpancan','Panyirapan','Sidamukti','Sinarmukti','Sukamanah','Sukamenak','Sukaminah','Tamansari','Tejamari','Kadumaneuh','Pangawinan','Cilayang'],
    // Kuning muda (light yellow)
    color:'#ECD870', hoverColor:'#D4BC50', textColor:'#4A3800',
    cx:510, cy:660,
    path:'M465,615 L510,610 L555,620 L580,650 L580,695 L555,725 L515,740 L475,735 L450,710 L440,675 L445,645 Z'
  },
  {
    id:'tunjungteja', name:'Tunjung Teja', jumlahDesa:9,
    desa:['Bojong Catang','Malanggah','Sukasari','Tunjungteja','Parumasan','Kadubale','Ciherang','Cilayang','Pasir Gombong'],
    // Kuning keemasan (golden yellow)
    color:'#F0C842', hoverColor:'#D8AC28', textColor:'#4A3000',
    cx:615, cy:775,
    path:'M565,730 L610,720 L655,735 L680,770 L675,815 L645,845 L600,855 L565,840 L545,800 L545,760 Z'
  },
  {
    id:'pamarayan', name:'Pamarayan', jumlahDesa:10,
    desa:['Binong','Kebon','Pamarayan','Pasir Kembang','Sangiang','Wirana','Kampung Baru','Pudar','Damping','Kalumpang'],
    // Biru muda/teal (light blue/teal)
    color:'#78C8C4', hoverColor:'#50B0AC', textColor:'#0A3835',
    cx:725, cy:720,
    path:'M670,675 L710,660 L755,670 L790,700 L790,755 L765,785 L725,795 L685,785 L660,755 L655,720 Z'
  },
  {
    id:'jawilan', name:'Jawilan', jumlahDesa:9,
    desa:['Bojot','Cemplang','Jawilan','Junti','Kareo','Majasari','Pagintungan','Parakan','Pasirbuyut'],
    // Kuning muda (pale yellow)
    color:'#EED870', hoverColor:'#D4BC50', textColor:'#4A3800',
    cx:795, cy:800,
    path:'M755,755 L790,755 L830,770 L860,805 L855,845 L830,875 L790,880 L755,865 L735,835 L735,795 Z'
  },
  {
    id:'kopo', name:'Kopo', jumlahDesa:10,
    desa:['Babakan Jaya','Cidahu','Gabus','Garot','Kopo','Mekarbaru','Nanggung','Nyompok','Pidada','Ranca Gede'],
    // Biru muda (light blue)
    color:'#90C8E8', hoverColor:'#68AADC', textColor:'#0A3558',
    cx:830, cy:890,
    path:'M790,850 L830,845 L870,855 L905,885 L900,930 L870,960 L830,965 L795,945 L775,915 L775,880 Z'
  },
];

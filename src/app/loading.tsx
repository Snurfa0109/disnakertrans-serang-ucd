export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF] dark:from-[#071326] dark:to-[#0A192F] text-gray-800 dark:text-white px-4 transition-colors">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FBBF24]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Branded Loading Card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-[#0F1E36]/80 backdrop-blur-xl border border-blue-100/80 dark:border-white/10 shadow-2xl">
        {/* Animated Brand Ring & Logo */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Outer rotating pulse ring */}
          <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-[#FBBF24] animate-spin opacity-80" style={{ animationDuration: "8s" }} />
          {/* Glowing ripple */}
          <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/20 dark:bg-blue-400/20 animate-ping opacity-60" style={{ animationDuration: "2.5s" }} />
          
          {/* Central Logo Box */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0A192F] p-2.5 flex items-center justify-center shadow-lg border border-white/20">
            <img
              src="/images/logokabserang.png"
              alt="Logo Kabupaten Serang"
              className="w-full h-full object-contain drop-shadow"
            />
          </div>
        </div>

        {/* Brand Text */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-white/10 text-[10px] font-bold text-[#1E3A8A] dark:text-[#93C5FD] tracking-wider uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Pemerintah Kabupaten Serang
        </div>

        <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
          Disnakertrans Terpadu
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-300/80 leading-relaxed max-w-[260px] mb-6">
          Memuat sistem layanan publik, info lowongan, dan data ketenagakerjaan...
        </p>

        {/* Modern Shimmer Progress Bar */}
        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden relative shadow-inner">
          <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#FBBF24] rounded-full animate-indeterminate-bar" />
        </div>

        {/* Substatus Footer */}
        <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-gray-400 dark:text-white/40">
          <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-ping" />
          <span>Menghubungkan layanan resmi...</span>
        </div>
      </div>
    </div>
  );
}


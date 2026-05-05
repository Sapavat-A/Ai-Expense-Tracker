function ProgressStat({ label, valueText, progress, tone = 'bg-indigo-500' }) {
  const normalized = Math.max(0, Math.min(progress || 0, 100));
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs font-semibold text-slate-600">{valueText}</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${tone} transition-all duration-500`} style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}

export default ProgressStat;

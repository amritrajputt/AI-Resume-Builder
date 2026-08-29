
import Link from "next/link";

const templates = [
  { name: 'SDE', accent: 'from-slate-900 via-slate-700 to-slate-500', tone: 'bg-slate-100' },
  { name: 'Product', accent: 'from-blue-600 via-indigo-500 to-violet-500', tone: 'bg-blue-50' },
  { name: 'Marketing', accent: 'from-amber-700 via-orange-500 to-rose-400', tone: 'bg-amber-50' },
  { name: 'Sales', accent: 'from-emerald-600 via-teal-500 to-cyan-400', tone: 'bg-emerald-50' },
];

export default function BrowseTemplatePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
        >
          ← Back to Home
        </Link>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Templates</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Browse Templates</h1>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <div
            key={template.name}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <div className={`relative h-72 overflow-hidden bg-gradient-to-br ${template.accent}`}>
              <div className="absolute inset-0 opacity-90">
                <div className="absolute inset-x-6 top-6 h-7 rounded-full bg-white/20 blur-sm" />
                <div className="absolute left-6 top-16 h-28 w-20 rounded-2xl bg-white/10 blur-sm" />
                <div className="absolute right-6 top-20 h-24 w-28 rounded-2xl bg-white/15 blur-sm" />
                <div className="absolute inset-x-6 bottom-8 h-16 rounded-2xl bg-slate-950/20 blur-sm" />
              </div>

              <div className={`absolute inset-0 p-5 ${template.tone} blur-[2px]`}>
                <div className="h-full rounded-[1.5rem] border border-white/30 bg-white/30 p-4 backdrop-blur-[1px]">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-900/70" />
                    <div className="flex gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-900/50" />
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-900/30" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-24 rounded-full bg-slate-900/60" />
                    <div className="h-3 w-32 rounded-full bg-slate-900/35" />
                    <div className="mt-5 space-y-2">
                      <div className="h-2.5 w-full rounded-full bg-slate-900/30" />
                      <div className="h-2.5 w-5/6 rounded-full bg-slate-900/25" />
                      <div className="h-2.5 w-4/5 rounded-full bg-slate-900/20" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/15 backdrop-blur-[1px]">
                <div className="rounded-full border border-white/70 bg-white/85 px-5 py-2 text-sm font-semibold tracking-[0.18em] text-slate-800 shadow-lg">
                  COMING SOON
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
              <span className="text-base font-semibold text-slate-800">{template.name}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                New
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
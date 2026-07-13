import { Keyboard } from "lucide-react";

import { powerQueryShortcuts } from "@/lib/powerQueryReference";

const groups = ["Query Editor", "Data Preview", "Diagram View"] as const;

export default function PowerQueryKeyboardShortcuts() {
  return (
    <section
      aria-labelledby="power-query-shortcuts-heading"
      className="rounded-3xl border border-teal-100 bg-white/85 p-6 shadow-lg sm:p-8"
    >
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-teal-700">
        <Keyboard size={18} aria-hidden="true" /> Work faster
      </p>
      <h2 id="power-query-shortcuts-heading" className="mt-1 text-3xl font-black text-slate-950">
        Keyboard shortcuts
      </h2>
      <p className="mt-2 text-slate-700">
        Common Power Query Online shortcuts for Windows and macOS. Browser behavior can vary.
      </p>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group} className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
            <h3 className="font-black text-teal-950">{group}</h3>
            <dl className="mt-3 space-y-3">
              {powerQueryShortcuts
                .filter((shortcut) => shortcut.group === group)
                .map((shortcut) => (
                  <div key={shortcut.action} className="rounded-xl bg-white p-3 shadow-sm">
                    <dt className="text-sm font-bold text-slate-800">{shortcut.action}</dt>
                    <dd className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                      <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                        Win: {shortcut.windows}
                      </kbd>
                      <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                        Mac: {shortcut.mac}
                      </kbd>
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

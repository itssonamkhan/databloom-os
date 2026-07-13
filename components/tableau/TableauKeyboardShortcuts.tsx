import { Keyboard } from "lucide-react";

import { tableauShortcuts } from "@/lib/tableauReference";

const groups = ["Workbook", "Authoring", "Selection"] as const;

export default function TableauKeyboardShortcuts() {
  return (
    <section
      aria-labelledby="tableau-shortcuts-heading"
      className="rounded-3xl border border-blue-100 bg-white/85 p-6 shadow-lg sm:p-8"
    >
      <div>
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-700">
          <Keyboard size={18} aria-hidden="true" /> Work faster
        </p>
        <h2 id="tableau-shortcuts-heading" className="mt-1 text-3xl font-black text-slate-950">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 text-slate-700">
          Common Tableau Desktop and web-authoring shortcuts for Windows and macOS.
        </p>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group} className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="font-black text-blue-950">{group}</h3>
            <dl className="mt-3 space-y-3">
              {tableauShortcuts
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

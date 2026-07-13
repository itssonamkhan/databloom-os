import type { ReactNode } from "react";
import { Sprout } from "lucide-react";

export type EmptyAnalyticsStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
};

export default function EmptyAnalyticsState({
  title = "Your analytics are ready to bloom",
  description = "Complete a lesson or practice activity to start filling this view.",
  icon,
  className = "",
}: EmptyAnalyticsStateProps) {
  return (
    <div
      className={`flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-purple-200 bg-gradient-to-br from-white/80 to-purple-50/80 px-6 py-10 text-center ${className}`}
      role="status"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm">
        {icon ?? <Sprout size={24} aria-hidden="true" />}
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

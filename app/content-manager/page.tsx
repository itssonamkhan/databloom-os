import type { Metadata } from "next";
import { redirect } from "next/navigation";

import ContentManager from "@/components/content-manager/ContentManager";
import { authorizeAdmin } from "@/lib/server/adminAuthorization";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content Manager",
  description: "Manage DataBloom OS learning resources.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ContentManagerPage() {
  const authorization = await authorizeAdmin();

  if (!authorization.authorized && authorization.status === 401) {
    redirect("/login");
  }

  if (!authorization.authorized) {
    return (
      <main
        data-databloom-page
        className="grid min-h-screen place-items-center px-4 py-10 text-center text-[var(--databloom-text-primary)]"
      >
        <section className="databloom-phase3-surface w-full max-w-lg rounded-[2rem] border border-[var(--databloom-border)] p-8 shadow-lg backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">
            Content Manager
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Owner access required
          </h1>
          <p className="mt-3 leading-7 text-[var(--databloom-text-secondary)]">
            This workspace is available only to the authorized DataBloom owner.
          </p>
        </section>
      </main>
    );
  }

  return <ContentManager />;
}

"use client";

import Sidebar from "./Sidebar";
import Navbar from "../navigation/Navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      data-databloom-page
      className="flex min-h-screen min-w-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
    >

      {/* Sidebar */}
      <aside className="lg:sticky lg:top-0 lg:h-screen">
        <Sidebar />
      </aside>


      {/* Main Workspace */}
      <div className="min-w-0 flex-1 px-4 pb-5 pt-20 sm:px-6 lg:px-8 lg:py-6">

        {/* Navbar */}
        <div className="mb-8">
          <Navbar />
        </div>


        {/* App Content */}
        <section
          data-databloom-glass
          className="
          max-w-7xl
          mx-auto
          bg-white/40
          backdrop-blur-xl
          rounded-3xl
          p-4
          sm:p-8
          shadow-sm
          min-h-[calc(100vh-150px)]
          "
        >
          {children}
        </section>


      </div>

    </main>
  );
}

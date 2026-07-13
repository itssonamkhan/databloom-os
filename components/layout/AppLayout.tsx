"use client";

import Sidebar from "./Sidebar";
import Navbar from "../navigation/Navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">

      {/* Sidebar */}
      <aside className="sticky top-0 h-screen">
        <Sidebar />
      </aside>


      {/* Main Workspace */}
      <div className="flex-1 px-8 py-6">

        {/* Navbar */}
        <div className="mb-8">
          <Navbar />
        </div>


        {/* App Content */}
        <section
          className="
          max-w-7xl 
          mx-auto
          bg-white/40
          backdrop-blur-xl
          rounded-3xl
          p-8
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
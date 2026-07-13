export default function Planner() {
  const tasks = [
    {
      title: "Learn Excel Basics",
      time: "2 Hours",
      status: "Completed",
      icon: "📘",
    },
    {
      title: "Practice Formulas",
      time: "1.5 Hours",
      status: "In Progress",
      icon: "🧮",
    },
    {
      title: "Create Dashboard",
      time: "2 Hours",
      status: "Pending",
      icon: "📊",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-10">

      <h1 className="text-5xl font-bold text-purple-700">
        🗓️ Smart Planner
      </h1>

      <p className="mt-3 text-gray-700 text-xl">
        Plan your learning journey and track your daily progress.
      </p>


      <div className="mt-10 bg-white rounded-3xl border border-purple-100 shadow-md p-8">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-purple-700">
            Today’s Goals
          </h2>

          <button className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700">
            + Add Task
          </button>
        </div>


        <div className="space-y-5">

          {tasks.map((task) => (
            <div
              key={task.title}
              className="flex items-center justify-between bg-white border border-purple-100 shadow-md p-5 rounded-2xl"
            >

              <div className="flex items-center gap-4">
                <span className="text-3xl">
                  {task.icon}
                </span>

                <div>
                  <h3 className="text-xl text-gray-900 font-semibold">
                    {task.title}
                  </h3>

                  <p className="text-gray-700">
                    ⏰ {task.time}
                  </p>
                </div>
              </div>


              <span
                className="px-4 py-2 rounded-full bg-white text-purple-700 font-medium"
              >
                {task.status}
              </span>

            </div>
          ))}

        </div>

      </div>


      <div className="grid md:grid-cols-3 gap-6 mt-10">

        <div className="bg-white border border-purple-100 shadow-md p-6 rounded-2xl">
          <h3 className="text-xl text-gray-700 font-semibold">
            🔥 Streak
          </h3>
          <p className="text-3xl font-bold text-orange-600 mt-3">
            7 Days
          </p>
        </div>


        <div className="bg-white border border-purple-100 shadow-md p-6 rounded-2xl">
          <h3 className="text-xl text-gray-700 font-semibold">
            ✅ Completed
          </h3>
          <p className="text-3xl font-bold text-green-700 mt-3">
            24 Tasks
          </p>
        </div>


        <div className="bg-white border border-purple-100 shadow-md p-6 rounded-2xl">
          <h3 className="text-xl text-gray-700 font-semibold">
            🎯 Progress
          </h3>
          <p className="text-3xl font-bold text-purple-700 mt-3">
            75%
          </p>
          <div className="mt-3 h-3 rounded-full bg-purple-100 overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          </div>
        </div>

      </div>

    </main>
  );
}

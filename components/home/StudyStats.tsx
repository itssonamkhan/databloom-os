export default function StudyStats() {

  return (

    <div className="rounded-3xl bg-white/40 backdrop-blur-xl p-6 shadow-lg border border-white/50">

      <h2 className="text-xl font-bold text-gray-800">
        📊 Today’s Progress
      </h2>

      <p className="text-gray-600 mt-2">
        Your learning journey today 🌸
      </p>


      <div className="grid grid-cols-3 gap-4 mt-6">


        <div className="bg-white/60 rounded-2xl p-4 text-center">

          <h3 className="text-2xl font-bold text-gray-800">
            3
          </h3>

          <p className="text-sm text-gray-600">
            Lessons
          </p>

        </div>



        <div className="bg-white/60 rounded-2xl p-4 text-center">

          <h3 className="text-2xl font-bold text-gray-800">
            45
          </h3>

          <p className="text-sm text-gray-600">
            Minutes
          </p>

        </div>



        <div className="bg-white/60 rounded-2xl p-4 text-center">

          <h3 className="text-2xl font-bold text-gray-800">
            120
          </h3>

          <p className="text-sm text-gray-600">
            XP
          </p>

        </div>


      </div>


    </div>

  );

}

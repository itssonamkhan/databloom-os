"use client";

import { useEffect, useState } from "react";
import { loadStreak, StreakData } from "@/lib/streak";


export default function StreakCard() {


  const [streak, setStreak] = useState<StreakData>({
    current: 0,
    longest: 0,
    lastStudyDate: null,
  });



  useEffect(() => {

    setStreak(loadStreak());

  }, []);



  return (

    <div className="
    rounded-3xl
    bg-white/40
    backdrop-blur-xl
    p-6
    shadow-lg
    border
    border-white/50
    ">


      <h2 className="
      text-xl
      font-bold
      text-gray-800
      ">
        🔥 Study Streak
      </h2>



      <p className="
      text-gray-600
      mt-2
      ">
        Keep showing up every day 🌸
      </p>




      <div className="mt-6 text-center">


        <div className="text-6xl">
          🔥
        </div>


        <h1 className="
        text-5xl
        font-bold
        text-orange-500
        mt-2
        ">
          {streak.current}
        </h1>


        <p className="
        text-gray-700
        font-medium
        ">
          Day Streak
        </p>


      </div>




      <div className="
      mt-6
      rounded-2xl
      bg-yellow-100
      p-4
      text-gray-800
      ">


        <div className="
        flex
        justify-between
        items-center
        ">


          <span className="
          font-semibold
          text-gray-800
          ">
            🏆 Best Streak
          </span>


          <span className="
          font-bold
          text-yellow-700
          ">
            {streak.longest} Days
          </span>


        </div>


      </div>




      <div className="
      mt-4
      rounded-2xl
      bg-pink-100
      p-4
      text-gray-800
      font-medium
      ">

        🌸 Every day you study,
        your DataBloom garden grows.

      </div>



    </div>

  );

}
"use client";

import { useEffect, useState } from "react";

import {
  achievements,
} from "@/lib/achievements";

import {
  loadUnlockedAchievements,
} from "@/lib/unlockedAchievements";


export default function Achievements() {


  const [unlocked, setUnlocked] =
    useState<string[]>([]);



  useEffect(()=>{

    setUnlocked(
      loadUnlockedAchievements()
    );

  },[]);




  return (

    <div className="
    rounded-3xl
    bg-white/40
    backdrop-blur-xl
    p-6
    shadow-lg
    border
    border-yellow-200/50
    ">


      <h2 className="
      text-xl
      font-bold
      text-gray-800
      ">
        🏆 Achievements
      </h2>



      <p className="
      text-gray-600
      mt-2
      ">
        Collect badges as your DataBloom grows 🌸
      </p>




      <div className="
      mt-5
      space-y-3
      ">


        {
          achievements.map((item)=>(


            <div

              key={item.id}

              className={`

              rounded-2xl
              p-4
              transition


              ${
                unlocked.includes(item.id)

                ?

                "bg-green-100 text-green-700"

                :

                "bg-white/70 text-gray-500"

              }

              `}

            >


              <div className="
              flex
              justify-between
              items-center
              ">


                <h3 className="
                font-semibold
                text-gray-800
                ">

                  {item.title}

                </h3>


                <span>

                  {
                    unlocked.includes(item.id)

                    ?

                    "✅"

                    :

                    "🔒"

                  }

                </span>


              </div>




              <p className="
              text-sm
              mt-2
              ">

                {item.description}

              </p>




              <p className="
              text-sm
              mt-2
              font-medium
              text-purple-700
              ">

                Reward:
                {" "}
                +{item.reward} XP

              </p>



            </div>


          ))

        }


      </div>


    </div>

  );

}
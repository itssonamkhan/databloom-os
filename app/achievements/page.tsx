"use client";

import { useEffect, useState } from "react";

import {
  achievements,
} from "@/lib/achievements";

import {
  loadUnlockedAchievements,
} from "@/lib/unlockedAchievements";


export default function AchievementsPage() {


  const [unlocked,setUnlocked] =
    useState<string[]>([]);



  useEffect(()=>{

    setUnlocked(
      loadUnlockedAchievements()
    );

  },[]);



  return (

    <main className="
    min-h-screen
    bg-gradient-to-br
    from-pink-50
    via-purple-50
    to-blue-50
    p-10
    ">


      <div className="
      max-w-5xl
      mx-auto
      ">


        <div className="
        bg-white/60
        backdrop-blur-xl
        rounded-3xl
        p-8
        shadow-lg
        ">


          <h1 className="
          text-4xl
          font-bold
          text-purple-700
          ">
            🏆 Achievement Garden
          </h1>


          <p className="
          mt-2
          text-gray-600
          ">
            Every milestone helps your DataBloom grow 🌸
          </p>


        </div>





        <div className="
        grid
        md:grid-cols-2
        gap-5
        mt-8
        ">


          {
            achievements.map((item)=>(


              <div
                key={item.id}
                className={`

                rounded-3xl
                p-6
                shadow-lg
                backdrop-blur-xl

                ${
                  unlocked.includes(item.id)

                  ?

                  "bg-green-100 border border-green-200"

                  :

                  "bg-white/60 border border-white"

                }

                `}
              >


                <div className="
                flex
                justify-between
                items-center
                ">


                  <h2 className="
                  text-xl
                  font-bold
                  text-gray-800
                  ">

                    {item.title}

                  </h2>


                  <span className="text-2xl">

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
                mt-3
                text-gray-600
                ">

                  {item.description}

                </p>



                <p className="
                mt-4
                font-semibold
                text-purple-700
                ">

                  Reward: +{item.reward} XP

                </p>



              </div>


            ))

          }


        </div>


      </div>


    </main>

  );

}
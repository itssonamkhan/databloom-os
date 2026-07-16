"use client";

import { useEffect, useState } from "react";

import {
  achievements,
} from "@/lib/achievements";

import {
  ACHIEVEMENTS_UPDATED_EVENT,
  loadUnlockedAchievements,
} from "@/lib/unlockedAchievements";
import AppLayout from "@/components/layout/AppLayout";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { personalizeBuddyText } from "@/lib/userPreferences";


export default function AchievementsPage() {
  const preferences = useUserPreferences();


  const [unlocked,setUnlocked] =
    useState<string[]>([]);



  useEffect(()=>{
    const sync = () => setUnlocked(loadUnlockedAchievements());
    sync();
    window.addEventListener(ACHIEVEMENTS_UPDATED_EVENT, sync);
    return () => window.removeEventListener(ACHIEVEMENTS_UPDATED_EVENT, sync);
  },[]);



  return (

    <AppLayout>


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

                    {personalizeBuddyText(item.title, preferences)}

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

                  {personalizeBuddyText(item.description, preferences)}

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


    </AppLayout>

  );

}

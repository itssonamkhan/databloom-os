"use client";

import { useState } from "react";

import { useProgress } from "@/context/ProgressContext";

import {
  getTodayTasks,
  saveTodayTasks,
} from "@/lib/dailyTasks";

import {
  addMochiHeart,
} from "@/lib/mochi";
import { registerStudyActivity } from "@/lib/studyActivity";
import { unlockAchievement } from "@/lib/unlockedAchievements";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { personalizeBuddyText } from "@/lib/userPreferences";

import XPToast from "@/components/effects/XPToast";

import {
  playClickSound,
  playXPSound,
} from "@/lib/sounds";



export default function DailyGoals() {
  const preferences = useUserPreferences();


  const {
    addXP,
  } = useProgress();



  const [xpPopup,setXpPopup] =
    useState<number | null>(null);



  const [goals,setGoals] =
    useState(
      getTodayTasks()
    );




  function completeGoal(index:number){


    const goal =
      goals[index];



    if(!goal || goal.done)
      return;



    playClickSound();



    const updatedGoals =
      goals.map((item,i)=>

        i === index

        ?

        {
          ...item,
          done:true,
        }

        :

        item

      );



    setGoals(
      updatedGoals
    );


    saveTodayTasks(
      updatedGoals
    );



    // XP update
    addXP(
      goal.xp
    );



    registerStudyActivity({
      kind: "task",
      source: `daily-goal:${goal.text}`,
      minutes: 30,
      xp: goal.xp,
      goals: 1,
    });

    if (updatedGoals.every((item) => item.done)) {
      unlockAchievement("focus_master");
    }



    // Mochi friendship
    addMochiHeart(
      1
    );



    playXPSound();



    setXpPopup(
      goal.xp
    );

  }




  const completed =
    goals.filter(
      (goal)=>goal.done
    ).length;




  return (

    <>


      {
        xpPopup !== null &&

        <XPToast

          xp={xpPopup}

          onClose={()=>
            setXpPopup(null)
          }

        />

      }




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
          🎯 Today’s Focus
        </h2>



        <p className="
        text-gray-600
        mt-2
        ">
          Small steps create big data skills 🌸
        </p>




        <div className="
        mt-5
        space-y-3
        ">


          {
            goals.map(
              (goal,index)=>(


              <button

                key={index}

                onClick={()=>
                  completeGoal(index)
                }


                className={`

                w-full
                text-left
                rounded-2xl
                p-3
                font-medium
                transition


                ${
                  goal.done

                  ?

                  "bg-green-100 text-gray-500 line-through"

                  :

                  "bg-white/70 text-gray-800 hover:bg-purple-50"

                }

                `}

              >


                {
                  goal.done
                  ?
                  "✅"
                  :
                  "☐"
                }


                {" "}

                {personalizeBuddyText(goal.text, preferences)}



                <span className="
                float-right
                text-purple-600
                ">

                  +{goal.xp} XP

                </span>



              </button>


            ))

          }


        </div>




        <div className="
        mt-5
        rounded-2xl
        bg-purple-100
        p-3
        text-purple-700
        font-semibold
        ">

          🌸 Completed:
          {" "}
          {completed}/4

        </div>



      </div>


    </>

  );

}

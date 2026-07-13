"use client";

import { useEffect, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";

import { formulas } from "@/lib/formulas";

import {
  loadFavorites,
  toggleFavorite,
  loadLearned,
  markLearned,
} from "@/lib/formulaProgress";


export default function FormulaStudio() {

    console.log("FORMULA COUNT:", formulas.length);
  
    const [search, setSearch] = useState("");

  const [favorites, setFavorites] = useState<string[]>([]);

  const [learned, setLearned] = useState<string[]>([]);


  useEffect(() => {

    setFavorites(loadFavorites());

    setLearned(loadLearned());

  }, []);



  const filteredFormulas = formulas.filter((formula) =>

    formula.name
      .toLowerCase()
      .includes(search.toLowerCase())

    ||

    formula.category
      .toLowerCase()
      .includes(search.toLowerCase())

  );



  console.log(formulas.length);
  return (

    <AppLayout>

      <div className="space-y-6">


        <div className="
        rounded-3xl
        bg-gradient-to-br
        from-purple-100
        to-pink-100
        p-8
        shadow-lg
        ">

          <h1 className="
          text-4xl
          font-bold
          text-purple-700
          ">
            📚 Formula Studio
          </h1>


          <p className="
          mt-2
          text-gray-800
          ">
            Learn Excel formulas in a simple and memorable way 🌸
          </p>


        </div>




        <input

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          placeholder="Search formula... Example: XLOOKUP"

          className="
          w-full
          rounded-2xl
          bg-white
          border
          border-purple-200
          p-4
          text-gray-900
          placeholder:text-gray-500
          outline-none
          "

        />





        <div className="
        grid
        md:grid-cols-2
        gap-6
        ">


        {filteredFormulas.map((formula)=>(


          <div

          key={formula.id}

          className="
          rounded-3xl
          bg-white
          p-6
          shadow-lg
          border
          border-purple-100
          ">


            <div className="
            flex
            justify-between
            items-center
            ">


              <h2 className="
              text-3xl
              font-bold
              text-purple-700
              ">
                {formula.name}
              </h2>


              <span className="
              text-gray-900
              font-semibold
              text-sm
              ">
                {formula.difficulty}
              </span>


            </div>




            <p className="
            mt-4
            text-gray-900
            font-medium
            ">
              {formula.purpose}
            </p>





            <section className="
            mt-5
            bg-purple-50
            rounded-2xl
            p-4
            ">

              <h3 className="
              font-bold
              text-purple-700
              ">
                Syntax
              </h3>


              <p className="
              mt-2
              text-gray-900
              ">
                {formula.syntax}
              </p>

            </section>






            <section className="mt-5">

              <h3 className="
              font-bold
              text-purple-700
              ">
                Arguments
              </h3>


              <ul className="
              mt-2
              space-y-1
              text-gray-900
              ">

              {formula.arguments.map((arg,index)=>(

                <li key={index}>
                  • {arg}
                </li>

              ))}

              </ul>

            </section>







            <section className="mt-5">

              <h3 className="
              font-bold
              text-purple-700
              ">
                When to use
              </h3>


              <ul className="
              mt-2
              space-y-1
              text-gray-900
              ">

              {formula.whenToUse.map((item,index)=>(

                <li key={index}>
                  ✔ {item}
                </li>

              ))}

              </ul>


            </section>







            <section className="
            mt-5
            bg-red-50
            rounded-2xl
            p-4
            ">


              <h3 className="
              font-bold
              text-red-700
              ">
                Avoid when
              </h3>


              <p className="
              mt-2
              text-gray-900
              ">
                {formula.avoidWhen}
              </p>


            </section>







            <section className="
            mt-5
            bg-blue-50
            rounded-2xl
            p-4
            ">

              <h3 className="
              font-bold
              text-blue-700
              ">
                Example
              </h3>


              <p className="
              mt-2
              text-gray-900
              ">
                {formula.example}
              </p>


            </section>







            <section className="
            mt-5
            bg-pink-100
            rounded-2xl
            p-4
            ">


              <h3 className="
              font-bold
              text-pink-700
              ">
                🧠 Remember
              </h3>


              <p className="
              mt-2
              text-gray-900
              ">
                {formula.memory}
              </p>


            </section>








            <div className="
            mt-6
            flex
            gap-3
            ">


              <button

              onClick={()=>{

                setFavorites(
                  toggleFavorite(formula.id)
                );

              }}

              className="
              flex-1
              rounded-2xl
              bg-pink-200
              py-3
              text-pink-800
              font-bold
              ">

                {
                  favorites.includes(formula.id)
                  ? "💗 Favorite"
                  : "♡ Favorite"
                }


              </button>





              <button

              onClick={()=>{

                setLearned(
                  markLearned(formula.id)
                );

              }}

              className="
              flex-1
              rounded-2xl
              bg-green-200
              py-3
              text-green-800
              font-bold
              ">


                {
                  learned.includes(formula.id)
                  ? "✅ Learned"
                  : "📚 Mark Learned"
                }


              </button>


            </div>



          </div>


        ))}


        </div>


      </div>


    </AppLayout>

  );

}
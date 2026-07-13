export type MochiAnswer = {
  topic: string;
  answer: string;
  memory: string;
  example: string;
};


const mochiKnowledge: MochiAnswer[] = [

  {
    topic: "xlookup",
    answer:
      "XLOOKUP helps you find a value and return related information from another place. It is like asking Excel: 'Find this person and tell me their details.'",

   memory:
  "XLOOKUP = Search + Bring back the answer",

    example:
      "Employee ID → Find Employee Salary"
  },


  {
    topic: "sumifs",
    answer:
      "SUMIFS adds numbers only when multiple conditions are true. It is useful when you want a total based on rules.",

    memory:
      "SUMIFS = Add only what matches the conditions ➕",

    example:
      "Total sales of Product A in January"
  },


  {
    topic: "filter",
    answer:
      "FILTER shows only the rows that match your condition. It creates a smaller view from a bigger dataset.",

    memory:
      "FILTER = Show only what you need 🧹",

    example:
      "Show only customers from Jaipur"
  },


  {
    topic: "pivot table",
    answer:
      "A Pivot Table summarizes large data quickly. It helps you understand patterns without writing many formulas.",

    memory:
      "Pivot Table = Turn big data into simple reports 📊",

    example:
      "Monthly sales by category"
  },


];


export function askMochi(question:string) {

  const text =
    question.toLowerCase();


  const found =
    mochiKnowledge.find(item =>
      text.includes(item.topic)
    );


  if(found){

    return found;

  }


  return {

    topic:"general",

    answer:
      "I am still learning this topic 🌸. Try asking me about Excel formulas, dashboards, or analytics concepts.",

    memory:
      "Small steps every day create data skills 🌱",

    example:
      "Try asking: Explain XLOOKUP"

  };

}
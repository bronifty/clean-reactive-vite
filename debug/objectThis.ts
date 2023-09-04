// const obj = {
//   outerFunction(outerVariable) {
//     let outerLocalVariable = "Outer Local";
//     function innerFunction(innerVariable) {
//       console.log(`function Outer Variable: ${outerVariable}`);
//       console.log(`function Outer Local Variable: ${outerLocalVariable}`);
//       console.log(`function Inner Variable: ${innerVariable}`);
//       console.log(`function this: ${JSON.stringify(this, null, 2)}`);
//     }
//     innerFunction.apply({ context: "Custom Context" }, ["Inner Local"]);
//     innerFunction("Inner Local");
//     const innerFunctionArrow = (innerVariable) => {
//       console.log(`arrow Outer Variable: ${outerVariable}`);
//       console.log(`arrow Outer Local Variable: ${outerLocalVariable}`);
//       console.log(`arrow Inner Variable: ${innerVariable}`);
//       console.log(`arrow this: ${JSON.stringify(this, null, 2)}`);
//     };
//     innerFunctionArrow("Inner Local");
//   },
// };
// // obj.outerFunction("Outer Global");

// const obj2 = {
//   prop: "I am a property of obj2",
//   regularFunction: function () {
//     console.log(
//       "Inside regularFunction, this is:",
//       JSON.stringify(this, null, 2)
//     );
//   },
//   arrowFunction: () => {
//     console.log(
//       "Inside arrowFunction, this is:",
//       JSON.stringify(this, null, 2)
//     );
//   },
// };
// const obj3 = {
//   prop: "I am a property of obj3",
//   regularFunction: function () {
//     console.log(
//       "Inside regularFunction, this is:",
//       JSON.stringify(this, null, 2)
//     );
//   },
//   arrowFunction: () => {
//     console.log(
//       "Inside arrowFunction, JSON.stringify(this, null, 2) is:",
//       JSON.stringify(this, null, 2)
//     );
//   },
//   nestedFunction: function () {
//     const arrowFunctionInside = () => {
//       console.log(
//         "Inside arrowFunctionInside, JSON.stringify(this, null, 2) is:",
//         JSON.stringify(this, null, 2)
//       );
//     };
//     arrowFunctionInside();
//   },
// };

// obj3.regularFunction();
// obj3.arrowFunction();
// obj3.nestedFunction();

// // obj2.regularFunction();
// // obj2.arrowFunction();

// class Cup {
//   contents = "water";
//   // arrow function lexically scoped (Cup's consume method will always refer to Cup's this.contents of 'water')
//   consume = () => {
//     console.log("You drink the ", this.contents, ". Hydrating!");
//   };
// }
// class Bowl {
//   contents = "chili";
//   // change from arrow to regular function to unbind the method from lexical scope (Bowl's consume method will refer to the caller's this.contents)
//   consume() {
//     console.log("You eat the ", this.contents, ". Spicy!");
//   }
// }
// const cup = new Cup();
// const bowl = new Bowl();
// cup.consume = bowl.consume;
// cup.consume(); // You eat the water. Spicy!
// // reset with new object
// const cup2 = new Cup();
// const bowl2 = new Bowl();
// bowl2.consume = cup2.consume;
// bowl2.consume(); // You drink the water . Hydrating!

const cup = {
  contents: "water",
  consume: () => {
    console.log("You drink the ", cup.contents, ". Hydrating!");
  },
};

const bowl = {
  contents: "chili",
  consume: function () {
    console.log("You eat the ", this.contents, ". Spicy!");
  },
};

cup.consume = bowl.consume;
cup.consume(); // You eat the water. Spicy!

const cup2 = {
  contents: "water",
  consume: () => {
    console.log("You drink the ", cup2.contents, ". Hydrating!");
  },
};

const bowl2 = {
  contents: "chili",
  consume: function () {
    console.log("You eat the ", this.contents, ". Spicy!");
  },
};

bowl2.consume = cup2.consume;
bowl2.consume(); // You drink the water . Hydrating!

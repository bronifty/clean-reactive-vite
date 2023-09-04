const obj = {
  outerFunction(outerVariable) {
    let outerLocalVariable = "Outer Local";
    function innerFunction(innerVariable) {
      console.log(`function Outer Variable: ${outerVariable}`);
      console.log(`function Outer Local Variable: ${outerLocalVariable}`);
      console.log(`function Inner Variable: ${innerVariable}`);
      console.log(`function this: ${JSON.stringify(this, null, 2)}`);
    }
    innerFunction.apply({ context: "Custom Context" }, ["Inner Local"]);
    innerFunction("Inner Local");
    const innerFunctionArrow = (innerVariable) => {
      console.log(`arrow Outer Variable: ${outerVariable}`);
      console.log(`arrow Outer Local Variable: ${outerLocalVariable}`);
      console.log(`arrow Inner Variable: ${innerVariable}`);
      console.log(`arrow this: ${JSON.stringify(this, null, 2)}`);
    };
    innerFunctionArrow("Inner Local");
  },
};
// obj.outerFunction("Outer Global");

const obj2 = {
  prop: "I am a property of obj2",
  regularFunction: function () {
    console.log(
      "Inside regularFunction, this is:",
      JSON.stringify(this, null, 2)
    );
  },
  arrowFunction: () => {
    console.log(
      "Inside arrowFunction, this is:",
      JSON.stringify(this, null, 2)
    );
  },
};
const obj3 = {
  prop: "I am a property of obj3",
  regularFunction: function () {
    console.log(
      "Inside regularFunction, this is:",
      JSON.stringify(this, null, 2)
    );
  },
  arrowFunction: () => {
    console.log(
      "Inside arrowFunction, JSON.stringify(this, null, 2) is:",
      JSON.stringify(this, null, 2)
    );
  },
  nestedFunction: function () {
    const arrowFunctionInside = () => {
      console.log(
        "Inside arrowFunctionInside, JSON.stringify(this, null, 2) is:",
        JSON.stringify(this, null, 2)
      );
    };
    arrowFunctionInside();
  },
};

obj3.regularFunction();
obj3.arrowFunction();
obj3.nestedFunction();

// obj2.regularFunction();
// obj2.arrowFunction();

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
    const innerFunctionArrow = (innerVariable) => {
      console.log(`arrow Outer Variable: ${outerVariable}`);
      console.log(`arrow Outer Local Variable: ${outerLocalVariable}`);
      console.log(`arrow Inner Variable: ${innerVariable}`);
      console.log(`arrow this: ${JSON.stringify(this, null, 2)}`);
    };
    innerFunctionArrow("Inner Local");
  },
};
obj.outerFunction("Outer Global");

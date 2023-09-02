import React from "react";
type Model = number;
type Message = "increment" | "decrement";
const init: Model = 0;
const reducer = (message: Message, model: Model): Model => {
  // console.log(message);
  switch (message) {
    case "increment":
      return model + 1;
    case "decrement":
      return model - 1;
    default:
      return model;
  }
};
const view = (model: Model, dispatch: React.Dispatch<Message>): JSX.Element => {
  return (
    <div>
      <button
        onClick={() => {
          // console.log("increment");
          dispatch("increment");
        }}>
        +
      </button>
      <div>{model}</div>
      <button onClick={() => dispatch("decrement")}>-</button>
    </div>
  );
};
const App = () => {
  const [state, setState] = React.useState(init);
  const dispatch = (message: Message): void => {
    // console.log(message);
    setState(reducer(message, state));
  };
  return view(state, dispatch);
};
export default App;

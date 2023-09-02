import React from "react";
type Model = number;
type Message = "increment" | "decrement";
const init: Model = 0;
const reducer = (message: Message, model: Model): Model => {
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
      <button onClick={() => dispatch("increment")}>+</button>
      <div>{model}</div>
      <button onClick={() => dispatch("decrement")}>-</button>
    </div>
  );
};
interface AppProps {
  initialState: Model;
  reducerFunction: (message: Message, model: Model) => Model;
}
const App: React.FC<AppProps> = ({ initialState, reducerFunction }) => {
  const [state, setState] = React.useState(initialState);
  const dispatch = (message: Message): void => {
    setState(reducerFunction(message, state));
  };
  return view(state, dispatch);
};
const MainApp = () => {
  return <App initialState={init} reducerFunction={reducer} />;
};
export default MainApp;

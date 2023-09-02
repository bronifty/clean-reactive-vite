import React from "react";

// Define types
type Model = number;
type Message = "increment" | "decrement";

// Define the interface for dispatching
interface IDispatcher {
  dispatch: (message: Message) => void;
}

// Implement the class
class Dispatcher implements IDispatcher {
  private state: Model;
  private reducerFunction: (message: Message, model: Model) => Model;

  constructor(
    initialState: Model,
    reducerFunction: (message: Message, model: Model) => Model
  ) {
    this.state = initialState;
    this.reducerFunction = reducerFunction;
  }

  public setState(newState: Model) {
    this.state = newState;
  }

  public dispatch(message: Message) {
    this.state = this.reducerFunction(message, this.state);
  }
}

// Define the view
const view = (model: Model, dispatcher: IDispatcher): JSX.Element => (
  <div>
    <button onClick={() => dispatcher.dispatch("increment")}>+</button>
    <div>{model}</div>
    <button onClick={() => dispatcher.dispatch("decrement")}>-</button>
  </div>
);

// Define App component
const App: React.FC = () => {
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

  const [state, setState] = React.useState(init);
  const dispatcher = new Dispatcher(init, reducer);

  // Sync the Dispatcher state with React state
  React.useEffect(() => {
    dispatcher.setState(state);
  }, [state]);

  return view(state, dispatcher);
};

export default App;

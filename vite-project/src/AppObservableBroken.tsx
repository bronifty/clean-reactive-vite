import React, { useState, useEffect } from "react";
import { IObservable, ObservableFactory } from "./Observable"; // Assuming Observable is in the same directory

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

const view = (model: Model, dispatch: React.Dispatch<Message>): JSX.Element => (
  <div>
    <h1>lol</h1>
    <button onClick={() => dispatch("increment")}>+</button>
    <div>{model}</div>
    <button onClick={() => dispatch("decrement")}>-</button>
  </div>
);

const App: React.FC = () => {
  const modelObservable: IObservable = ObservableFactory.create(init);
  const [state, setState] = useState<Model>(modelObservable.value as Model);
  useEffect(() => {
    const unsubscribe = modelObservable.subscribe((newValue: Model) => {
      setState(newValue); // Update React state to force re-render
    });
    return () => {
      // Clean-up
      unsubscribe();
    };
  }, [modelObservable]);

  const dispatch = (message: Message): void => {
    // Update the observable value using the reducer
    modelObservable.value = reducer(message, modelObservable.value as Model);
  };

  return view(state, dispatch);
};

export default App;

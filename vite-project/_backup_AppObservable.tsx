import React, { useEffect } from "react";
// import { IObservable, ObservableFactory } from "./Observable";
export interface IObservable {
  value: any;
  subscribe(handler: Function): Function;
  publish(): void;
  push(item: any): void;
  compute(): Promise<void>;
}
export class Observable implements IObservable {
  private _value: any;
  private _previousValue: any;
  private _subscribers: Function[] = [];
  private static _computeActive: Observable | null = null;
  private _computeFunction: Function | null = null;
  private _computeArgs: any[] = [];
  private static _computeChildren: Observable[] = [];
  private _childSubscriptions: Function[] = [];
  constructor(initialValue: any, ...args: any[]) {
    this._previousValue = undefined; // Initialize _previousValue
    if (typeof initialValue === "function") {
      this._computeFunction = initialValue;
      this._computeArgs = args;
      this.compute();
    } else {
      this._value = initialValue;
    }
  }
  get value() {
    if (
      Observable._computeActive &&
      !Observable._computeChildren.includes(this)
    ) {
      Observable._computeChildren.push(this);
    }
    return this._value;
  }
  set value(newValue: any) {
    console.log("Setting new value:", newValue); // Debug log
    this._previousValue = this._value;
    this._value = newValue;
    this.publish();
  }
  push(item: any) {
    if (Array.isArray(this._value)) {
      this._value.push(item);
    } else {
      throw new Error("Push can only be called on an observable array.");
    }
  }
  subscribe(handler: Function) {
    this._subscribers.push(handler);
    return () => {
      const index = this._subscribers.indexOf(handler);
      if (index > -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }
  publish() {
    console.log("Publishing value:", this._value); // Debug log
    this._subscribers.forEach((handler) =>
      handler(this._value, this._previousValue)
    );
  }
  static delay(ms: number) {
    let timeoutId: number;
    const promise = new Promise((resolve) => {
      timeoutId = setTimeout(resolve, ms);
    });
    const clear = () => clearTimeout(timeoutId);
    return { promise, clear };
  }
  async compute() {
    if (this._computeFunction) {
      this._childSubscriptions.forEach((unsubscribe) => unsubscribe());
      this._childSubscriptions.length = 0;
      Observable._computeActive = this;
      this._previousValue = this._value;
      const computedValue = this._computeFunction(...this._computeArgs);
      if (computedValue instanceof Promise) {
        this._value = await computedValue;
      } else {
        this._value = computedValue;
      }
      this.publish();
      Observable._computeActive = null;
      Observable._computeChildren.forEach((child) =>
        this._childSubscriptions.push(child.subscribe(() => this.compute()))
      );
      Observable._computeChildren.length = 0;
    }
  }
}
export class ObservableFactory {
  static create(initialValue: any, ...args: any[]): IObservable {
    return new Observable(initialValue, ...args);
  }
}
type Model = number;
type Message = "increment" | "decrement";
const init: Model = 0;
const reducer = (message: Message, model: Model): Model => {
  console.log(message);
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
  const modelObservable: IObservable = React.useMemo(
    () => ObservableFactory.create(init),
    []
  );
  console.log("Model Observable Created:", modelObservable); // Debug log

  const [state, setState] = React.useState(modelObservable.value as Model);
  console.log(state);
  useEffect(() => {
    const unsubscribe = modelObservable.subscribe((newValue: Model) => {
      console.log("Received new value:", newValue); // Debug log
      setState(newValue);
    });
    return () => {
      unsubscribe();
    };
  }, [modelObservable]);
  const dispatch = (message: Message): void => {
    // Directly update the modelObservable.value inside the dispatch function
    modelObservable.value = reducer(message, modelObservable.value as Model);
  };

  return view(state, dispatch);
};
export default App;

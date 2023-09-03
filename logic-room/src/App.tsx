import React, { useState } from "react";
import ReactDOM from "react-dom";
// going to figure out how to sync the Store and Gateway (API backend / db)
class Gateway {
  static books = [
    { name: "Book 1", author: "Author 1" },
    { name: "Book 2", author: "Author 2" },
  ];
  static async get() {
    return { result: this.books };
  }
  static async post(path: string, requestDto: any) {
    this.books.push(requestDto);
    return { success: true };
  }
  static async delete(path: string) {
    this.books.length = 0;
    return { success: true };
  }
}
export interface IObservable {
  value: any;
  subscribe(handler: Function): Function;
  push(item: any): void;
  publish(): void;
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
    this._previousValue = this._value; // Store the current value as the previous value
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
    this._subscribers.forEach((handler) =>
      handler(this._value, this._previousValue)
    ); // Pass both current and previous values
  }
  static delay(ms: number) {
    let timeoutId: number;
    const promise = new Promise((resolve) => {
      timeoutId = setTimeout(resolve, ms);
    });
    const clear = () => clearTimeout(timeoutId);
    return { promise, clear };
  }
  // called by child observable subscriptions and by the constructor
  async compute() {
    if (this._computeFunction) {
      // Unsubscribe old child subscriptions
      this._childSubscriptions.forEach((unsubscribe) => unsubscribe());
      this._childSubscriptions.length = 0;

      Observable._computeActive = this;
      this._previousValue = this._value; // Store the current value as the previous value
      const computedValue = this._computeFunction(...this._computeArgs);
      // Handle the case where the computed value is a Promise
      if (computedValue instanceof Promise) {
        this._value = await computedValue; // Await the promise resolution
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
type Action = "Add" | "Remove";
type BookFields = {
  name: string;
  author: string;
};
type Model = BookFields[];
class Store {
  private _state: IObservable;
  constructor(init: any) {
    this._state = ObservableFactory.create(init);
  }
  get value() {
    return this._state.value;
  }
  set value(newValue: any) {
    this._state.value = newValue;
  }
  publish = () => {
    this._state.publish();
  };
  subscribe = (subscriber) => {
    this._state.subscribe(subscriber);
  };
  init = async () => {
    const { result } = await Gateway.get();
    this.value = { result };
    console.log(
      `in Store.init; this.value: ${JSON.stringify(this.value, null, 2)}`
    );
  };
  dispatch = (action: Action, payload: BookFields) => {
    console.log(
      `in Store.dispatch before call to reducer; this.value: ${JSON.stringify(
        this.value,
        null,
        2
      )}`
    );
    const reducerResult = this.reducer(action, payload);
    this.value = { result: reducerResult };
    // this.value.result = this.reducer(action, payload);
    console.log(
      `in Store.dispatch after call to reducer; this.value: ${JSON.stringify(
        this.value,
        null,
        2
      )}`
    );
  };
  private reducer = (action: Action, fields: BookFields): Model => {
    console.log(`this.value: ${JSON.stringify(this.value, null, 2)}`);
    switch (action) {
      case "Add":
        return [...this.value.result, fields];
      case "Remove":
        return [];
      default:
        return this.value.result;
    }
  };
}

type StoreInitType = any; // Define the type for store initial state, replace 'any' as needed
class StoreFactory {
  private static singleton: Store | null = null;
  static createSingleton(init: StoreInitType): Store {
    if (!this.singleton) {
      this.singleton = new Store(init);
    }
    return this.singleton;
  }
  static createInstance(init: StoreInitType): Store {
    return new Store(init);
  }
}

const instanceStore1 = StoreFactory.createInstance({
  result: [{ name: "Instance Book 1", author: "Author 2" }],
});
const computedFunction = () => instanceStore1.value;
const instanceStore2 = StoreFactory.createInstance(computedFunction);

const init: Model = [];
const storeObject = instanceStore2;
export class Presenter {
  private storeObject: Store;

  constructor(store: Store) {
    this.storeObject = store;
  }
  subscribe = (componentSubscriber) => {
    storeObject.subscribe((observableModel) => {
      console.log(
        `in Presenter.subscribe calling storeObject.subscribe with function to take observableModel: ${JSON.stringify(
          observableModel,
          null,
          2
        )}`
      );
      const viewModel = observableModel.result.map((om) => {
        return { name: om.name, author: om.author };
      });
      componentSubscriber(viewModel);
    });
  };
  init = async () => {
    await storeObject.init();
  };
  publish = () => {
    storeObject.publish();
  };
  load = async (callback) => {
    this.subscribe(callback);
    await this.init();
    this.publish();
  };
  post = async (fields) => {
    await storeObject.dispatch("Add", fields);
  };
  delete = () => {
    storeObject.value = { result: [] };
  };
}
function App() {
  const PresenterObject = new Presenter(instanceStore1);
  const [state, setState] = React.useState([]);
  const defaultValues = {
    name: "",
    author: "",
  };
  const [fields, setFields] = React.useState(defaultValues);
  const setField = (field, value) => {
    setFields((old) => ({ ...old, [field]: value }));
  };
  // loads data from store on mount
  React.useEffect(() => {
    const componentSubscriber = (viewModel) => setState(viewModel);
    async function load() {
      await PresenterObject.load(componentSubscriber);
      // await PresenterObject.subscribe(componentSubscriber);
      // PresenterObject.publish();
    }
    load();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    PresenterObject.post(fields);
    setFields(defaultValues);
  };
  const removeBooks = () => {
    PresenterObject.delete();
  };
  const refreshBooks = () => {
    PresenterObject.init();
  };
  return (
    <div>
      <h2>Books</h2>
      <div>
        {state?.map((book, idx) => {
          return (
            <div key={idx}>
              {book.name} by {book.author}
            </div>
          );
        })}
      </div>
      <h2>Add Book</h2>
      <form onSubmit={(e) => handleSubmit(e)}>
        <label htmlFor="name">name: </label>
        <input
          id="name"
          type="text"
          value={fields.name}
          onChange={(e) => setField("name", e.target.value)}
        />
        <label htmlFor="author">author: </label>
        <input
          id="author"
          type="text"
          value={fields.author}
          onChange={(e) => setField("author", e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <h2>Remove Books</h2>
      <button onClick={removeBooks}>Delete Books</button>
      <h2>Refresh Books</h2>
      <button onClick={refreshBooks}>Refresh Books</button>
    </div>
  );
}
export default App;

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
  private static _instance: Store | null = null;
  private _state: IObservable;
  private constructor(init: any) {
    this._state = ObservableFactory.create(init);
  }
  static getInstance(init: any = {}) {
    if (!this._instance) {
      this._instance = new Store(init);
    }
    return this._instance;
  }
  get value() {
    return this._state.value;
  }
  set value(newValue: any) {
    // const intermediateValue1 = this._state.value;
    // const intermediateValue2 = intermediateValue1.push(newValue);
    // this._state.value = intermediateValue2;
    this._state.value = newValue;
  }
  publish = () => {
    this._state.publish();
  };
  subscribe = (subscriber) => {
    this._state.subscribe(subscriber);
  };
  push = (newVal) => {
    console.log(`push(${JSON.stringify(newVal, null, 2)})`);

    this._state.push(newVal);
  };
  dispatch = (action: Action, payload: BookFields) => {
    console.log(`dispatch(${action}, ${JSON.stringify(payload)})`);

    this.value = this.reducer(action, payload);
    console.log(`this.value: ${this._state.value}`);
  };
  private reducer = (action: Action, fields: BookFields): Model => {
    const currentValue = this._state.value;
    console.log(`currentValue ${JSON.stringify(currentValue)}`);
    switch (action) {
      case "Add":
        return currentValue.push(fields);
      case "Remove":
        return (this._state.value = []);
      default:
        return this._state.value;
    }
  };
}
// refactor to put this in the store and use store to call the Gateway for an initial value
const init: Model = [
  { name: "Book 1", author: "Author 1" },
  { name: "Book 2", author: "Author 2" },
];
const storeObject = Store.getInstance(init);
export class Presenter {
  // transform = async () => {
  //   const repoData = await storeObject.value;
  //   // if length of repoData > 0, transform it
  //   if (repoData.length === 0) return;
  //   const transformedRepoData = repoData.map((book: BookFields) => {
  //     return {
  //       name: book.name,
  //       author: book.author,
  //     };
  //   });
  //
  //     `transformedRepoData: ${JSON.stringify(transformedRepoData, null, 2)}`
  //   );
  //   return transformedRepoData;
  // };
  subscribe = (componentSubscriber) => {
    storeObject.subscribe((observableModel) => {
      const viewModel = observableModel.map((om) => {
        return { name: om.name, author: om.author };
      });
      componentSubscriber(viewModel);
    });
    storeObject.publish();
  };
  publish = () => {
    storeObject.publish();
  };
  // load = async (componentSubscriber) => {
  //   storeObject.subscribe((observableModel) => {
  //     const viewModel = observableModel.map((om) => {
  //       return { name: om.name, author: om.author };
  //     });
  //     componentSubscriber(viewModel);
  //   });
  //   storeObject.publish();
  // };
  post = async (fields) => {
    console.log(
      `storeObject.push(${JSON.stringify(
        fields,
        null,
        2
      )}); storeObject.publish()`
    );

    storeObject.push(fields);
    storeObject.publish();
    // await storeObject.dispatch("Add", fields);
  };
  delete = async () => {
    // await storeObject.removeBooks();
  };
}
function App() {
  const PresenterObject = new Presenter();
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
      await PresenterObject.subscribe(componentSubscriber);
      PresenterObject.publish();
    }
    load();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`PresenterObject.post(${JSON.stringify(fields, null, 2)})`);

    PresenterObject.post(fields);
    setFields(defaultValues);
  };
  const removeBooks = () => {
    PresenterObject.delete();
  };
  return (
    <div>
      <h2>Books</h2>
      {state.map((book, i) => {
        return <div key={i}>{book.name}</div>;
      })}
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
    </div>
  );
}
export default App;

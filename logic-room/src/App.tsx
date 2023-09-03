import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ObservableFactory, IObservable } from "./Observable";
// // going to figure out how to sync the Store and Gateway (API backend / db)
// class Gateway {
//   static books = [
//     { name: "Book 1", author: "Author 1" },
//     { name: "Book 2", author: "Author 2" },
//   ];
//   static async get() {
//     return { result: this.books };
//   }
//   static async post(path: string, requestDto: any) {
//     this.books.push(requestDto);
//     return { success: true };
//   }
//   static async delete(path: string) {
//     this.books.length = 0;
//     return { success: true };
//   }
// }

type Action = "Add" | "Remove";
type BookFields = {
  name: string;
  author: string;
};
type Model = BookFields[];
class Store {
  private _state: IObservable;

  constructor(init: any | Function, ...args: any[]) {
    if (typeof init === "function") {
      this._state = ObservableFactory.create(init, ...args);
    } else {
      this._state = ObservableFactory.create(init);
    }
  }
  get value() {
    return this._state.value;
  }
  set value(newValue: any) {
    console.log(`Store set value ${JSON.stringify(newValue, null, 2)}`);

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
  };
  dispatch = (action: Action, payload: BookFields) => {
    const reducerResult = this.reducer(action, payload);
    this.value = { result: reducerResult };
  };
  private reducer = (action: Action, fields: BookFields): Model => {
    switch (action) {
      case "Add":
        return [...this.value.result, fields];
      case "Remove":
        return [];
      default:
        return this.value.result;
    }
  };
  bindComputedObservable(sourceObservable: IObservable) {
    sourceObservable.subscribe((newState) => {
      this.value = newState; // or some transformation of newState
      this.publish();
    });
  }
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
export class Presenter {
  private storeObject: Store;

  constructor(store: Store) {
    this.storeObject = store;
  }
  subscribe = (componentSubscriber) => {
    this.storeObject.subscribe((observableModel) => {
      const viewModel = observableModel.result.map((om) => {
        return { name: om.name, author: om.author };
      });
      componentSubscriber(viewModel);
    });
  };
  // init = async () => {
  //   await this.storeObject.init();
  // };
  publish = () => {
    this.storeObject.publish();
  };
  load = async (callback) => {
    this.subscribe(callback);
    // await this.init();
    this.publish();
  };
  post = (fields) => {
    this.storeObject.dispatch("Add", fields);
    // this.storeObject.value = { result: [{ name: "test", author: "test" }] };
  };
  delete = () => {
    this.storeObject.value = { result: [] };
  };
}

const instanceStore1 = StoreFactory.createInstance({
  result: [
    { name: "Book 1", author: "Author 1" },
    { name: "Book 2", author: "Author 2" },
  ],
});
// instanceStore1.subscribe((update) =>
//   console.log(`instanceStore1 ${JSON.stringify(update, null, 2)}`)
// );
const firstComputedFunction = () => instanceStore1.value;
const firstComputed = StoreFactory.createInstance(firstComputedFunction);
firstComputed.bindComputedObservable(instanceStore1);
firstComputed.subscribe((update) =>
  console.log(`firstComputed ${JSON.stringify(update, null, 2)}`)
);
const secondComputedFunction = () => firstComputed.value;
const secondComputed = StoreFactory.createInstance(secondComputedFunction);
secondComputed.bindComputedObservable(firstComputed);

secondComputed.subscribe((update) =>
  console.log(`secondComputed ${JSON.stringify(update, null, 2)}`)
);
const thirdComputedFunction = () => secondComputed.value;
const thirdComputed = StoreFactory.createInstance(thirdComputedFunction);
thirdComputed.subscribe((update) =>
  console.log(`thirdComputed ${JSON.stringify(update, null, 2)}`)
);

function ParameterizedApp({ storeInstance }) {
  const PresenterObject = new Presenter(storeInstance);
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

function App() {
  return (
    <>
      <h1>App 1</h1>
      <ParameterizedApp storeInstance={instanceStore1} />
      <h1>App 2</h1>
      <ParameterizedApp storeInstance={firstComputed} />
      <h1>App 3</h1>
      <ParameterizedApp storeInstance={secondComputed} />
      <h1>App 4</h1>
      <ParameterizedApp storeInstance={thirdComputed} />
    </>
  );
}
export default App;

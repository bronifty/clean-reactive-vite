import React, { useState } from "react";
import ReactDOM from "react-dom";

// Gateway class with static methods; we'll see if we run into trouble testing this
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
interface IObservable {
  value: any;
  publish(): void;
  subscribe(handler: Function): Function;
}
// Observable is reactive state
export class Observable implements IObservable {
  private _value;
  private _subscribers = [];
  constructor(initialValue) {
    this._value = initialValue;
  }
  get value() {
    return this._value;
  }
  set value(newValue) {
    this._value = newValue;
  }
  publish = () => {
    for (const callback of this._subscribers) {
      callback(this._value);
    }
  };
  subscribe = (callback) => {
    this._subscribers.push(callback);
  };
}
// Store manages Gateway and Observable as primary state of App
class Store {
  private state;
  constructor() {
    this.state = new Observable([]);
  }
  private get value() {
    return this.state.value;
  }
  private set value(newValue) {
    console.log("Setting new value:", newValue); // Debug log
    this.state.value = newValue;
  }
  private publish = () => {
    this.state.publish();
  };
  load = async () => {
    const booksDto = await Gateway.get();
    console.log(`booksDto: ${JSON.stringify(booksDto, null, 2)}`);
    this.value = booksDto.result.map((bookDto) => {
      return bookDto;
    });
  };
  subscribe = (callback) => {
    return this.state.subscribe(callback);
  };
  post = async (fields) => {
    console.log(`Gateway.post(fields): ${JSON.stringify(fields, null, 2)}`);
    await Gateway.post("books", fields);
  };
  delete = async () => {
    await Gateway.delete("reset");
  };

  // getBooks = async (callback) => {
  //   this.state.subscribe(callback);
  //   await this.load();
  //   this.state.publish();
  // };
  addBook = async (fields) => {
    console.log(`Store.post(fields): ${JSON.stringify(fields)}`);
    await this.post(fields);
    await this.load();
    this.state.publish();
  };
  removeBooks = async () => {
    await this.delete();
    await this.load();
    this.state.publish();
  };
  getData = async () => {
    await this.load();
    return this.state.value;
  };
}
const StoreObject = new Store();
// Transformer transforms and adapts Store data for components
export class Transformer {
  transform = async () => {
    const repoData = await StoreObject.getData();
    const transformedRepoData = repoData.map((data) => {
      return {
        name: data.name,
      };
    });
    console.log(
      `transformedRepoData: ${JSON.stringify(transformedRepoData, null, 2)}`
    );
    return transformedRepoData;
  };
  load = async (callback) => {
    StoreObject.subscribe(async () => {
      const repoData = await this.transform();
      callback(repoData);
    });
    await StoreObject.load();
    StoreObject.publish();
  };
  post = async (fields) => {
    console.log(`StoreObject.addBook(fields): ${JSON.stringify(fields)}`);
    await StoreObject.addBook(fields);
  };
  delete = async () => {
    await StoreObject.removeBooks();
  };
}
function App() {
  const TransformerObject = new Transformer();
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
    async function load() {
      await TransformerObject.load((viewModel) => {
        setState(viewModel);
      });
    }
    load();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`TransformerObject.post(fields): ${JSON.stringify(fields)}`);
    TransformerObject.post(fields);
    setFields(defaultValues);
  };
  const removeBooks = () => {
    TransformerObject.delete();
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

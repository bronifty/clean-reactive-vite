import React, { useState } from "react";
import ReactDOM from "react-dom";

class HttpGateway {
  books = [
    { name: "Book 1", author: "Author 1" },
    { name: "Book 2", author: "Author 2" },
  ];
  get = async () => {
    return { result: this.books };
  };
  post = async (path, requestDto) => {
    this.books.push(requestDto);
    return { success: true };
  };
  delete = async (path) => {
    this.books.length = 0;
    return { success: true };
  };
}
const httpGateway = new HttpGateway();

interface IObservable {
  value: any;
  publish(): void;
  subscribe(handler: Function): Function;
}
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
class Repository {
  private _state;
  constructor() {
    this._state = new Observable([]);
  }
  private get value() {
    return this._state.value;
  }
  private set value(newValue) {
    console.log("Setting new value:", newValue); // Debug log
    this._state.value = newValue;
  }
  private publish = () => {
    this._state.publish();
  };
  subscribe = (callback) => {
    return this._state.subscribe(callback);
  };
  load = async () => {
    const booksDto = await httpGateway.get();
    console.log(`booksDto: ${JSON.stringify(booksDto, null, 2)}`);
    this.value = booksDto.result.map((bookDto) => {
      return bookDto;
    });
  };
  // getBooks = async (callback) => {
  //   this._state.subscribe(callback);
  //   await this.load();
  //   this._state.publish();
  // };
  addBook = async (fields) => {
    console.log(`Repository.postApiData(fields): ${JSON.stringify(fields)}`);
    await this.postApiData(fields);

    await this.load();
    this._state.publish();
  };
  removeBooks = async () => {
    await this.deleteApiData();
    await this.load();
    this._state.publish();
  };

  postApiData = async (fields) => {
    console.log(`httpGateway.post(fields): ${JSON.stringify(fields, null, 2)}`);

    await httpGateway.post(this.apiUrl + "books", fields);
  };
  deleteApiData = async () => {
    await httpGateway.delete(this.apiUrl + "reset");
  };
  getData = async () => {
    await this.load();
    return this._state.value;
  };
}
const RepositoryObject = new Repository();
export class BooksPresenter {
  transformData = async () => {
    const repoData = await RepositoryObject.getData();
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
    RepositoryObject.subscribe(async () => {
      const repoData = await this.transformData();
      callback(repoData);
    });
    await RepositoryObject.load();
    RepositoryObject.publish();
  };
  post = async (fields) => {
    console.log(`RepositoryObject.addBook(fields): ${JSON.stringify(fields)}`);
    await RepositoryObject.addBook(fields);
  };
  delete = async () => {
    await RepositoryObject.removeBooks();
  };
}
function App() {
  const booksPresenter = new BooksPresenter();
  const [stateViewModel, copyViewModelToStateViewModel] = React.useState([]);
  const defaultValues = {
    name: "",
    author: "",
  };
  const [fields, setFields] = React.useState(defaultValues);
  React.useEffect(() => {
    async function load() {
      await booksPresenter.load((viewModel) => {
        copyViewModelToStateViewModel(viewModel);
      });
    }
    load();
  }, []);
  const setField = (field, value) => {
    setFields((old) => ({ ...old, [field]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`booksPresenter.post(fields): ${JSON.stringify(fields)}`);
    booksPresenter.post(fields);
    setFields(defaultValues);
  };
  const removeBooks = () => {
    booksPresenter.delete();
  };
  return (
    <div>
      <h2>Books</h2>
      {stateViewModel.map((book, i) => {
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

import React, { useState } from "react";
import ReactDOM from "react-dom";

class HttpGateway {
  books = [
    { name: "Book 1", author: "Author 1" },
    { name: "Book 2", author: "Author 2" },
  ];
  get = async (path) => {
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
export class Observable {
  _value = null;
  subscribers = [];
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
    this.subscribers.forEach((observer) => {
      observer(this._value);
    });
  };
  subscribe = (func) => {
    this.subscribers.push(func);
  };
}
class Repository {
  repoState = null;
  apiUrl = "fakedata";
  constructor() {
    this.repoState = new Observable([]);
  }
  getBooks = async (callback) => {
    this.repoState.subscribe(callback);
    await this.loadApiData();
    this.repoState.publish();
  };
  addBook = async (fields) => {
    console.log(`Repository.postApiData(fields): ${JSON.stringify(fields)}`);
    await this.postApiData(fields);

    await this.loadApiData();
    this.repoState.publish();
  };
  removeBooks = async () => {
    await this.deleteApiData();
    await this.loadApiData();
    this.repoState.publish();
  };
  loadApiData = async () => {
    const booksDto = await httpGateway.get(this.apiUrl + "books");
    this.repoState.value = booksDto.result.map((bookDto) => {
      return bookDto;
    });
  };
  postApiData = async (fields) => {
    console.log(`httpGateway.post(fields): ${JSON.stringify(fields, null, 2)}`);

    await httpGateway.post(this.apiUrl + "books", fields);
  };
  deleteApiData = async () => {
    await httpGateway.delete(this.apiUrl + "reset");
  };
  getData = async () => {
    await this.loadApiData();
    return this.repoState.value;
  };
  subscribe = (callback) => {
    this.repoState.subscribe(callback);
  };
  publish = () => {
    this.repoState.publish();
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
    await RepositoryObject.loadApiData();
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

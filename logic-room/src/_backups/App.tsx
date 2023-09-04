import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ObservableFactory, IObservable } from "./observable/observable";

type Action = "Add" | "Remove";
type BookFields = {
  name: string;
  author: string;
};

const bookObservable = ObservableFactory.create([
  { name: "Book 1", author: "Author 1" },
  { name: "Book 2", author: "Author 2" },
]);

const firstComputedFunction = () => bookObservable.value;
const firstComputed = ObservableFactory.create(firstComputedFunction);

// const secondComputedFunction = () => firstComputed.value;
// const secondComputed = ObservableFactory.create(secondComputedFunction);

// const thirdComputedFunction = () => secondComputed.value;
// const thirdComputed = ObservableFactory.create(thirdComputedFunction);

function ParameterizedApp({
  observableInstance,
}: {
  observableInstance: IObservable;
}) {
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
    const componentSubscriber = (observableValue) => setState(observableValue);
    async function load() {
      observableInstance.subscribe(componentSubscriber);
      observableInstance.publish();
      // await PresenterObject.load(componentSubscriber);
      // await PresenterObject.subscribe(componentSubscriber);
      // PresenterObject.publish();
    }
    load();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    observableInstance.push(fields);
    observableInstance.publish();
    // PresenterObject.post(fields);
    setFields(defaultValues);
  };
  const removeBooks = () => {
    // PresenterObject.delete();
  };
  const refreshBooks = () => {
    // PresenterObject.init();
  };
  const publishBooks = () => {
    observableInstance.publish();
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
      <h2>Publish</h2>
      <button onClick={publishBooks}>Publish Books</button>

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
      <ParameterizedApp observableInstance={bookObservable} />
      <h1>App 2</h1>
      <ParameterizedApp observableInstance={firstComputed} />
      {/* <h1>App 3</h1>
      <ParameterizedApp observableInstance={secondComputed} />
      <h1>App 4</h1>
      <ParameterizedApp observableInstance={thirdComputed} /> */}
    </>
  );
}
export default App;

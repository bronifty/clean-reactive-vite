import React from "react";
import { booksChild, booksParent } from "../store";
type Action = "Add" | "Remove";
type BookFields = {
  name: string;
  author: string;
};

export default function Books({
  data,
  title,
}: {
  data: IObservable;
  title: string;
}) {
  const [booksValue, setBooksValue] = React.useState(data.value);
  React.useEffect(() => {
    const booksSubscription = data.subscribe((value) => {
      setBooksValue(value);
    });
    return () => {
      booksSubscription();
    };
  }, []);

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
      data.subscribe(componentSubscriber);
      data.publish();
      // await PresenterObject.load(componentSubscriber);
      // await PresenterObject.subscribe(componentSubscriber);
      // PresenterObject.publish();
    }
    load();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    data.push(fields);
    data.publish();
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
    data.publish();
  };
  return (
    <div>
      <h2>Books {title}</h2>
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

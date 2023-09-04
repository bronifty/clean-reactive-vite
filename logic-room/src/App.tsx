import React from "react";
import Descendants from "./components/Descendants";
import Books from "./components/Books2";
import {
  booksChild,
  booksParent,
  booksGrandParent,
  child,
  parent,
  grandparent,
} from "./store";

function App() {
  return (
    <>
      <Descendants data={child} title="Child" />
      <Descendants data={parent} title="Parent" />
      <Descendants data={grandparent} title="Grandparent" />
      <Books data={booksChild} title="Child" />
      <Books data={booksParent} title="Parent" />
      <Books data={booksGrandParent} title="Parent" />
    </>
  );
}

export default App;

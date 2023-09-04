import React from "react";
import Descendants from "./components/Descendants";
import Books from "./components/Books";
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
      <Descendants data={child} title="child" />
      <Descendants data={parent} title="parent" />
      <Descendants data={grandparent} title="grandparent" />
      <Books data={booksChild} title="booksChild" />
      <Books data={booksParent} title="booksParent" />
      <Books data={booksGrandParent} title="booksGrandParent" />
    </>
  );
}

export default App;

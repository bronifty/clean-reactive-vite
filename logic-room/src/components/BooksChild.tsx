import {
  booksChild,
  booksParent,
  booksGrandParent,
  child,
  parent,
  grandparent,
} from "../utils/store";

import { Books } from "./Books";

export function BooksChild() {
  return <Books data={booksChild} title={booksChild} />;
}

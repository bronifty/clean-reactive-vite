import { BooksChild } from "./BooksChild";
import { BooksParent } from "./BooksParent";

export function BooksLayout() {
  return (
    <>
      <BooksChild />
      <div></div>
      <BooksParent />
    </>
  );
}

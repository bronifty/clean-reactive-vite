import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import { BooksLayout } from "./components/BooksLayout";
import { DescendantsLayout } from "./components/DescendantsLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "books/",
        element: <BooksLayout />,
        // element: <BooksChild />,
      },
      {
        path: "dependents/",
        element: <DescendantsLayout />,
        // element: <BooksChild />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

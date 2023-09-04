import React from "react";
import "./Layout.css";

export default function Root() {
  return (
    <div className="container">
      <nav className="navbar">
        <a href="/dependents">Dependents</a>
        <a href="/books">Books</a>
      </nav>
      <main className="content"></main>
      <footer className="footer">© 2023 Your Company</footer>
    </div>
  );
}

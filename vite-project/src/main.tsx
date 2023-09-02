import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./AppObservableWorking.tsx";
import App from "./AppObservable.tsx";
// import App from "./AppDIClass.tsx";
// import App from "./AppDI.tsx";
// import App from './App.tsx'
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

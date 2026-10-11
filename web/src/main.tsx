import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { syncProgress } from "./services/progressService";
import "./styles/global.css";

void syncProgress();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


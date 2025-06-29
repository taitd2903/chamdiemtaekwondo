import React from "react";
import ReactDOM from "react-dom/client"; // <-- Đảm bảo import đúng
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; 
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

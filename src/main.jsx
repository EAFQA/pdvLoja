import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastContainer } from 'react-toastify';
import 'rsuite/dist/rsuite.min.css';


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <ToastContainer />
  </React.StrictMode>,
);

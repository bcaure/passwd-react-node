import React from "react";
import { createRoot } from "react-dom/client";

import { Provider } from "react-redux";
import store from "./redux/Store";

import './index.css';
import App from './components/App';

const rootElement = document.getElementById("root");
createRoot(rootElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);

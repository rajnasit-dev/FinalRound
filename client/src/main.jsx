import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";

import { Provider } from "react-redux";
import store from "./store/store.js";

// Global interceptor: force logout when a blocked user gets 403
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isLoginRequest = requestUrl.includes("/auth/login");
    if (
      !isLoginRequest &&
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes("blocked")
    ) {
      localStorage.removeItem("user");
      store.dispatch({ type: "auth/forceLogout" });
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);

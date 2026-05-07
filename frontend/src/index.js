import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const hasGoogleClientId =
  !!googleClientId && googleClientId !== "your_google_client_id_here";
const AppRoot = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  hasGoogleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{AppRoot}</GoogleOAuthProvider>
  ) : (
    AppRoot
  ),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="TU_CLIENT_ID_DE_GOOGLE_AQUI">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

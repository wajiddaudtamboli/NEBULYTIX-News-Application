import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { LanguageProvider } from "./lib/LanguageContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);

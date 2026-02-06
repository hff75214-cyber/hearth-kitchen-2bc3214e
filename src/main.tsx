import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Show developer welcome message in console
import "./lib/consoleWelcome";

createRoot(document.getElementById("root")!).render(<App />);

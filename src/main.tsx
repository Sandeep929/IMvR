  import { createRoot } from "react-dom/client";
  import App from "./app/App";
  import "./styles/index.css";
  import "./electron/renderer";
  import "./electron/titlebar.css";

  createRoot(document.getElementById("root")!).render(<App />);
  
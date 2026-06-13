import { Dashboard } from "./components/layout/Dashboard";
import { useAppearanceEngine } from "./hooks/useAppearanceEngine";
import { useTheme } from "./hooks/useTheme";

function App() {
  useAppearanceEngine();
  useTheme();
  return <Dashboard />;
}

export default App;

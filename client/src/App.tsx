import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";

function App() {
  return (
    <TooltipProvider>
      <Home />
    </TooltipProvider>
  );
}

export default App;

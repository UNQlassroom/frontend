import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes";
import { RoleProvider } from "@/context";
import { Navbar } from "@/components";

function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Navbar />
          <AppRoutes />
        </div>
      </RoleProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes";
import { AuthProvider, SseProvider } from "@/context";
import { Navbar, AppToastContainer } from "@/components";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SseProvider>
          <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <AppRoutes />
            <AppToastContainer />
          </div>
        </SseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

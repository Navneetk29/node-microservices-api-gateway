import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/homePage";
import ServiceInstances from "./pages/instancePage";
import Navbar from "./component/navbar";
import RecentData from "./pages/recentData";
import LiveData from "./pages/liveData";
import Footer from "./component/footer";
import WelcomeScreen from "./pages/welcomePage";

function AppLayout() {
  const location = useLocation();
  const isWelcomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      

      {!isWelcomePage && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/home" element={<Home />} />
          <Route path="/recent" element={<RecentData />} />
          <Route path="/live" element={<LiveData />} />
          <Route path="/home/service/:serviceName/instances" element={<ServiceInstances />} />
        </Routes>
      </main>

     
      {!isWelcomePage && <Footer />}

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
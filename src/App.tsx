import { lazy, Suspense, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Community from "./screens/Community";
import DevBlog from "./screens/DevBlog";
import Footer from "./screens/Footer";
import Landing from "./screens/Landing";
import Navbar from "./screens/Navbar";
import Servers from "./screens/Servers";
import Team from "./screens/Team";
import StructuredData from "./components/StructuredData";
import { AuthProvider } from "./auth/AuthProvider";

const Credits = lazy(() => import("./page/Credits"));
const Login = lazy(() => import("./page/Login"));
const Accounts = lazy(() => import("./page/Accounts"));

function App() {
  const homeRef = useRef(null);
  const devblogRef = useRef(null);
  const communityRef = useRef(null);
  const supportRef = useRef(null);
  const creditsRef = useRef(null);

  const refs = {
    home: homeRef,
    devblog: devblogRef,
    community: communityRef,
    support: supportRef,
    credits: creditsRef,
  };

  const MainContent = () => (
    <>
      <div ref={homeRef}>
        <Landing />
      </div>
      <div ref={devblogRef}>
        <DevBlog />
      </div>
      <div ref={communityRef}>
        <Community />
      </div>
      <div ref={supportRef}>
        <Servers />
      </div>
      <div ref={creditsRef}>
        <Team />
      </div>
    </>
  );

  return (
    <Router>
      <AuthProvider>
        <StructuredData />
        <Navbar refs={refs} />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/login" element={<Login />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/account" element={<Navigate to="/accounts" replace />} />
            {/* Catch /Game and redirect */}
            <Route path="/Game/*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;

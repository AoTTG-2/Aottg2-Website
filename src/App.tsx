import { useRef } from "react";
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
import Credits from "./page/Credits"; // New Credits component

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
      <Navbar refs={refs} />
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/credits" element={<Credits />} />
        {/* Catch /Game and redirect */}
        <Route path="/Game/*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

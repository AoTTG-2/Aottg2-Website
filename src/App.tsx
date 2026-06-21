import { lazy, Suspense, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
  useLocation,
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
import { NAVBAR_OFFSET_CLASS, NAVBAR_SCROLL_MARGIN_CLASS } from "./data/layout";
import { AccountsTheme } from "./page/Auth/AccountsTheme";
import { AuthNavbar } from "./page/Auth/AuthNavbar";

const Credits = lazy(() => import("./page/Credits"));
const Login = lazy(() => import("./page/Login"));
const Register = lazy(() => import("./page/Register"));
const Verify = lazy(() => import("./page/Verify"));
const ResendVerification = lazy(() => import("./page/ResendVerification"));
const ForgotPassword = lazy(() => import("./page/ForgotPassword"));
const ResetPassword = lazy(() => import("./page/ResetPassword"));
const OAuthCallback = lazy(() => import("./page/OAuthCallback"));
const Accounts = lazy(() => import("./page/Accounts"));
const Admin = lazy(() => import("./page/Admin"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

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
      <div ref={homeRef} className={NAVBAR_SCROLL_MARGIN_CLASS}>
        <Landing />
      </div>
      <div ref={devblogRef} className={NAVBAR_SCROLL_MARGIN_CLASS}>
        <DevBlog />
      </div>
      <div ref={communityRef} className={NAVBAR_SCROLL_MARGIN_CLASS}>
        <Community />
      </div>
      <div ref={supportRef} className={NAVBAR_SCROLL_MARGIN_CLASS}>
        <Servers />
      </div>
      <div ref={creditsRef} className={NAVBAR_SCROLL_MARGIN_CLASS}>
        <Team />
      </div>
    </>
  );

  const LandingLayout = () => (
    <>
      <Navbar refs={refs} />
      <div className={NAVBAR_OFFSET_CLASS}>
        <Outlet />
      </div>
      <Footer />
    </>
  );

  const AccountsLayout = () => (
    <AccountsTheme>
      <AuthNavbar />
      <div className={NAVBAR_OFFSET_CLASS}>
        <Outlet />
      </div>
    </AccountsTheme>
  );

  const AdminLayout = () => (
    <AccountsTheme plain>
      <AuthNavbar />
      <div className={NAVBAR_OFFSET_CLASS}>
        <Outlet />
      </div>
    </AccountsTheme>
  );

  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <StructuredData />
        <Suspense fallback={null}>
          <Routes>
            <Route element={<LandingLayout />}>
              <Route path="/" element={<MainContent />} />
              <Route path="/credits" element={<Credits />} />
              {/* Catch /Game and redirect */}
              <Route path="/Game/*" element={<Navigate to="/" replace />} />
            </Route>
            <Route element={<AccountsLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/resend-verification" element={<ResendVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/account" element={<Navigate to="/accounts" replace />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;

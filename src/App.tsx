import { lazy, Suspense, useEffect, useRef, type RefObject } from "react";
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
const Logout = lazy(() => import("./page/Logout"));
const Register = lazy(() => import("./page/Register"));
const Verify = lazy(() => import("./page/Verify"));
const ResendVerification = lazy(() => import("./page/ResendVerification"));
const ForgotPassword = lazy(() => import("./page/ForgotPassword"));
const ResetPassword = lazy(() => import("./page/ResetPassword"));
const OAuthCallback = lazy(() => import("./page/OAuthCallback"));
const PatreonCallback = lazy(() => import("./page/PatreonCallback"));
const UnityAuthComplete = lazy(() => import("./page/UnityAuthComplete"));
const Accounts = lazy(() => import("./page/Accounts"));
const Profile = lazy(() => import("./page/Profile"));
const Admin = lazy(() => import("./page/Admin"));

type SectionRefs = Record<string, RefObject<HTMLDivElement>>;

const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/logout",
  "/register",
  "/verify",
  "/resend-verification",
  "/forgot-password",
  "/reset-password",
  "/oauth-callback",
  "/patreon-callback",
  "/unity-auth",
  "/accounts",
  "/account",
  "/profile",
];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTE_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function RouteSpinner({ themed = false }: { themed?: boolean }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
      <span
        className={`h-10 w-10 animate-spin rounded-full border-2 ${
          themed ? "border-muted border-t-primary" : "border-white/20 border-t-primary"
        }`}
        aria-hidden="true"
      />
      <span className={`font-primary text-xs uppercase tracking-[0.35em] ${themed ? "text-muted-foreground" : "text-white/70"}`}>
        Loading
      </span>
    </div>
  );
}

function RouteLoadingFallback({ refs }: { refs: SectionRefs }) {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute || isAuthRoute(pathname)) {
    return (
      <AccountsTheme plain={isAdminRoute}>
        <AuthNavbar />
        <div className={NAVBAR_OFFSET_CLASS}>
          <main className="relative z-10 flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 text-foreground">
            <RouteSpinner themed />
          </main>
        </div>
      </AccountsTheme>
    );
  }

  return (
    <>
      <Navbar refs={refs} />
      <div className={NAVBAR_OFFSET_CLASS}>
        <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950 px-4 text-white">
          <RouteSpinner />
        </main>
      </div>
    </>
  );
}

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
    <Router future={{ v7_startTransition: true }}>
      <AuthProvider>
        <ScrollToTop />
        <StructuredData />
        <Suspense fallback={<RouteLoadingFallback refs={refs} />}>
          <Routes>
            <Route element={<LandingLayout />}>
              <Route path="/" element={<MainContent />} />
              <Route path="/credits" element={<Credits />} />
              {/* Catch /Game and redirect */}
              <Route path="/Game/*" element={<Navigate to="/" replace />} />
            </Route>
            <Route element={<AccountsLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/resend-verification" element={<ResendVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/patreon-callback" element={<PatreonCallback />} />
              <Route path="/unity-auth/complete" element={<UnityAuthComplete />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/account" element={<Navigate to="/accounts" replace />} />
              <Route path="/profile" element={<Profile />} />
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

import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Connections from "./components/AuthContent/Connections";
import Create from "./components/AuthContent/Create";
import Feedback from "./components/AuthContent/Feedback";
import Home from "./components/AuthContent/Home";
import Library from "./components/AuthContent/Library";
import Settings from "./components/AuthContent/Settings";
import Layout from "./components/BaseContent/Layout";
import NoPage from "./components/BaseContent/NoPage";
import ProtectedRoute from "./components/BaseContent/ProtectedRoute";
import PageMessage from "./components/Common/PageMessage";
import Editor from "./components/EditCrossword/Editor";
import LandingPage from "./components/NonAuthContent/LandingPage";
import Solver from "./components/SolveCrossword/Solver";
import { useAuth } from "./context/auth";

function Landing() {
  const { status } = useAuth();
  if (status === "loading") return <PageMessage>Loading…</PageMessage>;
  if (status === "authenticated") return <Navigate to="/home" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route element={<ProtectedRoute />}>
            <Route path="home" element={<Home />} />
            <Route path="create" element={<Create />} />
            <Route path="library" element={<Library />} />
            <Route path="connections" element={<Connections />} />
            <Route path="feedback" element={<Feedback />} />
            {/* The Feedback page used to be called Contact. */}
            <Route path="contact" element={<Navigate to="/feedback" replace />} />
            <Route path="settings" element={<Settings />} />
            <Route path="solver/:gridId" element={<Solver />} />
            <Route path="editor/:gridId" element={<Editor />} />
          </Route>
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/BaseContent/Layout.tsx";
import LandingPage from "./components/NonAuthContent/LandingPage.tsx";
import Home from "./components/AuthContent/Home.tsx";
import Contact from "./components/AuthContent/Contact.tsx";
import Library from "./components/AuthContent/Library.tsx";
import Create from "./components/AuthContent/Create.tsx";
import NoPage from "./components/BaseContent/NoPage.tsx";
import Account from "./components/AuthContent/Account.tsx";
import Solver from "./components/SolveCrossword/Solver.tsx";
// import useAuth from "./context/AuthContext";

function App() {
  const isAuthenticated: boolean = true; // Should be gloabl user

  return (
    <BrowserRouter>
      <Layout isAuthenticated={isAuthenticated}>
        <Routes>
          <Route index element={isAuthenticated ? <Home /> : <LandingPage />} />
          <Route
            path="create"
            element={isAuthenticated ? <Create /> : <Navigate to="/" />}
          />
          <Route
            path="library"
            element={isAuthenticated ? <Library /> : <Navigate to="/" />}
          />
          <Route
            path="contact"
            element={isAuthenticated ? <Contact /> : <Navigate to="/" />}
          />
          <Route
            path="account"
            element={isAuthenticated ? <Account /> : <Navigate to="/" />}
          />
          <Route
            path="solver"
            element={isAuthenticated ? <Solver /> : <Navigate to="/" />}
          />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

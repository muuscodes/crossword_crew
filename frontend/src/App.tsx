import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/BaseContent/Layout.tsx";
import LandingPage from "./components/NonAuthContent/LandingPage.tsx";
import Home from "./components/AuthContent/Home.tsx";
import Contact from "./components/AuthContent/Contact.tsx";
import Library from "./components/AuthContent/Library.tsx";
import Create from "./components/AuthContent/Create.tsx";
import NoPage from "./components/BaseContent/NoPage.tsx";
import Solver from "./components/SolveCrossword/Solver.tsx";
import Editor from "./components/EditCrossword/Editor.tsx";
import { useAuth } from "./context/AuthContext";

function App() {
  const { globalUser } = useAuth();
  console.log(`App: ${JSON.stringify(globalUser, null, 2)}`);

  const isAuthenticated = true;
  // const isAuthenticated = globalUser.username ? true : false;

  return (
    <BrowserRouter>
      <Layout isAuthenticated={isAuthenticated}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <LandingPage />
            }
          />
          <Route
            path="/home"
            element={isAuthenticated ? <Home /> : <Navigate to="/" />}
          />
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
            path="solver/:gridId"
            element={isAuthenticated ? <Solver /> : <Navigate to="/" />}
          />
          <Route
            path="editor/:gridId"
            element={isAuthenticated ? <Editor /> : <Navigate to="/" />}
          />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

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
  const { isAuthenticated } = useAuth();
  // console.log(`App user: ${JSON.stringify(globalUser, null, 2)}`);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              !isAuthenticated ? <LandingPage /> : <Navigate to="/home" />
            }
          />
          <Route path="/home" element={<Home />} />
          <Route path="create" element={<Create />} />
          <Route path="library" element={<Library />} />
          <Route path="contact" element={<Contact />} />
          <Route path="solver/:gridId" element={<Solver />} />
          <Route path="editor/:gridId" element={<Editor />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

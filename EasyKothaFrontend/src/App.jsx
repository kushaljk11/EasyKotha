import "./App.css";
import Register from "./pages/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

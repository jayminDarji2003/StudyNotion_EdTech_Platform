import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import VerifyCode from "./pages/auth/VerifyCode";
import ResetPasswordEmail from "./pages/auth/ResetPasswordEmail";
import ResendResetPasswordEmail from "./pages/auth/ResendResetPasswordEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetPasswordCompleted from "./pages/auth/ResetPasswordCompleted";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPasswordEmail />} />
        <Route
          path="/reset-password-resend-email"
          element={<ResendResetPasswordEmail />}
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/reset-password-completed"
          element={<ResetPasswordCompleted />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

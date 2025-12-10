import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      login(token);
      navigate("/dashboard", { replace: true });
    }
  }, []);

  return <div>Loading...</div>;
}

import { useState } from "react";
import { login, register } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage({ onLogin, mode = "login" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isRegister = mode === "register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      const result = await register({ email, password });
      if (result.error) {
        setError(result.error);
        return;
      }
    }

    const result = await login({ email, password });
    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      if (onLogin) onLogin(result.user);
      navigate("/expenses");
    }
  };

  return (
    <div className="page">
      <h2>{isRegister ? "Create Account" : "Login"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegister ? "Create Account" : "Login"}</button>
      </form>
      <p style={{ marginTop: "12px" }}>
        {isRegister ? (
          <>Already have an account? <Link to="/login">Login</Link></>
        ) : (
          <>Don\'t have an account? <Link to="/register">Create Account</Link></>
        )}
      </p>
    </div>
  );
}
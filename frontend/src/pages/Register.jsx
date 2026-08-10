import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ username, email, password, role, shop_name: shopName });
      navigate(role === "seller" ? "/seller" : "/");
    } catch (err) {
      const data = err.response?.data;
      const message = data ? Object.values(data).flat().join(" ") : "Не получилось зарегистрироваться";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Начнём" subtitle="Создай аккаунт покупателя или продавца">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Я хочу</label>
          <div className="role-picker">
            <button
              type="button"
              className={`role-option ${role === "buyer" ? "active" : ""}`}
              onClick={() => setRole("buyer")}
            >
              🛍️ Покупать
            </button>
            <button
              type="button"
              className={`role-option ${role === "seller" ? "active" : ""}`}
              onClick={() => setRole("seller")}
            >
              🏷️ Продавать
            </button>
          </div>
        </div>

        <div className="field">
          <label>Логин</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="my_username"
            required
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        {role === "seller" && (
          <div className="field">
            <label>Название магазина</label>
            <input
              className="input"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Мой шоурум"
              required
            />
          </div>
        )}
        <div className="field">
          <label>Пароль</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 8 символов"
            minLength={8}
            required
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? "Создаём..." : "Зарегистрироваться"}
        </button>
      </form>
      <p className="auth-switch">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </AuthLayout>
  );
}

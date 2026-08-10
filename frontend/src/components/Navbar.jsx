import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { isAuthenticated, isSeller, user, logout } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          🛍️ Pale &amp; Pink
        </Link>

        <div className="navbar-actions">
          {isAuthenticated && isSeller && (
            <>
              <Link to="/seller" className="nav-link">
                Мои товары
              </Link>
              <Link to="/seller/sales" className="nav-link">
                Продажи
              </Link>
            </>
          )}

          {isAuthenticated && !isSeller && (
            <>
              <Link to="/wishlist" className="nav-link">
                ♡ Избранное
              </Link>
              <Link to="/orders" className="nav-link">
                Заказы
              </Link>
              <Link to="/cart" className="nav-link cart-link">
                🛒 Корзина
                {itemsCount > 0 && <span className="cart-badge">{itemsCount}</span>}
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/"); }}>
              Выйти ({user?.username})
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Войти
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CATEGORY_LABELS = {
  tops: "Футболки и топы",
  dresses: "Платья",
  outerwear: "Верхняя одежда",
  bottoms: "Брюки и джинсы",
  shoes: "Обувь",
  accessories: "Аксессуары",
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [added, setAdded] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const { isAuthenticated, isSeller } = useAuth();
  const { addItem } = useCart();

  const load = async () => {
    const [productRes, reviewsRes] = await Promise.all([
      client.get(`/products/${id}/`),
      client.get(`/products/${id}/reviews/`),
    ]);
    setProduct(productRes.data);
    setReviews(reviewsRes.data.results);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    await addItem(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const toggleWishlist = async () => {
    if (product.is_wishlisted) {
      await client.delete(`/wishlist/by-product/${product.id}/`);
    } else {
      await client.post("/wishlist/", { product_id: product.id });
    }
    setProduct((p) => ({ ...p, is_wishlisted: !p.is_wishlisted }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    try {
      await client.post(`/products/${id}/reviews/`, { rating, text: reviewText });
      setReviewText("");
      load();
    } catch (err) {
      setReviewError(err.response?.data?.detail || "Не получилось отправить отзыв");
    }
  };

  if (!product) return <main className="container"><p className="empty-state">Загрузка...</p></main>;

  return (
    <main className="container detail-page">
      <Link to="/" className="back-link">
        ← В каталог
      </Link>

      <div className="product-detail-grid">
        <div className="product-detail-image-wrap card">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="product-detail-image" />
          ) : (
            <div className="product-card-placeholder" style={{ fontSize: 96 }}>👗</div>
          )}
        </div>

        <div className="product-detail-info">
          <span className="product-card-category">{CATEGORY_LABELS[product.category]}</span>
          <h1>{product.title}</h1>
          <p className="product-detail-seller">Продавец: {product.seller_name}</p>
          <div className="product-card-rating">
            <StarRating value={product.average_rating} size={16} />
            <span className="rating-count">{product.reviews_count} отзывов</span>
          </div>

          <p className="product-detail-price">{Number(product.price).toLocaleString("ru-RU")} ₽</p>

          <div className="product-detail-meta">
            <span className="badge badge-pink">Размер: {product.size === "ONE" ? "один размер" : product.size}</span>
            {product.color && <span className="badge badge-gray">Цвет: {product.color}</span>}
            <span className={`badge ${product.stock > 0 ? "badge-pink" : "badge-gray"}`}>
              {product.stock > 0 ? `В наличии: ${product.stock}` : "Нет в наличии"}
            </span>
          </div>

          {product.description && <p className="product-detail-description">{product.description}</p>}

          {!isSeller && (
            <div className="product-detail-actions">
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={!isAuthenticated || product.stock === 0}
              >
                {added ? "Добавлено ✓" : "В корзину"}
              </button>
              {isAuthenticated && (
                <button className="btn btn-outline" onClick={toggleWishlist}>
                  {product.is_wishlisted ? "♥ В избранном" : "♡ В избранное"}
                </button>
              )}
            </div>
          )}
          {!isAuthenticated && <p className="hint-text">Войдите, чтобы добавить в корзину</p>}
        </div>
      </div>

      <section className="reviews-section">
        <h2>Отзывы</h2>

        {isAuthenticated && !isSeller && (
          <form className="review-form card" onSubmit={submitReview}>
            <div className="field">
              <label>Оценка</label>
              <div className="rating-picker">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={n <= rating ? "star-btn active" : "star-btn"}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <textarea
                className="input"
                rows={3}
                placeholder="Поделись впечатлением о товаре..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
            {reviewError && <p className="form-error">{reviewError}</p>}
            <button className="btn btn-primary btn-sm" type="submit">
              Оставить отзыв
            </button>
          </form>
        )}

        {reviews.length === 0 && <p className="empty-state">Пока нет отзывов</p>}

        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-item card">
              <div className="review-item-header">
                <strong>{review.username}</strong>
                <StarRating value={review.rating} />
              </div>
              {review.text && <p>{review.text}</p>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

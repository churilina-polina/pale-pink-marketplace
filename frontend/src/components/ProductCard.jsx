import { Link } from "react-router-dom";
import StarRating from "./StarRating";

const CATEGORY_LABELS = {
  tops: "Футболки и топы",
  dresses: "Платья",
  outerwear: "Верхняя одежда",
  bottoms: "Брюки и джинсы",
  shoes: "Обувь",
  accessories: "Аксессуары",
};

export default function ProductCard({ product, onToggleWishlist, showWishlist = true }) {
  return (
    <div className="product-card card">
      <Link to={`/products/${product.id}`} className="product-card-image-wrap">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="product-card-image" />
        ) : (
          <div className="product-card-placeholder">👗</div>
        )}
        {showWishlist && (
          <button
            className={`wishlist-heart ${product.is_wishlisted ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist?.(product);
            }}
            aria-label="В избранное"
          >
            {product.is_wishlisted ? "♥" : "♡"}
          </button>
        )}
      </Link>
      <Link to={`/products/${product.id}`} className="product-card-body">
        <span className="product-card-category">{CATEGORY_LABELS[product.category]}</span>
        <span className="product-card-title">{product.title}</span>
        <span className="product-card-seller">{product.seller_name}</span>
        <div className="product-card-rating">
          <StarRating value={product.average_rating} />
          {product.reviews_count > 0 && (
            <span className="rating-count">({product.reviews_count})</span>
          )}
        </div>
        <span className="product-card-price">{Number(product.price).toLocaleString("ru-RU")} ₽</span>
      </Link>
    </div>
  );
}

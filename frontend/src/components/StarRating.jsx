export default function StarRating({ value, size = 14 }) {
  const rounded = Math.round(value);
  return (
    <span className="star-rating" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "star filled" : "star"}>
          ★
        </span>
      ))}
    </span>
  );
}

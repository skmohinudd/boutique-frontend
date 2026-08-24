import ProductCard from "./ProductCard";
export default function ProductGrid({ products }) {
  if (!products?.length)
    return (
      <div className="empty-inline">
        <h2>No matching products</h2>
        <p>Try a different search or category.</p>
      </div>
    );
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id || product.productId || product.sku}
          product={product}
        />
      ))}
    </div>
  );
}

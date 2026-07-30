import ProductCard from "./ProductCard";

function ProductGrid({ products }) {
  if (!products?.length) {
    return (
      <div className="empty-state">
        <h2>No products available</h2>
        <p>
          The Product Service returned an empty product list.
        </p>
      </div>
    );
  }

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

export default ProductGrid;
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";

import { environment } from "../../config/environment";
import { useCartStore } from "../../features/cart/cartStore";
import {
  getStockInformation,
} from "../../features/inventory/inventoryService";
import { useInventory } from "../../features/inventory/useInventory";

export function formatPrice(price, currency) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "Price unavailable";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency:
        currency || environment.commerce.defaultCurrency,
    }).format(numericPrice);
  } catch {
    return `${numericPrice.toFixed(2)} ${currency || environment.commerce.defaultCurrency
      }`;
  }
}

export const PRODUCT_PLACEHOLDER_IMAGE =
  "/static/img/products/product-placeholder.svg";

export function resolveImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") {
    return PRODUCT_PLACEHOLDER_IMAGE;
  }

  const normalizedImageUrl = imageUrl.trim();

  if (!normalizedImageUrl) {
    return PRODUCT_PLACEHOLDER_IMAGE;
  }

  if (
    normalizedImageUrl.startsWith("http://") ||
    normalizedImageUrl.startsWith("https://") ||
    normalizedImageUrl.startsWith("/")
  ) {
    return normalizedImageUrl;
  }

  return `/static/img/products/${normalizedImageUrl}`;

}

function ProductCard({ product }) {
  const productId = product.id || product.productId;

  const addItem = useCartStore((state) => state.addItem);

  const {
    data: inventory,
    isLoading: inventoryLoading,
    isError: inventoryError,
  } = useInventory(productId);

  const stock = getStockInformation(inventory);

  const stockLabel = inventoryLoading
    ? "Checking stock..."
    : inventoryError
      ? "Stock unavailable"
      : stock.label;

  const imageUrl = resolveImageUrl(
    product.imageUrl || product.image,
  );

  function handleAddToCart() {
    addItem(product, stock.quantity);
    toast.success(`${product.name} added to cart`);
  }

  return (
    <article className="product-card">
      <Link
        className="product-card__image-link"
        to={`/product/${encodeURIComponent(productId)}`}
        aria-label={`View ${product.name}`}
      >
        <img
          className="product-card__image"
          src={imageUrl}
          alt={product.name || "Boutique product"}
          loading="lazy"
          onError={(event) => {
            const image = event.currentTarget;

            if (!image.src.endsWith("/product-placeholder.svg")) {
              image.src = PRODUCT_PLACEHOLDER_IMAGE;
            }
          }}
        />
      </Link>

      <div className="product-card__body">
        {product.category && (
          <p className="product-card__category">
            {product.category}
          </p>
        )}

        <h2 className="product-card__title">
          <Link
            to={`/product/${encodeURIComponent(productId)}`}
          >
            {product.name}
          </Link>
        </h2>

        <p className="product-card__description">
          {product.description || "No description available."}
        </p>

        <div className="product-card__details">
          <strong className="product-card__price">
            {formatPrice(product.price, product.currency)}
          </strong>

          <span
            className={`product-card__stock ${stock.available
                ? "product-card__stock--available"
                : "product-card__stock--unavailable"
              }`}
          >
            {stockLabel}
          </span>
        </div>

        <button
          className="product-card__button"
          type="button"
          disabled={
            inventoryLoading ||
            inventoryError ||
            !stock.available
          }
          onClick={handleAddToCart}
        >
          <ShoppingCart size={18} aria-hidden="true" />
          Add to cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
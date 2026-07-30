import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
    formatPrice,
    PRODUCT_PLACEHOLDER_IMAGE,
    resolveImageUrl,
} from "../components/product/ProductCard";
import { useCartStore } from "../features/cart/cartStore";
import {
    getStockInformation,
} from "../features/inventory/inventoryService";
import { useInventory } from "../features/inventory/useInventory";
import { useProduct } from "../features/products/useProducts";

function ProductDetailsPage() {
    const { productId } = useParams();

    const addItem = useCartStore((state) => state.addItem);

    const {
        data: product,
        isLoading: productLoading,
        isError: productError,
        error: productErrorDetails,
    } = useProduct(productId);

    const {
        data: inventory,
        isLoading: inventoryLoading,
        isError: inventoryError,
    } = useInventory(productId);

    if (productLoading) {
        return (
            <main className="page-container status-page">
                <p>Loading product...</p>
            </main>
        );
    }

    if (productError || !product) {
        return (
            <main className="page-container status-page">
                <h1>Product unavailable</h1>

                <p>
                    {productErrorDetails?.message ||
                        "The requested product could not be found."}
                </p>

                <Link to="/">Return to products</Link>
            </main>
        );
    }

    const stock = getStockInformation(inventory);

    function handleAddToCart() {
        addItem(product, stock.quantity);
        toast.success(`${product.name} added to cart`);
    }

    return (
        <main className="page-container product-details-page">
            <Link className="back-link" to="/">
                <ArrowLeft size={18} />
                Back to products
            </Link>

            <section className="product-details">
                <div className="product-details__image-wrapper">
                    <img
                        className="product-details__image"
                        src={resolveImageUrl(
                            product.imageUrl || product.image,
                        )}
                        alt={product.name}
                        onError={(event) => {
                            const image = event.currentTarget;

                            if (!image.src.endsWith("/product-placeholder.svg")) {
                                image.src = PRODUCT_PLACEHOLDER_IMAGE;
                            }
                        }}
                    />
                </div>

                <div className="product-details__content">
                    {product.category && (
                        <p className="product-details__category">
                            {product.category}
                        </p>
                    )}

                    <h1>{product.name}</h1>

                    <p className="product-details__description">
                        {product.description ||
                            "No product description is available."}
                    </p>

                    <strong className="product-details__price">
                        {formatPrice(product.price, product.currency)}
                    </strong>

                    <p
                        className={
                            stock.available
                                ? "product-details__stock product-details__stock--available"
                                : "product-details__stock product-details__stock--unavailable"
                        }
                    >
                        {inventoryLoading
                            ? "Checking stock..."
                            : inventoryError
                                ? "Unable to retrieve stock"
                                : stock.label}
                    </p>

                    <button
                        className="product-details__button"
                        type="button"
                        disabled={
                            inventoryLoading ||
                            inventoryError ||
                            !stock.available
                        }
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart size={20} />
                        Add to cart
                    </button>
                </div>
            </section>
        </main>
    );
}

export default ProductDetailsPage;
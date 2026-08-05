import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
    formatPrice,
    PRODUCT_PLACEHOLDER_IMAGE,
    resolveImageUrl,
} from "../components/product/ProductCard";
import { environment } from "../config/environment";
import {
    getCartTotal,
    useCartStore,
} from "../features/cart/cartStore";
import {
    synchronizeBackendCart,
} from "../api/cartApi";
import {
    createCheckout,
} from "../api/checkoutApi";

function CartPage() {
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutResult, setCheckoutResult] = useState(null);

    const items = useCartStore((state) => state.items);
    const increaseQuantity = useCartStore(
        (state) => state.increaseQuantity,
    );
    const decreaseQuantity = useCartStore(
        (state) => state.decreaseQuantity,
    );
    const removeItem = useCartStore(
        (state) => state.removeItem,
    );
    const clearCart = useCartStore(
        (state) => state.clearCart,
    );

    const total = getCartTotal(items);
    const currency = items[0]?.currency || "USD";

    async function handleCheckout() {
        if (!items.length || isCheckingOut) {
            return;
        }

        setIsCheckingOut(true);
        setCheckoutResult(null);

        try {
            await synchronizeBackendCart(
                environment.development.userId,
                items,
            );

            const result = await createCheckout({
                userId: environment.development.userId,
                cardLast4:
                    environment.development.cardLast4,
            });

            setCheckoutResult(result);

            if (result.status === "CONFIRMED") {
                clearCart();
                toast.success(
                    `Order ${result.orderId} confirmed`,
                );
            } else {
                toast.error(
                    `Checkout failed: ${result.status}`,
                );
            }
        } catch (error) {
            const detail =
                error.data?.detail ||
                error.data?.message ||
                error.message ||
                "Checkout failed.";

            toast.error(detail);
        } finally {
            setIsCheckingOut(false);
        }
    }

    if (!items.length && !checkoutResult) {
        return (
            <main className="page-container cart-page">
                <div className="empty-state">
                    <h1>Your cart is empty</h1>

                    <p>
                        Add products from the catalogue to begin shopping.
                    </p>

                    <Link className="primary-link" to="/">
                        Browse products
                    </Link>
                </div>
            </main>
        );
    }

    if (checkoutResult?.status === "CONFIRMED") {
        return (
            <main className="page-container cart-page">
                <div className="empty-state">
                    <h1>Order confirmed</h1>

                    <p>
                        Order ID: {checkoutResult.orderId}
                    </p>

                    <p>
                        Payment ID: {checkoutResult.paymentId}
                    </p>

                    <Link className="primary-link" to="/">
                        Continue shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="page-container cart-page">
            <div className="cart-page__heading">
                <div>
                    <p className="section-heading__eyebrow">
                        Shopping cart
                    </p>

                    <h1>Your items</h1>
                </div>

                <button
                    className="cart-page__clear"
                    type="button"
                    disabled={isCheckingOut}
                    onClick={clearCart}
                >
                    Clear cart
                </button>
            </div>

            <div className="cart-layout">
                <section className="cart-items">
                    {items.map((item) => (
                        <article
                            className="cart-item"
                            key={item.productId}
                        >
                            <img
                                src={resolveImageUrl(item.imageUrl)}
                                alt={item.name}
                                onError={(event) => {
                                    const image = event.currentTarget;

                                    if (!image.src.endsWith("/product-placeholder.svg")) {
                                        image.src = PRODUCT_PLACEHOLDER_IMAGE;
                                    }
                                }}
                            />

                            <div className="cart-item__content">
                                <Link
                                    className="cart-item__name"
                                    to={`/product/${encodeURIComponent(
                                        item.productId,
                                    )}`}
                                >
                                    {item.name}
                                </Link>

                                <p>
                                    {formatPrice(item.price, item.currency)}
                                </p>

                                <div className="cart-item__controls">
                                    <button
                                        type="button"
                                        disabled={isCheckingOut}
                                        aria-label={`Decrease ${item.name}`}
                                        onClick={() =>
                                            decreaseQuantity(item.productId)
                                        }
                                    >
                                        <Minus size={16} />
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        type="button"
                                        aria-label={`Increase ${item.name}`}
                                        disabled={
                                            isCheckingOut ||
                                            item.quantity >=
                                            item.availableQuantity
                                        }
                                        onClick={() =>
                                            increaseQuantity(item.productId)
                                        }
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="cart-item__aside">
                                <strong>
                                    {formatPrice(
                                        item.price * item.quantity,
                                        item.currency,
                                    )}
                                </strong>

                                <button
                                    className="cart-item__remove"
                                    type="button"
                                    disabled={isCheckingOut}
                                    aria-label={`Remove ${item.name}`}
                                    onClick={() =>
                                        removeItem(item.productId)
                                    }
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </article>
                    ))}
                </section>

                <aside className="cart-summary">
                    <h2>Order summary</h2>

                    <div className="cart-summary__row">
                        <span>Subtotal</span>

                        <strong>
                            {formatPrice(total, currency)}
                        </strong>
                    </div>

                    <p>
                        Local development checkout uses the configured
                        demo user and a simulated payment authorization.
                    </p>

                    <button
                        type="button"
                        disabled={isCheckingOut || !items.length}
                        onClick={handleCheckout}
                    >
                        {isCheckingOut
                            ? "Processing checkout..."
                            : "Checkout"}
                    </button>
                </aside>
            </div>
        </main>
    );
}

export default CartPage;

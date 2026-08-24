import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import ProductGrid from "../components/product/ProductGrid";
import {
  useProductCategories,
  useProducts,
} from "../features/products/useProducts";
const SIZE = 20;
function Skeleton() {
  return (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="product-card skeleton-card" key={i}>
          <div className="skeleton skeleton-image" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(searchTerm.trim());
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(id);
  }, [searchTerm]);
  const { data, isLoading, isError, error, refetch, isFetching } = useProducts({
    q: query,
    category: selectedCategory,
    page: currentPage,
    size: SIZE,
  });
  const { data: categoriesData } = useProductCategories();
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : Array.isArray(categoriesData?.content)
      ? categoriesData.content
      : Array.isArray(categoriesData?.categories)
        ? categoriesData.categories
        : [];
  const products = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 1);
  const total = data?.totalElements || 0;
  return (
    <main>
      <section className="home-hero">
        <div className="page-container home-hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">THE NEW EVERYDAY</span>
            <h1>Find something you’ll love using every day.</h1>
            <p>
              Curated essentials for home, style and life — selected to make
              everyday moments feel a little better.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#products">
                Shop the collection <ArrowRight size={18} />
              </a>
              <Link className="text-button" to="/signup">
                Create an account
              </Link>
            </div>
            <div className="hero-proof">
              <span>
                <BadgeCheck size={18} /> Quality selected
              </span>
              <span>
                <Truck size={18} /> Reliable delivery
              </span>
            </div>
          </div>
          <div className="hero-media">
            <img
              src="/static/images/HeroBannerImage2.png"
              alt="Curated Boutique collection"
            />
            <div className="floating-card">
              <small>EDITOR'S PICK</small>
              <strong>Made for everyday living</strong>
              <a href="#products">Explore now →</a>
            </div>
          </div>
        </div>
      </section>
      <section className="benefit-bar">
        <div className="page-container">
          <span>
            <Truck size={22} />
            <b>Delivery you can trust</b>
            <small>Track every confirmed order</small>
          </span>
          <span>
            <ShieldCheck size={22} />
            <b>Secure checkout</b>
            <small>Your account stays protected</small>
          </span>
          <span>
            <RefreshCw size={22} />
            <b>Simple shopping</b>
            <small>Cart and checkout stay in sync</small>
          </span>
        </div>
      </section>
      <section className="collection-story" id="collections">
        <div className="page-container collection-grid">
          <img
            src="/static/images/folded-clothes-on-white-chair-wide.jpg"
            alt="Boutique lifestyle collection"
          />
          <div>
            <span className="eyebrow">THE BOUTIQUE EDIT</span>
            <h2>Useful, beautiful, uncomplicated.</h2>
            <p>
              We keep the experience focused on what matters: discovering
              products, understanding availability, and checking out without
              unnecessary clutter.
            </p>
            <a href="#products" className="text-button">
              Browse today’s selection <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>
      <section className="products-section" id="products">
        <div className="page-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SHOP THE COLLECTION</span>
              <h2>Featured products</h2>
              <p>Browse the latest available items.</p>
            </div>
            {!isLoading && !isError && (
              <span className="product-count">{total} items</span>
            )}
          </div>
          <div className="product-filters">
            <label>
              <span>Search</span>
              <input
                type="search"
                placeholder="Search products…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
            <label>
              <span>Category</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(0);
                }}
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {isLoading && <Skeleton />}
          {isError && (
            <div className="error-state">
              <h2>We couldn’t load the collection</h2>
              <p>{error?.message}</p>
              <button
                className="secondary-button"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                Try again
              </button>
            </div>
          )}
          {!isLoading && !isError && <ProductGrid products={products} />}{" "}
          {!isLoading && !isError && products.length > 0 && (
            <nav className="pagination">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </section>
      <section className="account-banner">
        <div className="page-container">
          <div>
            <span className="eyebrow">YOUR BOUTIQUE</span>
            <h2>Save time on your next visit.</h2>
            <p>
              Sign in to continue checkout, manage your profile and keep your
              orders together.
            </p>
          </div>
          <Link className="light-button" to="/signup">
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}

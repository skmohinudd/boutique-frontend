import { useEffect, useMemo, useState } from "react";

import ProductGrid from "../components/product/ProductGrid";
import { useProducts } from "../features/products/useProducts";

const PRODUCTS_PER_PAGE = 20;

function ProductGridSkeleton() {
  return (
    <div className="product-grid" aria-label="Loading products">
      {Array.from({ length: PRODUCTS_PER_PAGE }).map(
        (_, index) => (
          <div
            className="product-card product-card--skeleton"
            key={index}
          >
            <div className="skeleton skeleton--image" />

            <div className="product-card__body">
              <div className="skeleton skeleton--small" />
              <div className="skeleton skeleton--title" />
              <div className="skeleton skeleton--text" />
              <div className="skeleton skeleton--text-short" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProducts();

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products
        .map((product) => product.category)
        .filter(Boolean),
    );

    return ["all", ...Array.from(uniqueCategories).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category === selectedCategory;

      const searchableText = [
        product.name,
        product.description,
        product.category,
        product.sku,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex =
      (currentPage - 1) * PRODUCTS_PER_PAGE;

    return filteredProducts.slice(
      startIndex,
      startIndex + PRODUCTS_PER_PAGE,
    );
  }, [filteredProducts, currentPage]);

  const firstDisplayedProduct =
    filteredProducts.length === 0
      ? 0
      : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;

  const lastDisplayedProduct = Math.min(
    currentPage * PRODUCTS_PER_PAGE,
    filteredProducts.length,
  );

  function changePage(pageNumber) {
    setCurrentPage(pageNumber);

    document
      .getElementById("products")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <main>
      <section className="hero">
        <div className="page-container hero__content">
          <div className="hero__text">
            <p className="hero__eyebrow">
              Cloud-native shopping experience
            </p>

            <h1>Welcome to Boutique</h1>

            <p>
              Discover products served by our Spring Boot
              microservices with live stock information from the
              Inventory Service.
            </p>

            <a className="hero__button" href="#products">
              Shop products
            </a>
          </div>

          <div className="hero__visual">
            <img
              src="/static/icons/Hipster_HeroLogo.svg"
              alt="Boutique"
            />
          </div>
        </div>
      </section>

      <section
        className="products-section"
        id="products"
        aria-labelledby="products-heading"
      >
        <div className="page-container">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">
                Product catalogue
              </p>

              <h2 id="products-heading">
                Featured products
              </h2>
            </div>

            {!isLoading && !isError && (
              <span className="section-heading__count">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "product"
                  : "products"}
              </span>
            )}
          </div>

          {!isLoading && !isError && (
            <div className="product-filters">
              <label className="product-filters__field">
                <span>Search</span>

                <input
                  type="search"
                  placeholder="Search products, categories or SKU..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </label>

              <label className="product-filters__field">
                <span>Category</span>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all"
                        ? "All categories"
                        : category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {isLoading && <ProductGridSkeleton />}

          {isError && (
            <div className="error-state" role="alert">
              <h2>Unable to load products</h2>

              <p>
                {error?.message ||
                  "The Product Service could not be reached."}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? "Retrying..." : "Try again"}
              </button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            filteredProducts.length === 0 && (
              <div className="empty-state">
                <h2>No matching products</h2>

                <p>
                  Try another search term or select a different
                  category.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            filteredProducts.length > 0 && (
              <>
                <p className="pagination-summary">
                  Showing {firstDisplayedProduct}–
                  {lastDisplayedProduct} of{" "}
                  {filteredProducts.length} products
                </p>

                <ProductGrid
                  products={paginatedProducts}
                />

                <nav
                  className="pagination"
                  aria-label="Product pages"
                >
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      changePage(currentPage - 1)
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      changePage(currentPage + 1)
                    }
                  >
                    Next
                  </button>
                </nav>
              </>
            )}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
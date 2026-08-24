import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <main className="center-state not-found">
      <span>404</span>
      <h1>That page isn’t here.</h1>
      <p>The link may be old, or the page may have moved.</p>
      <Link className="primary-button" to="/">
        Back to Boutique
      </Link>
    </main>
  );
}

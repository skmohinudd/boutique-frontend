import { Link } from "react-router-dom";
export default function ProfilePage() {
  return (
    <main className="page-container">
      <h1>Profile</h1>
      <p>This route is prepared for the corresponding backend capability.</p>
      <Link to="/">Return to catalogue</Link>
    </main>
  );
}

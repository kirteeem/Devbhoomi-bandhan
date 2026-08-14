import { Link } from "react-router-dom";

export const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
    <div className="mb-4 text-6xl">🏔️</div>
    <h1 className="font-display text-3xl font-extrabold">Page not found</h1>
    <p className="mt-2 mb-8 text-muted">This path doesn't exist — let's get you back home.</p>
    <Link to="/" className="btn-primary">Back to Home</Link>
  </div>
);

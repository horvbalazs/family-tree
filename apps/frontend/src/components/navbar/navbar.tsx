import { Link } from '@tanstack/react-router';

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6 gap-6">
        <Link
          to="/"
          className="text-sm font-medium text-gray-700 transition-colors hover:text-black"
          activeProps={{
            className: 'text-blue-600',
          }}
        >
          Find a person
        </Link>
        <Link
          to="/add-person"
          className="text-sm font-medium text-gray-700 transition-colors hover:text-black"
          activeProps={{
            className: 'text-blue-600',
          }}
        >
          Add a person
        </Link>
      </div>
    </nav>
  );
}
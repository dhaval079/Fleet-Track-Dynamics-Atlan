import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const ErrorPage = () => {
  const location = useLocation();
  const message = location.state?.message || "An error occurred";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Oops!</h1>
      <p className="text-xl mb-8">{message}</p>
      <Link to="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Go Home
      </Link>
    </div>
  );
};

export default ErrorPage;
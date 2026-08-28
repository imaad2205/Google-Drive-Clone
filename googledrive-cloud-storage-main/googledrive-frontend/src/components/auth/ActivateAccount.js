import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ActivateAccount = () => {
  const [loading, setLoading] = useState(true);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useParams();
  const { activateAccount } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const activate = async () => {
      try {
        const result = await activateAccount(token);
        if (result.success) {
          setActivated(true);
        } else {
          setError(result.message || 'Activation failed');
        }
      } catch (err) {
        setError('Invalid or expired activation link');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      activate();
    } else {
      setError('Invalid activation link');
      setLoading(false);
    }
  }, [token, activateAccount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Activating your account...</p>
          </div>
        </div>
      </div>
    );
  }

  if (activated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Account Activated!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your account has been successfully activated. You can now sign in to your account.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Activation Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error || 'This activation link is invalid or has expired.'}
          </p>
          <div className="mt-6 space-y-3">
            <Link
              to="/register"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create New Account
            </Link>
            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;

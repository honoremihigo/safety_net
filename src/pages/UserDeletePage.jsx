import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { getUserById, deleteUser } from '../services/usersServices'; // Adjust path as needed

export default function DeleteAccountPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError('User ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userData = await getUserById(userId);
        setUser(userData);
        setUserEmail(userData.email);
      } catch (err) {
        setError(err.message || 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleDelete = () => {
    if (!userEmail.trim()) {
      setError('Please enter your email to confirm deletion.');
      return;
    }

    if (userEmail !== user?.email) {
      setError('Email does not match your account email.');
      return;
    }

    setError('');
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    setShowConfirm(false);
    setError('');

    try {
      await deleteUser(userId);
      // Redirect to success page or dashboard
      navigate('/success-account-deleted');
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-red-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:py-12 px-4 py-8 flex items-center md:block">
      <div className="max-w-2xl mx-auto w-full">
        {/* Warning Banner */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 md:p-6 mb-4 md:mb-8 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-500 mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-red-800 mb-1 md:mb-2">
                Danger Zone: Delete Account
              </h2>
              <p className="text-red-700 text-xs md:text-sm">
                User ID: <span className="font-mono font-semibold">{userId}</span>
              </p>
              {user && (
                <p className="text-red-700 text-xs md:text-sm mt-1">
                  Account: <span className="font-medium">{user.firstName} {user.lastName}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Warning Content - Hidden on Mobile */}
        <div className="hidden md:block bg-white shadow-md rounded-lg p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Before You Delete Your Account
          </h3>
          
          <div className="space-y-4 text-gray-700">
            <p className="font-semibold text-lg text-red-600">
              ⚠️ This action is permanent and cannot be undone!
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                What will happen when you delete your account:
              </h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>All your personal data will be permanently deleted</li>
                <li>Your profile and settings will be removed</li>
                <li>All your content and posts will be deleted</li>
                <li>You will lose access to all saved information</li>
                <li>Your username will become available for others</li>
                <li>Any active subscriptions will be cancelled</li>
                <li>This action cannot be reversed or recovered</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> If you're having issues with your account, 
                please consider contacting support before deleting. We're here to help!
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Form */}
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
            Confirm Account Deletion
          </h3>
          
          {/* Mobile-only compact warning */}
          <p className="md:hidden text-sm text-gray-600 mb-4">
            ⚠️ This will permanently delete all your data, posts, and settings. This action cannot be undone.
          </p>
          
          <div>
            <div className="mb-4 md:mb-6">
              <label 
                htmlFor="userEmail" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {window.innerWidth >= 768 
                  ? 'Please enter your email address to confirm deletion' 
                  : 'Enter your email to confirm'
                }
              </label>
              <input
                type="email"
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                  error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                }`}
                disabled={isLoading || deleteLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}



            {/* Show user's actual email for reference */}
            {user && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Account Email:</strong> <span className="font-mono">{user.email}</span>
                </p>
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={isLoading || deleteLoading || !user}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {deleteLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span className="hidden md:inline">Deleting Account...</span>
                  <span className="md:hidden">Deleting...</span>
                </>
              ) : (
                <>
                  <span className="hidden md:inline">Delete My Account Permanently</span>
                  <span className="md:hidden">Delete My Account</span>
                </>
              )}
            </button>

           
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Are you absolutely sure?</h3>
            <p className="text-sm text-gray-600 mb-6">
              {window.innerWidth >= 768 
                ? `This action cannot be undone! Account "${user?.firstname} ${user?.lastname}" will be permanently deleted.` 
                : 'This action cannot be undone!'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Yes, delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
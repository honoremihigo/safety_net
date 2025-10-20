import { CheckCircle } from 'lucide-react';

export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="rounded-full bg-green-100 p-3 md:p-4">
              <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            Account Deleted Successfully
          </h1>
          
          <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
            Your account has been permanently deleted. All your data has been removed from our servers.
          </p>

          {/* Additional Info - Desktop Only */}
          <div className="hidden md:block bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">What happens next:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your personal data has been permanently removed</li>
              <li>• Any active subscriptions have been cancelled</li>
              <li>• You will no longer receive emails from us</li>
              <li>• Your username is now available for others</li>
            </ul>
          </div>

          {/* Action Buttons */}
          {/* <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Go to Homepage
            </button>
            
            <button
              onClick={() => window.location.href = '/signup'}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Create New Account
            </button>
          </div> */}

          {/* Footer Note */}
          <p className="text-xs md:text-sm text-gray-500 mt-6 md:mt-8">
            Changed your mind? You can create a new account anytime, but your previous data cannot be recovered.
          </p>
        </div>

        {/* Support Link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Need help?{' '}
          <button 
            onClick={() => window.location.href = '/support'}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
}
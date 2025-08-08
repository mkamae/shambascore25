import React from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';

interface ApplicationStatusProps {
  creator: any;
  onBackToHome?: () => void;
}

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ creator, onBackToHome }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: CheckCircleIcon,
          title: 'Congratulations! Your store is now active.',
          description: 'You can now log in and start selling your products.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          buttonText: 'Go to Dashboard',
          buttonAction: () => window.location.href = '/dashboard'
        };
      case 'PENDING':
        return {
          icon: ClockIcon,
          title: 'Application Under Review',
          description: 'We\'re currently reviewing your application. This usually takes 24 hours.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          buttonText: 'Check Status Again',
          buttonAction: () => window.location.reload()
        };
      case 'REJECTED':
        return {
          icon: XCircleIcon,
          title: 'Application Not Approved',
          description: creator.rejection_reason || 'Unfortunately, your application was not approved at this time.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonText: 'Apply Again',
          buttonAction: () => window.location.href = '/apply'
        };
      default:
        return {
          icon: ClockIcon,
          title: 'Application Status Unknown',
          description: 'We couldn\'t determine the status of your application.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          buttonText: 'Contact Support',
          buttonAction: () => window.open('mailto:support@shop254.co.ke')
        };
    }
  };

  const statusConfig = getStatusConfig(creator.status);
  const StatusIcon = statusConfig.icon;

  const handleContactSupport = () => {
    const message = `Hi, I need help with my Shop254 application. My name is ${creator.name} and my application ID is ${creator.id}.`;
    const whatsappUrl = `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className={`bg-white rounded-2xl shadow-xl p-8 ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
          {/* Status Icon */}
          <div className="text-center mb-6">
            <div className={`mx-auto w-16 h-16 rounded-full ${statusConfig.bgColor} flex items-center justify-center mb-4`}>
              <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
            </div>
            <h1 className={`text-2xl font-bold ${statusConfig.color} mb-2`}>
              {statusConfig.title}
            </h1>
            <p className="text-gray-600">
              {statusConfig.description}
            </p>
          </div>

          {/* Application Details */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Application Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{creator.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Handle:</span>
                <span className="font-medium">{creator.handle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{creator.business_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${statusConfig.color}`}>
                  {creator.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={statusConfig.buttonAction}
              className={`w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-200`}
            >
              {statusConfig.buttonText}
            </button>

            {creator.status === 'PENDING' && (
              <button
                onClick={handleContactSupport}
                className="w-full bg-white text-teal-600 border-2 border-teal-600 py-3 px-4 rounded-lg font-semibold hover:bg-teal-50 transition-colors flex items-center justify-center space-x-2"
              >
                <WhatsappIcon className="h-5 w-5" />
                <span>Contact Support</span>
              </button>
            )}

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </button>
            )}
          </div>

          {/* Additional Info */}
          {creator.status === 'PENDING' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Our team reviews your business details</li>
                <li>• We verify your contact information</li>
                <li>• You'll receive an email/SMS with the decision</li>
                <li>• If approved, you can start selling immediately</li>
              </ul>
            </div>
          )}

          {creator.status === 'REJECTED' && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Need help?</h4>
              <p className="text-sm text-yellow-800">
                If you believe this was an error or have questions, please contact our support team. We're here to help!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

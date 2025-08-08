import React from 'react';
import { useCreators } from '../hooks/useDatabase';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

export const AdminDashboard: React.FC = () => {
  const { creators, loading, error, updateCreator } = useCreators();
  
  // Filter pending applications
  const pendingApplications = creators.filter(creator => creator.status === 'PENDING');

  const handleApprove = async (creatorId: string) => {
    try {
      await updateCreator(creatorId, { status: 'APPROVED' });
      alert('Creator approved successfully!');
    } catch (err) {
      console.error('Failed to approve creator:', err);
      alert('Failed to approve creator. Please try again.');
    }
  };

  const handleReject = async (creatorId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await updateCreator(creatorId, { 
          status: 'REJECTED',
          rejection_reason: reason
        });
        alert('Creator rejected successfully!');
      } catch (err) {
        console.error('Failed to reject creator:', err);
        alert('Failed to reject creator. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-md text-gray-600">Review and approve new creator applications.</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Applications ({pendingApplications.length})</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telephone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Details</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingApplications.length > 0 ? pendingApplications.map(app => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full" src={app.avatar_url} alt="" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{app.name}</div>
                                <div className="text-sm text-gray-500">{app.business_category}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.id_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.telephone_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.mpesa_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleApprove(app.id)} 
                        className="text-white bg-green-600 hover:bg-green-700 rounded-md px-3 py-1.5 inline-flex items-center text-xs"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(app.id)} 
                        className="text-white bg-red-600 hover:bg-red-700 rounded-md px-3 py-1.5 inline-flex items-center text-xs"
                      >
                         <XCircleIcon className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-500">No pending applications.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
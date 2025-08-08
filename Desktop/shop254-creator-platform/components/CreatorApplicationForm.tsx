import React, { useState } from 'react';
import { useCreators } from '../hooks/useDatabase';

interface CreatorApplicationFormProps {
  onSubmit?: (details: { name: string; idNumber: string; telephoneNumber: string; businessCategory: string; mpesaNumber: string; bio: string; instagramHandle: string; }) => void;
}

export const CreatorApplicationForm: React.FC<CreatorApplicationFormProps> = ({ onSubmit }) => {
  const { createCreator, loading, error } = useCreators();
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    telephoneNumber: '',
    businessCategory: 'Fashion & Apparel',
    mpesaNumber: '',
    bio: '',
    instagramHandle: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate a handle from the name
      const handle = '@' + formData.name.toLowerCase().replace(/\s+/g, '') + Math.random().toString(36).substr(2, 5);
      
      const creatorData = {
        name: formData.name,
        id_number: formData.idNumber,
        telephone_number: formData.telephoneNumber,
        handle: handle,
        avatar_url: `https://picsum.photos/seed/${formData.name}/100/100`,
        bio: formData.bio,
        mpesa_number: formData.mpesaNumber,
        business_category: formData.businessCategory,
        instagram_handle: formData.instagramHandle || undefined,
        status: 'PENDING' as const
      };

      const newCreator = await createCreator(creatorData);
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      // Reset form
      setFormData({
        name: '',
        idNumber: '',
        telephoneNumber: '',
        businessCategory: 'Fashion & Apparel',
        mpesaNumber: '',
        bio: '',
        instagramHandle: '',
      });
      
      alert('Application submitted successfully! We will review it within 24 hours.');
    } catch (err) {
      console.error('Failed to submit application:', err);
      alert('Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-900">Fungua Duka Lako Shop254</h1>
      <p className="mt-2 text-md text-gray-600">Complete the form below to apply for a storefront. Our team will review your application within 24 hours.</p>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" required placeholder="e.g. Aisha Juma" />
        </div>

        <div>
          <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">ID Number (National ID or Passport)</label>
          <input type="text" name="idNumber" id="idNumber" value={formData.idNumber} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" required placeholder="Your Kenyan National ID or Passport No." />
        </div>

        <div>
          <label htmlFor="telephoneNumber" className="block text-sm font-medium text-gray-700">Telephone Number</label>
          <input type="tel" name="telephoneNumber" id="telephoneNumber" value={formData.telephoneNumber} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" required placeholder="e.g. 0712345678" />
        </div>

        <div>
            <label htmlFor="businessCategory" className="block text-sm font-medium text-gray-700">Business Category</label>
            <select name="businessCategory" id="businessCategory" value={formData.businessCategory} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                <option>Fashion & Apparel</option>
                <option>Jewelry & Accessories</option>
                <option>Art & Collectibles</option>
                <option>Events & Entertainment</option>
                <option>Health & Beauty</option>
                <option>Services</option>
                <option>Other</option>
            </select>
        </div>

         <div>
          <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-700">Instagram Handle <span className="text-gray-500">(Optional)</span></label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">@</span>
            </div>
            <input type="text" name="instagramHandle" id="instagramHandle" value={formData.instagramHandle} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 pl-7 focus:border-teal-500 focus:ring-teal-500" placeholder="your_handle" />
          </div>
        </div>

        <div>
          <label htmlFor="mpesaNumber" className="block text-sm font-medium text-gray-700">M-Pesa Number (Personal or Till for Payouts)</label>
          <input type="text" name="mpesaNumber" id="mpesaNumber" value={formData.mpesaNumber} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" required placeholder="e.g. 0712345678 or 123456" />
        </div>

        <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Short Bio / Description</label>
            <textarea name="bio" id="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" placeholder="Tell customers what you're all about..."></textarea>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};
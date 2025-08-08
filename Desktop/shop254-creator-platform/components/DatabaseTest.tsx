import React from 'react';
import { useCreators, useProducts } from '../hooks/useDatabase';

export const DatabaseTest: React.FC = () => {
  const { creators, loading: creatorsLoading, error: creatorsError, createCreator } = useCreators();
  const { products, loading: productsLoading, error: productsError } = useProducts();

  const handleTestCreator = async () => {
    try {
      const testCreator = {
        name: 'Test Creator',
        id_number: 'TEST123456',
        telephone_number: '0712345678',
        handle: '@testcreator' + Math.random().toString(36).substr(2, 5),
        avatar_url: 'https://picsum.photos/seed/test/100/100',
        bio: 'This is a test creator for database verification',
        mpesa_number: '0712345678',
        business_category: 'Test Category',
        status: 'PENDING' as const
      };

      await createCreator(testCreator);
      alert('Test creator created successfully!');
    } catch (err) {
      console.error('Failed to create test creator:', err);
      alert('Failed to create test creator. Check console for details.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Database Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Creators</h3>
          {creatorsLoading ? (
            <p>Loading creators...</p>
          ) : creatorsError ? (
            <p className="text-red-600">Error: {creatorsError}</p>
          ) : (
            <div>
              <p>Total creators: {creators.length}</p>
              <ul className="list-disc list-inside">
                {creators.slice(0, 3).map(creator => (
                  <li key={creator.id}>
                    {creator.name} - {creator.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Products</h3>
          {productsLoading ? (
            <p>Loading products...</p>
          ) : productsError ? (
            <p className="text-red-600">Error: {productsError}</p>
          ) : (
            <div>
              <p>Total products: {products.length}</p>
              <ul className="list-disc list-inside">
                {products.slice(0, 3).map(product => (
                  <li key={product.id}>
                    {product.name} - ${product.price}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={handleTestCreator}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Test Creator
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MOCK_ANALYTICS } from '../constants';
import { Creator, Product, ProductType } from '../types';
import { AnalyticsCard } from './AnalyticsCard';
import { PlusIcon } from './icons/PlusIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { WalletIcon } from './icons/WalletIcon';
import { ShareIcon } from './icons/ShareIcon';
import { LinkIcon } from './icons/LinkIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { XIcon } from './icons/XIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ImageIcon } from './icons/ImageIcon';
import { XMarkIcon } from './icons/XMarkIcon';


interface CreatorDashboardProps {
  creator: Creator;
  products: Product[];
  addProduct: (product: Product) => void;
}

const ShareStoreWidget: React.FC<{ creator: Creator }> = ({ creator }) => {
    const [copied, setCopied] = useState(false);
    const storeUrl = `https://shop254.app/store/${creator.handle.substring(1)}`;
    const shareText = `Check out my shop "${creator.name}" on Shop254! Great finds await. 😊`;
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(storeUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const socialLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${storeUrl}`)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storeUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`,
        instagram: `https://www.instagram.com/${creator.instagramHandle}`
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="storeUrl" className="block text-sm font-medium text-gray-700">Your unique store link</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input type="text" id="storeUrl" value={storeUrl} readOnly className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 bg-gray-50 focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                        <button
                            onClick={copyToClipboard}
                            type="button"
                            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                            <LinkIcon className="h-5 w-5 text-gray-500" />
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                </div>
                 <div>
                    <p className="text-sm font-medium text-gray-700">Share directly to socials</p>
                    <div className="mt-2 flex space-x-2">
                        <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"><span className="sr-only">WhatsApp</span><WhatsappIcon className="h-5 w-5"/></a>
                        <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 text-white rounded-full hover:bg-black transition-colors"><span className="sr-only">X</span><XIcon className="h-5 w-5"/></a>
                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"><span className="sr-only">Facebook</span><FacebookIcon className="h-5 w-5"/></a>
                        {creator.instagramHandle && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"><span className="sr-only">Instagram</span><InstagramIcon className="h-5 w-5"/></a>}
                    </div>
                </div>
            </div>
        </div>
    )
}

const AddProductSection: React.FC<{ addProduct: (product: Product) => void }> = ({ addProduct }) => {
    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
    
    // Single Product State
    const [newProduct, setNewProduct] = useState({
        name: '', price: '', description: '', type: ProductType.PRODUCT, stock: '',
    });
    const [productImages, setProductImages] = useState<string[]>([]);

    // Bulk Upload State
    type BulkUploadStep = 'idle' | 'processing' | 'preview' | 'success';
    const [bulkUploadStep, setBulkUploadStep] = useState<BulkUploadStep>('idle');
    const [parsedProducts, setParsedProducts] = useState<Partial<Product>[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newImageUrls = files.map(() => `https://picsum.photos/seed/${Math.random()}/400/400`);
            setProductImages(prev => [...prev, ...newImageUrls].slice(0, 5)); // Limit to 5 images
        }
    };
    
    const removeImage = (index: number) => {
        setProductImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSingleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProduct.name && newProduct.price && productImages.length > 0) {
            const productToAdd: Product = {
                id: `new-${Date.now()}`,
                name: newProduct.name,
                price: parseFloat(newProduct.price),
                description: newProduct.description,
                type: newProduct.type,
                imageUrls: productImages,
                stock: newProduct.type === ProductType.PRODUCT ? parseInt(newProduct.stock) : undefined,
            };
            addProduct(productToAdd);
            setNewProduct({ name: '', price: '', description: '', type: ProductType.PRODUCT, stock: '' });
            setProductImages([]);
        }
    };

    const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setBulkUploadStep('processing');
            // Simulate CSV parsing
            setTimeout(() => {
                const mockParsed = [
                    { name: 'Bulk T-Shirt', price: 1200, description: 'From CSV', type: ProductType.PRODUCT, stock: 50 },
                    { name: 'Bulk Mug', price: 900, description: 'From CSV', type: ProductType.PRODUCT, stock: 100 },
                    { name: 'Bulk Event Pass', price: 2000, description: 'From CSV', type: ProductType.EVENT },
                ];
                setParsedProducts(mockParsed);
                setBulkUploadStep('preview');
            }, 2000);
        }
    }
    
    const confirmBulkUpload = () => {
        parsedProducts.forEach(p => {
            const productToAdd: Product = {
                id: `bulk-${Date.now()}-${Math.random()}`,
                name: p.name || 'Untitled',
                price: p.price || 0,
                description: p.description || '',
                type: p.type || ProductType.PRODUCT,
                imageUrls: [`https://picsum.photos/seed/${p.name || 'bulk'}/400/400`],
                stock: p.stock
            };
            addProduct(productToAdd);
        });
        setBulkUploadStep('success');
        setTimeout(() => {
            setBulkUploadStep('idle');
            setParsedProducts([]);
        }, 3000);
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ongeza Bidhaa / Add Products</h2>
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('single')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'single' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Moja Moja (Single)
                    </button>
                    <button onClick={() => setActiveTab('bulk')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'bulk' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Kwa Pamoja (Bulk)
                    </button>
                </nav>
            </div>

            {activeTab === 'single' && (
                <form onSubmit={handleSingleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Images (up to 5)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
                                        <span>Upload files</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} disabled={productImages.length >= 5} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                         {productImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {productImages.map((src, index) => (
                                    <div key={index} className="relative">
                                        <img src={src} alt={`Preview ${index + 1}`} className="h-20 w-20 object-cover rounded-md" />
                                        <button type="button" onClick={() => removeImage(index)} className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full p-0.5">
                                            <XMarkIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input type="text" name="name" id="name" value={newProduct.name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" required />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (Ksh)</label>
                        <input type="number" name="price" id="price" value={newProduct.price} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" id="description" value={newProduct.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"></textarea>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                        <select name="type" id="type" value={newProduct.type} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                            <option value={ProductType.PRODUCT}>Product</option>
                            <option value={ProductType.SERVICE}>Service</option>
                            <option value={ProductType.EVENT}>Event</option>
                        </select>
                    </div>
                    {newProduct.type === ProductType.PRODUCT && (
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                            <input type="number" name="stock" id="stock" value={newProduct.stock} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                    )}
                    <button type="submit" className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Product
                    </button>
                </form>
            )}

            {activeTab === 'bulk' && (
                <div className="space-y-6">
                    {bulkUploadStep === 'idle' && (
                         <div>
                            <p className="text-sm text-gray-600 mb-4">Follow these steps to upload multiple products quickly:</p>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                <li>Download our CSV template. <a href="/product-template.csv" download className="font-medium text-teal-600 hover:underline">Download here</a>.</li>
                                <li>Fill in your product details in the template.</li>
                                <li>Upload the completed file below.</li>
                            </ol>
                            <div className="mt-6">
                                <label htmlFor="bulk-upload" className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer">
                                    <UploadIcon className="h-5 w-5 mr-2"/>
                                    <span>Upload CSV File</span>
                                    <input type="file" id="bulk-upload" className="sr-only" accept=".csv" onChange={handleBulkUpload}/>
                                </label>
                            </div>
                        </div>
                    )}
                    {bulkUploadStep === 'processing' && (
                        <div className="text-center py-10">
                            <svg className="mx-auto h-8 w-8 text-teal-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-sm font-medium text-gray-700">Processing your file...</p>
                        </div>
                    )}
                     {bulkUploadStep === 'preview' && (
                        <div>
                           <h3 className="text-md font-semibold text-gray-800">Preview Upload</h3>
                           <p className="text-sm text-gray-500 mb-4">We found {parsedProducts.length} products. Please confirm to upload.</p>
                           <div className="max-h-60 overflow-y-auto border rounded-lg">
                               <table className="min-w-full divide-y divide-gray-200">
                                   <thead className="bg-gray-50"><tr>
                                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                   </tr></thead>
                                   <tbody className="bg-white divide-y divide-gray-200">
                                       {parsedProducts.map((p, i) => (
                                           <tr key={i}>
                                               <td className="px-4 py-2 text-sm">{p.name}</td>
                                               <td className="px-4 py-2 text-sm">{p.price}</td>
                                               <td className="px-4 py-2 text-sm">{p.stock || 'N/A'}</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           </div>
                           <div className="mt-4 flex justify-end space-x-3">
                               <button onClick={() => setBulkUploadStep('idle')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                               <button onClick={confirmBulkUpload} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700">Confirm & Upload</button>
                           </div>
                        </div>
                     )}
                     {bulkUploadStep === 'success' && (
                        <div className="text-center py-10">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            </div>
                            <p className="mt-4 text-sm font-medium text-green-700">Successfully uploaded {parsedProducts.length} products!</p>
                        </div>
                     )}
                </div>
            )}
        </div>
    );
};


export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ creator, products, addProduct }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900">Karibu, {creator.name.split(' ')[0]}!</h1>
        <p className="mt-1 text-md text-gray-600">Hapa ndipo unaweza manage duka lako.</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><ShareIcon className="h-6 w-6 mr-2"/>Promote Your Duka</h2>
        <ShareStoreWidget creator={creator} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><ChartBarIcon className="h-6 w-6 mr-2"/>Analytics Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnalyticsCard title="Total Views" value={MOCK_ANALYTICS.views.toLocaleString()} />
          <AnalyticsCard title="Product Clicks" value={MOCK_ANALYTICS.clicks.toLocaleString()} />
          <AnalyticsCard title="Jumla ya Sales" value={MOCK_ANALYTICS.sales.toLocaleString()} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AnalyticsCard title="Gross Sales" value={`Ksh ${MOCK_ANALYTICS.revenue.toLocaleString()}`} />
            <AnalyticsCard title="Platform Fees (10%)" value={`Ksh ${MOCK_ANALYTICS.platformFee.toLocaleString()}`} isFee />
            <AnalyticsCard title="Your Net Payout" value={`Ksh ${MOCK_ANALYTICS.netRevenue.toLocaleString()}`} isCurrency />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><WalletIcon className="h-6 w-6 mr-2"/>Payout Settings</h2>
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm font-medium text-gray-500">M-Pesa Payout Number</p>
                    <p className="text-lg font-semibold text-gray-900">{creator.mpesaNumber}</p>
                </div>
                <button className="text-sm font-medium text-teal-600 hover:text-teal-500">Edit</button>
            </div>
            <p className="mt-4 text-xs text-gray-500">This is the M-Pesa number (personal or Till) where your payouts will be sent. Platform fees are deducted at the point of sale.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Products & Services</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {products.map(product => (
                        <li key={product.id} className="p-4 flex items-center space-x-4">
                            <img src={product.imageUrls[0]} alt={product.name} className="w-16 h-16 rounded-md object-cover"/>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-600">Ksh {product.price.toLocaleString()}</p>
                            </div>
                            <span className="text-sm font-medium px-2.5 py-0.5 rounded-full capitalize"
                                style={{
                                    backgroundColor: product.type === ProductType.PRODUCT ? '#E0F2F1' : product.type === ProductType.EVENT ? '#E3F2FD' : '#FFF3E0',
                                    color: product.type === ProductType.PRODUCT ? '#00796B' : product.type === ProductType.EVENT ? '#1E88E5' : '#F57C00'
                                }}
                            >
                                {product.type}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>

        <section className="sticky top-24 self-start">
          <AddProductSection addProduct={addProduct} />
        </section>
      </div>
    </div>
  );
};
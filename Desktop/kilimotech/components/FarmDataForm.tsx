
import React, { useState } from 'react';
import { Farmer, FarmData } from '../types';
import { useApp } from '../context/AppContext';

interface FarmDataFormProps {
    farmer: Farmer;
    onSave: () => void;
}

const FarmDataForm: React.FC<FarmDataFormProps> = ({ farmer, onSave }) => {
    const { updateFarmerData } = useApp();
    const [formData, setFormData] = useState<FarmData>(farmer.farmData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'acreage' || name === 'yieldEstimate' || name === 'annualExpenses' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFarmerData(farmer.id, formData);
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Crop Type</label>
                <input type="text" name="cropType" value={formData.cropType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Acreage</label>
                <input type="number" name="acreage" value={formData.acreage} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Yield Estimate (tons/acre)</label>
                <input type="number" step="0.1" name="yieldEstimate" value={formData.yieldEstimate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700">Annual Expenses (KES)</label>
                <input type="number" name="annualExpenses" value={formData.annualExpenses} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Rainfall</label>
                <select name="rainfall" value={formData.rainfall} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                    <option>Low</option>
                    <option>Average</option>
                    <option>High</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Soil Health</label>
                <select name="soilHealth" value={formData.soilHealth} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                    <option>Poor</option>
                    <option>Average</option>
                    <option>Good</option>
                </select>
            </div>
            <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Save Changes</button>
        </form>
    );
};

export default FarmDataForm;

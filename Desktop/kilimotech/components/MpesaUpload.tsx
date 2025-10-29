import React, { useState, useRef } from 'react';
import { Farmer, MpesaStatement, CreditProfile } from '../types';
import { useApp } from '../context/AppContext';
import { scoreMpesaStatement } from '../services/geminiService';
import Card from './shared/Card';
import Spinner from './shared/Spinner';

interface MpesaUploadProps {
    farmer: Farmer;
}

const MOCK_MPESA_STATEMENT_CONTENT = `
    Statement Period: 01/05/2023 - 31/05/2023
    Customer Name: Juma Wasonga
    ---
    - 02/05/2023: Payment Received from COOPERATIVE BANK - KES 15,000 (Description: Crop Sale)
    - 05/05/2023: Payment Made to KAKAMEGA AGROVET - KES 3,500 (Description: Fertilizer)
    - 10/05/2023: Payment Made to KPLC LIMITED - KES 1,200 (Description: Electricity Bill)
    - 15/05/2023: Payment Received from GREENLEAF BUYERS - KES 22,000 (Description: Tea Bonus)
    - 18/05/2023: Fuliza M-PESA repayment - KES 1,000
    - 20/05/2023: Payment Made to SportPesa - KES 500
    - 25/05/2023: Payment Made to ONE ACRE FUND - KES 4,000 (Description: Loan Repayment)
    - 28/05/2023: Payment Received from M-Shwari - KES 5,000 (Description: Loan)
`;

const DocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);


const MpesaUpload: React.FC<MpesaUploadProps> = ({ farmer }) => {
    const { updateMpesaStatement, updateCreditProfile } = useApp();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const [isScoring, setIsScoring] = useState(false);
    const [scoringError, setScoringError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf' && file.type !== 'image/jpeg' && file.type !== 'image/png') {
                setUploadError('Please upload a PDF, JPG, or PNG file.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                 setUploadError('File size should not exceed 5MB.');
                return;
            }
            setUploadError('');
            handleUpload(file);
        }
    };

    const handleUpload = (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    const newStatement: MpesaStatement = {
                        fileName: file.name,
                        uploadDate: new Date().toISOString().split('T')[0],
                    };
                    updateMpesaStatement(farmer.id, newStatement);
                    setIsUploading(false);
                    return 100;
                }
                return prev + 20;
            });
        }, 300);
    };
    
    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleAnalyzeStatement = async () => {
        setIsScoring(true);
        setScoringError('');
        try {
            // In a real app, you would parse the uploaded file content.
            // For this prototype, we use mock content for the AI to analyze.
            const newProfile = await scoreMpesaStatement(MOCK_MPESA_STATEMENT_CONTENT);
            updateCreditProfile(farmer.id, newProfile);
        } catch (err) {
            setScoringError((err as Error).message);
        } finally {
            setIsScoring(false);
        }
    };


    return (
        <Card title="M-Pesa Statement" icon={<DocumentIcon className="w-6 h-6" />}>
            <div className="space-y-4">
                {isUploading ? (
                    <div>
                        <p className="text-sm text-center">Uploading...</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                           <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    </div>
                ) : farmer.mpesaStatement ? (
                    <div className="space-y-3">
                        <div>
                             <p className="text-sm font-semibold text-green-700">Statement Uploaded:</p>
                             <p className="text-sm truncate">{farmer.mpesaStatement.fileName}</p>
                             <p className="text-xs text-gray-500">on {farmer.mpesaStatement.uploadDate}</p>
                        </div>
                        {isScoring ? (
                             <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                <Spinner />
                                <span>Analyzing statement...</span>
                            </div>
                        ) : (
                             <button
                                onClick={handleAnalyzeStatement}
                                className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                             >
                                Analyze with AI to Update Credit Score
                            </button>
                        )}
                        {scoringError && <p className="text-red-500 text-xs mt-2">{scoringError}</p>}
                         <button onClick={triggerFileSelect} className="w-full text-sm text-center text-gray-500 hover:text-gray-700">
                            Upload a different statement
                        </button>
                    </div>
                ) : (
                     <div>
                        <p className="text-sm text-gray-500 mb-4">Upload your latest M-Pesa statement to improve your credit assessment.</p>
                        <button onClick={triggerFileSelect} className="w-full px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                            Upload Statement
                        </button>
                    </div>
                )}
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                />
                {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
            </div>
        </Card>
    );
};

export default MpesaUpload;
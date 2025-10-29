import React, { useState, useRef, useEffect } from 'react';
import { Farmer } from '../types';
import { 
    diagnosePlantImage, 
    saveDiagnosis, 
    getDiagnosisHistory,
    uploadDiagnosisImage,
    DiagnosisRequest,
    DiagnosisResult,
    PlantDiagnosis
} from '../services/plantDiagnosisService';
import Card from './shared/Card';
import Spinner from './shared/Spinner';

interface PlantDiagnosisProps {
    farmer: Farmer;
}

const PlantDiagnosis: React.FC<PlantDiagnosisProps> = ({ farmer }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [cropType, setCropType] = useState<string>(farmer.farmData?.cropType || '');
    const [plantPart, setPlantPart] = useState<'leaf' | 'fruit' | 'stem' | 'root' | 'whole_plant'>('leaf');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
    const [savedDiagnosis, setSavedDiagnosis] = useState<PlantDiagnosis | null>(null);
    const [history, setHistory] = useState<PlantDiagnosis[]>([]);
    const [cameraMode, setCameraMode] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        loadHistory();
        
        // Cleanup camera stream on unmount
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [farmer.id]);

    const loadHistory = async () => {
        try {
            const historyData = await getDiagnosisHistory(farmer.id, 10);
            setHistory(historyData);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError('Image size must be less than 10MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            setImageFile(file);
            setError(null);
            setDiagnosis(null);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } // Use back camera on mobile
            });
            setStream(mediaStream);
            setCameraMode(true);
            
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setError('Could not access camera. Please grant camera permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraMode(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setImageFile(file);
                    setSelectedImage(canvas.toDataURL('image/jpeg'));
                    stopCamera();
                }
            }, 'image/jpeg', 0.9);
        }
    };

    const handleDiagnose = async () => {
        if (!imageFile) {
            setError('Please select or capture an image first');
            return;
        }

        setLoading(true);
        setError(null);
        setDiagnosis(null);

        try {
            // Upload image to Supabase Storage (optional, can use base64)
            let imageUrl = selectedImage || '';
            let storagePath: string | undefined;
            
            try {
                const uploadResult = await uploadDiagnosisImage(farmer.id, imageFile);
                if (uploadResult) {
                    imageUrl = uploadResult.url;
                    storagePath = uploadResult.path;
                }
            } catch (uploadError) {
                console.warn('Image upload failed, using base64:', uploadError);
                // Continue with base64 URL
            }

            // Prepare diagnosis request
            const request: DiagnosisRequest = {
                imageFile,
                imageUrl,
                cropType: cropType || undefined,
                plantPart,
                farmerLocation: farmer.location
            };

            // Get AI diagnosis
            const result = await diagnosePlantImage(request);
            setDiagnosis(result);

            // Save to database
            const saved = await saveDiagnosis(farmer.id, result, request, storagePath);
            if (saved) {
                setSavedDiagnosis(saved);
                await loadHistory();
            }
        } catch (err: any) {
            console.error('Diagnosis error:', err);
            setError(err.message || 'Failed to diagnose plant. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedImage(null);
        setImageFile(null);
        setDiagnosis(null);
        setSavedDiagnosis(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getSeverityColor = (severity: string): string => {
        switch (severity) {
            case 'Critical': return 'text-red-700 bg-red-50 border-red-200';
            case 'High': return 'text-orange-700 bg-orange-50 border-orange-200';
            case 'Moderate': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'Low': return 'text-blue-700 bg-blue-50 border-blue-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const getUrgencyIcon = (urgency: string): string => {
        switch (urgency) {
            case 'Urgent': return '🚨';
            case 'High': return '⚠️';
            case 'Medium': return '⚡';
            case 'Low': return 'ℹ️';
            default: return '📋';
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <Card title="Plant Disease Diagnosis">
                <div className="space-y-4">
                    {/* Image Upload Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Image
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG up to 10MB
                            </p>
                        </div>

                        {/* Camera Capture */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Camera Capture
                            </label>
                            {!cameraMode ? (
                                <button
                                    onClick={startCamera}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                                >
                                    📷 Open Camera
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full rounded-lg border-2 border-gray-300"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={capturePhoto}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                                        >
                                            📸 Capture
                                        </button>
                                        <button
                                            onClick={stopCamera}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Preview */}
                    {selectedImage && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                            <div className="relative inline-block">
                                <img
                                    src={selectedImage}
                                    alt="Plant diagnosis preview"
                                    className="max-w-full h-64 object-contain rounded-lg border-2 border-gray-300"
                                />
                                <button
                                    onClick={resetForm}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                                    title="Remove image"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Crop Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Crop Type (Optional)
                            </label>
                            <input
                                type="text"
                                value={cropType}
                                onChange={(e) => setCropType(e.target.value)}
                                placeholder="e.g., Maize, Coffee, Banana"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Plant Part
                            </label>
                            <select
                                value={plantPart}
                                onChange={(e) => setPlantPart(e.target.value as any)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={loading}
                            >
                                <option value="leaf">Leaf</option>
                                <option value="fruit">Fruit</option>
                                <option value="stem">Stem</option>
                                <option value="root">Root</option>
                                <option value="whole_plant">Whole Plant</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Diagnose Button */}
                    <button
                        onClick={handleDiagnose}
                        disabled={loading || !imageFile}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Spinner />
                                Analyzing Image...
                            </>
                        ) : (
                            <>
                                🔍 Diagnose Plant Disease
                            </>
                        )}
                    </button>
                </div>
            </Card>

            {/* Diagnosis Results */}
            {diagnosis && (
                <div className="space-y-6">
                    {/* Main Diagnosis Card */}
                    <Card title="Diagnosis Results">
                        <div className={`p-6 rounded-lg border-2 ${getSeverityColor(diagnosis.severity)}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{diagnosis.diseaseName}</h3>
                                    {diagnosis.diseaseScientificName && (
                                        <p className="text-sm italic text-gray-600">
                                            {diagnosis.diseaseScientificName}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            diagnosis.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                                            diagnosis.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                                            diagnosis.severity === 'Moderate' ? 'bg-yellow-200 text-yellow-800' :
                                            'bg-blue-200 text-blue-800'
                                        }`}>
                                            {diagnosis.severity} Severity
                                        </span>
                                        <span className="text-sm font-medium">
                                            {getUrgencyIcon(diagnosis.urgencyLevel)} {diagnosis.urgencyLevel} Priority
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Confidence</p>
                                    <p className="text-2xl font-bold">{diagnosis.confidenceScore}%</p>
                                </div>
                            </div>

                            {diagnosis.affectedStage && (
                                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        Affected Growth Stage
                                    </p>
                                    <p className="text-gray-800">{diagnosis.affectedStage}</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Symptoms */}
                    {diagnosis.symptomsDescription && (
                        <Card title="Symptoms Description">
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {diagnosis.symptomsDescription}
                            </p>
                        </Card>
                    )}

                    {/* Possible Causes */}
                    {diagnosis.possibleCauses.length > 0 && (
                        <Card title="Possible Causes">
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {diagnosis.possibleCauses.map((cause, index) => (
                                    <li key={index}>{cause}</li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Treatment Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Chemical Treatment */}
                        {diagnosis.chemicalTreatment && (
                            <Card title="Chemical Treatment" className="bg-orange-50">
                                <div className="space-y-2">
                                    <p className="text-xs text-orange-700 mb-2">
                                        ⚠️ Follow safety guidelines and read product labels carefully
                                    </p>
                                    <p className="text-gray-800 whitespace-pre-wrap">
                                        {diagnosis.chemicalTreatment}
                                    </p>
                                </div>
                            </Card>
                        )}

                        {/* Organic Treatment */}
                        {diagnosis.organicTreatment && (
                            <Card title="Organic Treatment" className="bg-green-50">
                                <p className="text-gray-800 whitespace-pre-wrap">
                                    {diagnosis.organicTreatment}
                                </p>
                            </Card>
                        )}
                    </div>

                    {/* Preventive Measures */}
                    {diagnosis.preventiveMeasures && (
                        <Card title="Prevention & Best Practices">
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {diagnosis.preventiveMeasures}
                            </p>
                        </Card>
                    )}

                    {/* Agronomist Recommendation */}
                    {diagnosis.seekAgronomist && (
                        <Card title="Expert Consultation Recommended" className="bg-red-50 border-red-200">
                            <div className="space-y-2">
                                <p className="text-red-800 font-semibold">
                                    🚨 You should consult with a qualified agronomist
                                </p>
                                <p className="text-gray-700">
                                    Based on the diagnosis, professional advice is recommended for:
                                </p>
                                <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                                    {diagnosis.severity === 'Critical' && (
                                        <li>Immediate intervention to save your crop</li>
                                    )}
                                    <li>Accurate treatment dosage and timing</li>
                                    <li>Proper disease management strategy</li>
                                    <li>Follow-up monitoring and care</li>
                                </ul>
                                <p className="text-sm text-gray-600 mt-3">
                                    Contact your local agricultural extension officer or agronomist for assistance.
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* Additional Notes */}
                    {diagnosis.additionalNotes && (
                        <Card title="Additional Information">
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {diagnosis.additionalNotes}
                            </p>
                        </Card>
                    )}

                    {/* Save Success Message */}
                    {savedDiagnosis && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-sm">
                                ✅ Diagnosis saved to your history
                            </p>
                        </div>
                    )}

                    {/* New Diagnosis Button */}
                    <div className="flex gap-3">
                        <button
                            onClick={resetForm}
                            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                        >
                            📤 Diagnose Another Plant
                        </button>
                    </div>
                </div>
            )}

            {/* Diagnosis History */}
            {history.length > 0 && (
                <Card title="Recent Diagnoses">
                    <div className="space-y-3">
                        {history.map((record) => (
                            <div
                                key={record.id}
                                className={`p-4 rounded-lg border-2 ${getSeverityColor(record.severity)} cursor-pointer hover:shadow-md transition-shadow`}
                                onClick={() => {
                                    setDiagnosis({
                                        diseaseName: record.diseaseName || 'Unknown',
                                        diseaseScientificName: record.diseaseScientificName,
                                        confidenceScore: record.confidenceScore,
                                        severity: record.severity,
                                        affectedStage: record.affectedStage,
                                        possibleCauses: record.possibleCauses,
                                        symptomsDescription: record.symptomsDescription || '',
                                        chemicalTreatment: record.chemicalTreatment,
                                        organicTreatment: record.organicTreatment,
                                        preventiveMeasures: record.preventiveMeasures || '',
                                        seekAgronomist: record.seekAgronomist,
                                        urgencyLevel: record.urgencyLevel
                                    });
                                    setSelectedImage(record.imageUrl);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <img
                                        src={record.imageUrl}
                                        alt="Diagnosis"
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-gray-800">
                                                {record.diseaseName || 'Unidentified'}
                                            </h4>
                                            <span className="text-xs text-gray-600">
                                                {new Date(record.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                record.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                                                record.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                                                record.severity === 'Moderate' ? 'bg-yellow-200 text-yellow-800' :
                                                'bg-blue-200 text-blue-800'
                                            }`}>
                                                {record.severity}
                                            </span>
                                            <span className="text-gray-600">
                                                {record.confidenceScore}% confidence
                                            </span>
                                            {record.cropType && (
                                                <span className="text-gray-600">
                                                    • {record.cropType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Info Card */}
            {!diagnosis && (
                <Card title="How It Works" className="bg-blue-50">
                    <div className="space-y-3 text-sm text-gray-700">
                        <p><strong>📸 Step 1:</strong> Upload or capture a photo of the affected plant part</p>
                        <p><strong>🌾 Step 2:</strong> (Optional) Enter crop type and select plant part</p>
                        <p><strong>🔍 Step 3:</strong> Click "Diagnose Plant Disease" for AI analysis</p>
                        <p><strong>📋 Step 4:</strong> Review diagnosis, treatments, and recommendations</p>
                        <div className="mt-4 p-3 bg-white rounded-lg">
                            <p className="font-semibold mb-2">💡 Tips for Best Results:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Take clear, well-lit photos</li>
                                <li>Focus on the affected area</li>
                                <li>Include healthy parts for comparison if possible</li>
                                <li>Provide crop type for more accurate diagnosis</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            )}

            {/* Hidden Canvas for Camera Capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default PlantDiagnosis;


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { signUp, signIn } from '../services/authService';

const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-3.423l-1.298-5.32c-.287-1.18.082-2.37.87-3.145a11.942 11.942 0 01-1.423-3.692c-.103-.434-.038-1.002.289-1.378A1.724 1.724 0 0110.188 2.5c.345 0 .67.114.955.313a1.724 1.724 0 01.87 1.488c.038.434-.028.995-.13 1.422a11.942 11.942 0 01-1.423 3.692c.788.775 1.157 1.965.87 3.145l-1.298 5.32c-.443 1.821-.298 3.555.393 5.109a1.734 1.734 0 01-1.636 2.454c-.345 0-.67-.114-.955-.313a1.734 1.734 0 01-.87-1.489z" />
        <path d="M12 21.75c5.385 0 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25 2.25 6.615 2.25 12s4.365 9.75 9.75 9.75z" />
    </svg>
);

type AuthMode = 'landing' | 'signin' | 'signup';

const LandingPage: React.FC = () => {
    const { login } = useApp();
    const [mode, setMode] = useState<AuthMode>('landing');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await signUp(email, password, phone || undefined, name || undefined);
            setSuccess('Account created successfully! Please check your email to verify your account.');
            setTimeout(() => {
                setMode('signin');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signIn(email, password);
            // Login will be handled by auth state change in AppContext
            login('farmer');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    if (mode === 'landing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-lime-50">
                {/* Hero Section */}
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center mb-16">
                        <LeafIcon className="w-24 h-24 mx-auto text-green-600 mb-6" />
                        <h1 className="text-5xl md:text-6xl font-extrabold text-green-900 mb-4">
                            Welcome to KilimoTech
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
                            Empowering Kenyan farmers with AI-powered insights, financial access, and smart farming solutions
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="text-5xl mb-4 text-center">🌱</div>
                            <h3 className="text-xl font-bold text-green-800 mb-3 text-center">AI-Powered Insights</h3>
                            <p className="text-gray-600 text-center">
                                Get personalized farming advice based on your crop type, soil health, and weather patterns
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="text-5xl mb-4 text-center">💰</div>
                            <h3 className="text-xl font-bold text-green-800 mb-3 text-center">Credit Access</h3>
                            <p className="text-gray-600 text-center">
                                Upload your M-Pesa statements for instant credit scoring and loan eligibility assessment
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="text-5xl mb-4 text-center">📊</div>
                            <h3 className="text-xl font-bold text-green-800 mb-3 text-center">Farm Analytics</h3>
                            <p className="text-gray-600 text-center">
                                Track your farm data, monitor expenses, and optimize yields with real-time analytics
                            </p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <button
                            onClick={() => setMode('signin')}
                            className="px-8 py-4 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className="px-8 py-4 text-lg font-bold text-green-700 bg-white border-2 border-green-600 rounded-lg hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'signup') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-lime-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl">
                    <div className="text-center">
                        <LeafIcon className="w-16 h-16 mx-auto text-green-600" />
                        <h2 className="mt-4 text-3xl font-extrabold text-green-800">Create Account</h2>
                        <p className="mt-2 text-sm text-gray-600">Join KilimoTech and start your smart farming journey</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="+254..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="At least 6 characters"
                            />
                        </div>
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                {success}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('signin')}
                            className="w-full text-sm text-gray-600 hover:text-green-600"
                        >
                            Already have an account? Sign in
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-lime-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl">
                <div className="text-center">
                    <LeafIcon className="w-16 h-16 mx-auto text-green-600" />
                    <h2 className="mt-4 text-3xl font-extrabold text-green-800">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600">Sign in to access your farmer dashboard</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Your password"
                        />
                    </div>
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className="w-full text-sm text-gray-600 hover:text-green-600"
                    >
                        Don't have an account? Sign up
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('landing')}
                        className="w-full text-sm text-gray-600 hover:text-green-600"
                    >
                        ← Back to home
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LandingPage;


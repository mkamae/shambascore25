import React from 'react';
import { useApp } from '../context/AppContext';

const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-3.423l-1.298-5.32c-.287-1.18.082-2.37.87-3.145a11.942 11.942 0 01-1.423-3.692c-.103-.434-.038-1.002.289-1.378A1.724 1.724 0 0110.188 2.5c.345 0 .67.114.955.313a1.724 1.724 0 01.87 1.488c.038.434-.028.995-.13 1.422a11.942 11.942 0 01-1.423 3.692c.788.775 1.157 1.965.87 3.145l-1.298 5.32c-.443 1.821-.298 3.555.393 5.109a1.734 1.734 0 01-1.636 2.454c-.345 0-.67-.114-.955-.313a1.734 1.734 0 01-.87-1.489z" />
        <path d="M12 21.75c5.385 0 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25 2.25 6.615 2.25 12s4.365 9.75 9.75 9.75z" />
    </svg>
);

const Login: React.FC = () => {
    const { login } = useApp();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-lime-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
                <div className="text-center">
                    <LeafIcon className="w-16 h-16 mx-auto text-green-600" />
                    <h1 className="mt-4 text-4xl font-extrabold text-green-800">Welcome to KilimoTech</h1>
                    <p className="mt-2 text-lg text-gray-600">Empowering farmers with data and insights.</p>
                </div>
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center text-gray-700">Choose your role to continue</h2>
                    <button
                        onClick={() => login('farmer')}
                        className="w-full px-5 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform transform hover:scale-105 duration-300"
                    >
                        I am a Farmer
                    </button>
                    <button
                        onClick={() => login('partner')}
                        className="w-full px-5 py-3 text-lg font-semibold text-green-700 bg-green-100 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform transform hover:scale-105 duration-300"
                    >
                        I am a Partner (Lender/Insurer)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
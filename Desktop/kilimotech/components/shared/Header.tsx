import React from 'react';
import { UserType } from '../../types';

interface HeaderProps {
    userType: UserType;
    onLogout: () => void;
}

const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-3.423l-1.298-5.32c-.287-1.18.082-2.37.87-3.145a11.942 11.942 0 01-1.423-3.692c-.103-.434-.038-1.002.289-1.378A1.724 1.724 0 0110.188 2.5c.345 0 .67.114.955.313a1.724 1.724 0 01.87 1.488c.038.434-.028.995-.13 1.422a11.942 11.942 0 01-1.423 3.692c.788.775 1.157 1.965.87 3.145l-1.298 5.32c-.443 1.821-.298 3.555.393 5.109a1.734 1.734 0 01-1.636 2.454c-.345 0-.67-.114-.955-.313a1.734 1.734 0 01-.87-1.489z" />
        <path d="M12 21.75c5.385 0 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25 2.25 6.615 2.25 12s4.365 9.75 9.75 9.75z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ userType, onLogout }) => {
    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <LeafIcon className="h-8 w-8 text-green-600" />
                        <h1 className="ml-3 text-2xl font-bold text-green-800">KilimoTech</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                         <span className="text-sm font-medium text-gray-500 capitalize">{userType} View</span>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
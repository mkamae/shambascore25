
import React, { ReactNode } from 'react';

interface CardProps {
    title: string;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', icon }) => {
    return (
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}>
            <div className="p-5">
                <div className="flex items-center mb-4">
                    {icon && <div className="mr-3 text-green-600">{icon}</div>}
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                </div>
                <div className="text-gray-600">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Card;

import React from 'react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onLogout?: () => void;
}

interface NavItem {
    id: string;
    label: string;
    icon: string;
    description?: string;
}

const navItems: NavItem[] = [
    {
        id: 'Dashboard',
        label: 'Dashboard',
        icon: '📊',
        description: 'Overview & Insights'
    },
    {
        id: 'My Farm',
        label: 'My Farm',
        icon: '🌾',
        description: 'Farm Data & Management'
    },
    {
        id: 'Farm Health',
        label: 'Farm Health',
        icon: '🌍',
        description: 'Satellite Analysis'
    },
    {
        id: 'Diagnosis',
        label: 'Plant Diagnosis',
        icon: '🔬',
        description: 'Disease Detection'
    },
    {
        id: 'Financials',
        label: 'Financials',
        icon: '💰',
        description: 'Credit & Insurance'
    },
    {
        id: 'Profile',
        label: 'Profile',
        icon: '👤',
        description: 'Risk Profile & Settings'
    }
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, onLogout }) => {
    const handleNavClick = (tab: string) => {
        setActiveTab(tab);
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full bg-white shadow-xl z-50
                    w-64 transform transition-transform duration-300 ease-in-out
                    lg:relative lg:translate-x-0 lg:z-auto
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    border-r border-gray-200
                    flex flex-col
                `}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="text-2xl">🌱</div>
                            <h2 className="text-lg font-bold text-green-800">KilimoTech</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
                            aria-label="Close sidebar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Farmer Dashboard</p>
                </div>

                {/* Navigation Items */}
                <nav className="p-4 space-y-2 mt-4 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                    transition-all duration-200
                                    ${
                                        isActive
                                            ? 'bg-green-100 text-green-700 shadow-md border-2 border-green-300'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent'
                                    }
                                    group
                                `}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <div className="flex-1 text-left">
                                    <div className={`font-semibold ${isActive ? 'text-green-800' : 'text-gray-800'}`}>
                                        {item.label}
                                    </div>
                                    {item.description && (
                                        <div className={`text-xs mt-0.5 ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                                {isActive && (
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-gray-50">
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                            <span>🚪</span>
                            <span>Logout</span>
                        </button>
                    )}
                    <div className="p-4 text-xs text-gray-500 text-center">
                        <p className="font-semibold text-gray-700 mb-1">Need Help?</p>
                        <p>Contact support for assistance</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;


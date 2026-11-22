import React, { useState } from 'react';
import './Mainmenu.css';

const Mainmenu = () => {
    const [activeMenu, setActiveMenu] = useState(null);

    const menuItems = [
        { id: 1, label: 'Dashboard', icon: '📊' },
        { id: 2, label: 'Appointments', icon: '📅' },
        { id: 3, label: 'Patients', icon: '👥' },
        { id: 4, label: 'Doctors', icon: '👨‍⚕️' },
        { id: 5, label: 'Billing', icon: '💰' },
        { id: 6, label: 'Reports', icon: '📈' },
        { id: 7, label: 'Settings', icon: '⚙️' },
        { id: 8, label: 'Logout', icon: '🚪' },
    ];

    return (
        <div className="mainmenu-container">
            <header className="mainmenu-header">
                <h1>Hospital Management System</h1>
            </header>
            <nav className="mainmenu-nav">
                <ul className="menu-list">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                                onClick={() => setActiveMenu(item.id)}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-label">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Mainmenu;
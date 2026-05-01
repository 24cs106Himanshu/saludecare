import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ChatbotWidget from './ChatbotWidget';
import './DashboardLayout.css';

export default function DashboardLayout({ children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="dashboard-main">
                <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
            <ChatbotWidget />
        </div>
    );
}

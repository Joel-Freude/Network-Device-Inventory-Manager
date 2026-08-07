'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/tabs/Dashboard';
import Inventory from '@/components/tabs/Inventory';
import Locations from '@/components/tabs/Locations';
import Settings from '@/components/tabs/Settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'locations':
        return <Locations />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTab()}
    </Layout>
  );
}

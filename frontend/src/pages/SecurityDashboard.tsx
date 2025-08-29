import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/UI/tabs';
import SecurityAlerts from '../components/Dashboard/SecurityAlerts';
import SecurityActions from '../components/Dashboard/SecurityActions';
import SecurityLogs from '../components/Dashboard/SecurityLogs';

const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('alerts');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor security threats, manage user access, and review activity logs
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <span>🛡️</span>
              Security Alerts
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <span>⚡</span>
              Security Actions
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <span>📋</span>
              Activity Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <SecurityAlerts />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <SecurityActions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <SecurityLogs />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecurityDashboard; 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Edit, BarChart } from 'lucide-react';

const AdminEventsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and moderate events across the platform
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">All Events</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage platform events including:
              </p>
              <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
                <li>Event approval and moderation</li>
                <li>Featured event selection</li>
                <li>Event categorization</li>
                <li>Schedule management</li>
              </ul>
              <Button className="mt-4">
                <Calendar className="h-4 w-4 mr-2" />
                View All Events
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Event Moderation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Pending Review</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Events awaiting moderation:
              </p>
              <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
                <li>New event submissions</li>
                <li>Content review process</li>
                <li>Guidelines compliance</li>
                <li>Approval workflow</li>
              </ul>
              <Button className="mt-4">
                <Edit className="h-4 w-4 mr-2" />
                Review Events
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Event Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Performance Metrics</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Event performance analytics:
              </p>
              <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
                <li>Registration statistics</li>
                <li>Attendance tracking</li>
                <li>Revenue reporting</li>
                <li>Popular event types</li>
              </ul>
              <Button className="mt-4">
                <BarChart className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              System Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold mb-2">Platform Events</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create and manage system events:
              </p>
              <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
                <li>Official platform events</li>
                <li>Community gatherings</li>
                <li>Virtual workshops</li>
                <li>Promotional events</li>
              </ul>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create System Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEventsPage; 
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Settings } from 'lucide-react';
import { EventPerformanceDashboard } from '../../components/EventPerformanceDashboard';

const EventPerformancePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
          <Link
            to="/organizer/events"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to={`/organizer/event/${eventId}/manage`}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Event Management
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventPerformanceDashboard eventId={eventId} />
      </div>
    </div>
  );
};

export default EventPerformancePage; 
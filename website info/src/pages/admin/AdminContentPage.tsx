import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Video, Database } from 'lucide-react';

const AdminContentPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Static Content</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage static pages and content across the platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Static Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold mb-2">Page Management</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage static content pages:
              </p>
              <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
                <li>About us page</li>
                <li>Terms of service</li>
                <li>Privacy policy</li>
                <li>FAQ section</li>
              </ul>
              <Button className="mt-4">
                <FileText className="h-4 w-4 mr-2" />
                Manage Pages
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Media Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold mb-2">Asset Management</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage platform media assets:
              </p>
              <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
                <li>Image uploads and optimization</li>
                <li>Video content management</li>
                <li>File organization</li>
                <li>CDN configuration</li>
              </ul>
              <Button className="mt-4">
                <Image className="h-4 w-4 mr-2" />
                Media Library
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Content Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Template Library</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage content templates:
              </p>
              <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
                <li>Email templates</li>
                <li>Page layouts</li>
                <li>Event descriptions</li>
                <li>Notification templates</li>
              </ul>
              <Button className="mt-4">
                <Database className="h-4 w-4 mr-2" />
                Manage Templates
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Rich Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">Interactive Content</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage rich media content:
              </p>
              <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
                <li>Video tutorials</li>
                <li>Interactive guides</li>
                <li>Embedded content</li>
                <li>Gallery management</li>
              </ul>
              <Button className="mt-4">
                <Video className="h-4 w-4 mr-2" />
                Rich Content
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContentPage; 
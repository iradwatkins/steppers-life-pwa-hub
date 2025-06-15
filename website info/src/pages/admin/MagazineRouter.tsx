import React from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import MagazineManagementPage from './MagazineManagementPage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MagazineCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/magazine')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Magazine Management
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Magazine Article</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new article for the magazine
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Magazine Article
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Article Editor</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The magazine article creation form will be implemented here. This will include:
            </p>
            <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
              <li>Block-based content editor</li>
              <li>Title and category selection</li>
              <li>Featured image upload</li>
              <li>Header, subheader, and paragraph blocks</li>
              <li>Image and video embedding</li>
              <li>Ad placement markers</li>
              <li>Publish/draft options</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MagazineEditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const articleId = location.pathname.split('/').pop();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/magazine')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Magazine Management
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Magazine Article</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Edit article ID: {articleId}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Article</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✏️</div>
            <h3 className="text-xl font-semibold mb-2">Article Editor</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The magazine article editing form will be implemented here. This will include:
            </p>
            <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
              <li>Load existing article data</li>
              <li>Block-based content editor with current content</li>
              <li>Update title and category</li>
              <li>Change featured image</li>
              <li>Edit content blocks in order</li>
              <li>Add/remove/reorder blocks</li>
              <li>Save changes or publish</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MagazineCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/magazine')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Magazine Management
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Magazine Categories</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage magazine categories (Cover Story, Tech, Lifestyle, etc.)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Category Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Category Manager</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The category management interface will be implemented here. This will include:
            </p>
            <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
              <li>Create new categories</li>
              <li>Edit existing categories</li>
              <li>Delete categories (if no articles)</li>
              <li>View article count per category</li>
              <li>Automatic slug generation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// The Router component has been simplified to directly export the correct pages
const MagazineRouter: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Render the appropriate component based on the current path
  if (path.endsWith('/create')) {
    return <MagazineCreatePage />;
  } else if (path.includes('/edit/')) {
    return <MagazineEditPage />;
  } else if (path.endsWith('/categories')) {
    return <MagazineCategoriesPage />;
  }
  
  // Default to the management page
  return <MagazineManagementPage />;
};

export default MagazineRouter; 
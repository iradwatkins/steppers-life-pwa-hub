import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BlogManagementPage from './BlogManagementPage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BlogCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/blog')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog Management
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Blog Post</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new blog post for the community
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Blog Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Blog Editor</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The blog creation form will be implemented here. This will include:
            </p>
            <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
              <li>Rich text editor for content</li>
              <li>Title and excerpt fields</li>
              <li>Featured image upload</li>
              <li>Tags and categories</li>
              <li>SEO meta fields</li>
              <li>Publish/draft options</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BlogEditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const postId = location.pathname.split('/').pop();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/blog')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog Management
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Blog Post</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Edit blog post ID: {postId}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✏️</div>
            <h3 className="text-xl font-semibold mb-2">Blog Editor</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The blog editing form will be implemented here. This will include:
            </p>
            <ul className="list-disc text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-400">
              <li>Load existing post data</li>
              <li>Rich text editor with current content</li>
              <li>Update title and excerpt</li>
              <li>Change featured image</li>
              <li>Edit tags and categories</li>
              <li>Update SEO meta fields</li>
              <li>Save changes or publish</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BlogRouter: React.FC = () => {
  return (
    <Routes>
      <Route index element={<BlogManagementPage />} />
      <Route path="create" element={<BlogCreatePage />} />
      <Route path="edit/:id" element={<BlogEditPage />} />
    </Routes>
  );
};

export default BlogRouter; 
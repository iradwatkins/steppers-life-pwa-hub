import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogPost, BlogCategory, BlogTag, CreateBlogPostData, UpdateBlogPostData } from '@/types/blog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { ArrowLeft, Save, Eye, Upload, Youtube, Search, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BlogEditorPage = () => {
  const { postId } = useParams<{ postId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(postId);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    featured_image_alt: '',
    status: 'draft' as 'draft' | 'published',
    category_ids: [] as string[],
    tag_names: [] as string[],
    seo_title: '',
    seo_description: '',
    seo_keywords: [] as string[],
    youtube_video_id: ''
  });

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  useEffect(() => {
    fetchMetadata();
    if (isEditing) {
      fetchPost();
    }
  }, [postId]);

  useEffect(() => {
    if (formData.title && !isEditing) {
      generateSlug();
    }
  }, [formData.title]);

  useEffect(() => {
    if (autoSaveEnabled && formData.title) {
      const timeoutId = setTimeout(() => {
        handleSave(true);
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [formData, autoSaveEnabled]);

  const fetchMetadata = async () => {
    try {
      const response = await fetch('/api/admin/blog/metadata');
      const data = await response.json();
      setCategories(data.categories || mockCategories);
      setAvailableTags(data.tags || mockTags);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setCategories(mockCategories);
      setAvailableTags(mockTags);
    }
  };

  const fetchPost = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blog/posts/${postId}`);
      const post: BlogPost = await response.json();
      
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image || '',
        featured_image_alt: post.featured_image_alt || '',
        status: post.status,
        category_ids: post.categories.map(c => c.id),
        tag_names: post.tags.map(t => t.name),
        seo_title: post.seo_title || '',
        seo_description: post.seo_description || '',
        seo_keywords: post.seo_keywords || [],
        youtube_video_id: post.youtube_video_id || ''
      });
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSave = async (isDraft = false) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    setSaving(true);
    try {
      const postData: CreateBlogPostData | UpdateBlogPostData = {
        ...formData,
        status: isDraft ? 'draft' : formData.status
      };

      const url = isEditing 
        ? `/api/admin/blog/posts/${postId}` 
        : '/api/admin/blog/posts';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const result = await response.json();
        if (!isEditing) {
          navigate(`/admin/blog/edit/${result.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    setFormData(prev => ({ ...prev, status: 'published' }));
    handleSave(false);
  };

  const addTag = (tagName: string) => {
    if (tagName && !formData.tag_names.includes(tagName)) {
      setFormData(prev => ({
        ...prev,
        tag_names: [...prev.tag_names, tagName]
      }));
    }
  };

  const removeTag = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tag_names: prev.tag_names.filter(name => name !== tagName)
    }));
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const handleYouTubeUrl = (url: string) => {
    const videoId = extractYouTubeId(url);
    setFormData(prev => ({ ...prev, youtube_video_id: videoId }));
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-muted animate-pulse rounded mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/blog')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog Management
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h1>
              <p className="text-muted-foreground">
                Reading time: ~{calculateReadingTime(formData.content)} minutes
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-save">Auto-save</Label>
              <Switch
                id="auto-save"
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={saving || !formData.title.trim() || !formData.content.trim()}
            >
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter post title..."
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="post-url-slug"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the post..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Content *</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Start writing your blog post..."
                    className="min-h-96"
                  />
                </div>
              </CardContent>
            </Card>

            {/* YouTube Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="h-5 w-5" />
                  YouTube Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <Input
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(e) => handleYouTubeUrl(e.target.value)}
                  />
                </div>
                {formData.youtube_video_id && (
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${formData.youtube_video_id}`}
                      title="YouTube video preview"
                      frameBorder="0"
                      allowFullScreen
                      className="rounded-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="featured-image">Image URL</Label>
                  <Input
                    id="featured-image"
                    value={formData.featured_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="featured-image-alt">Alt Text</Label>
                  <Input
                    id="featured-image-alt"
                    value={formData.featured_image_alt}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image_alt: e.target.value }))}
                    placeholder="Image description for accessibility"
                  />
                </div>
                {formData.featured_image && (
                  <div className="aspect-video">
                    <img 
                      src={formData.featured_image} 
                      alt={formData.featured_image_alt}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.category_ids.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            category_ids: [...prev.category_ids, category.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            category_ids: prev.category_ids.filter(id => id !== category.id)
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.tag_names.map(tagName => (
                    <Badge key={tagName} variant="secondary" className="flex items-center gap-1">
                      {tagName}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tagName)}
                      />
                    </Badge>
                  ))}
                </div>
                
                <div>
                  <Label>Add Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {availableTags.map(tag => (
                      <Button
                        key={tag.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag.name)}
                        disabled={formData.tag_names.includes(tag.name)}
                        className="text-xs"
                      >
                        {tag.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seo-title">SEO Title</Label>
                  <Input
                    id="seo-title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="Custom title for search engines"
                  />
                </div>
                <div>
                  <Label htmlFor="seo-description">SEO Description</Label>
                  <Textarea
                    id="seo-description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Description for search engines"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data for development
const mockCategories: BlogCategory[] = [
  { id: '1', name: 'Dance Techniques', slug: 'dance-techniques', post_count: 15, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '2', name: 'Fitness & Health', slug: 'fitness-health', post_count: 12, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '3', name: 'Community Stories', slug: 'community-stories', post_count: 8, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

const mockTags: BlogTag[] = [
  { id: '1', name: 'beginner', slug: 'beginner', post_count: 10, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '2', name: 'advanced', slug: 'advanced', post_count: 8, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '3', name: 'tutorial', slug: 'tutorial', post_count: 12, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '4', name: 'fitness', slug: 'fitness', post_count: 9, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '5', name: 'community', slug: 'community', post_count: 6, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

export default BlogEditorPage;
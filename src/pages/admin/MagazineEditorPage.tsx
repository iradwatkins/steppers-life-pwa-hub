import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MagazineArticle, MagazineCategory, MagazineTag, CreateMagazineArticleData, UpdateMagazineArticleData } from '@/types/magazine';
import { magazineService } from '@/services/magazineService';
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
import { ArrowLeft, Save, Eye, Upload, Youtube, Search, X, Star, Bookmark, Quote, Image } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MagazineEditorPage = () => {
  const { articleId } = useParams<{ articleId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(articleId);
  
  const [formData, setFormData] = useState<CreateMagazineArticleData>({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    featured_image_alt: '',
    status: 'draft',
    category_ids: [],
    tag_names: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    youtube_video_id: '',
    issue_number: '',
    section: 'Culture',
    is_cover_story: false,
    is_featured: false,
    article_type: 'feature',
    photo_essay: false,
    gallery_images: [],
    sidebar_content: '',
    pull_quotes: []
  });

  const [categories, setCategories] = useState<MagazineCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<MagazineTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newPullQuote, setNewPullQuote] = useState('');
  const [newGalleryImage, setNewGalleryImage] = useState('');

  const sections = [
    'Culture',
    'Techniques', 
    'Profiles',
    'Events',
    'Fashion',
    'Editorial'
  ];

  const articleTypes = [
    { value: 'feature', label: 'Feature' },
    { value: 'profile', label: 'Profile' },
    { value: 'technique', label: 'Technique' },
    { value: 'culture', label: 'Culture' },
    { value: 'event_coverage', label: 'Event Coverage' },
    { value: 'editorial', label: 'Editorial' },
    { value: 'interview', label: 'Interview' },
    { value: 'review', label: 'Review' }
  ];

  useEffect(() => {
    fetchMetadata();
    if (isEditing) {
      fetchArticle();
    }
  }, [articleId]);

  useEffect(() => {
    if (autoSaveEnabled && formData.title && formData.content) {
      const timer = setTimeout(handleAutoSave, 30000); // Auto-save every 30 seconds
      return () => clearTimeout(timer);
    }
  }, [formData, autoSaveEnabled]);

  const fetchMetadata = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        magazineService.getCategories(),
        magazineService.getTags()
      ]);
      setCategories(categoriesData);
      setAvailableTags(tagsData);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const fetchArticle = async () => {
    if (!articleId) return;
    
    setLoading(true);
    try {
      const article = await magazineService.getArticleById(articleId);
      setFormData({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        featured_image: article.featured_image || '',
        featured_image_alt: article.featured_image_alt || '',
        status: article.status,
        category_ids: article.categories.map(c => c.id),
        tag_names: article.tags.map(t => t.name),
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || '',
        seo_keywords: article.seo_keywords || [],
        youtube_video_id: article.youtube_video_id || '',
        issue_number: article.issue_number || '',
        section: article.section,
        is_cover_story: article.is_cover_story,
        is_featured: article.is_featured,
        article_type: article.article_type,
        photo_essay: article.photo_essay || false,
        gallery_images: article.gallery_images || [],
        sidebar_content: article.sidebar_content || '',
        pull_quotes: article.pull_quotes || []
      });
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        status: status || formData.status
      };

      if (isEditing && articleId) {
        await magazineService.updateArticle({ id: articleId, ...dataToSave });
      } else {
        const newArticle = await magazineService.createArticle(dataToSave);
        navigate(`/admin/magazine/edit/${newArticle.id}`);
      }
      
      // Show success message here
    } catch (error) {
      console.error('Error saving article:', error);
      // Show error message here
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = () => {
    if (isEditing && articleId) {
      handleSave();
    }
  };

  const handlePreview = () => {
    if (isEditing && articleId) {
      window.open(`/magazine/${generateSlug(formData.title)}`, '_blank');
    }
  };

  const addTag = () => {
    if (newTag && !formData.tag_names.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tag_names: [...prev.tag_names, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tag_names: prev.tag_names.filter(tag => tag !== tagToRemove)
    }));
  };

  const addKeyword = () => {
    if (newKeyword && !formData.seo_keywords?.includes(newKeyword)) {
      setFormData(prev => ({
        ...prev,
        seo_keywords: [...(prev.seo_keywords || []), newKeyword]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      seo_keywords: prev.seo_keywords?.filter(k => k !== keyword) || []
    }));
  };

  const addPullQuote = () => {
    if (newPullQuote && !formData.pull_quotes?.includes(newPullQuote)) {
      setFormData(prev => ({
        ...prev,
        pull_quotes: [...(prev.pull_quotes || []), newPullQuote]
      }));
      setNewPullQuote('');
    }
  };

  const removePullQuote = (quote: string) => {
    setFormData(prev => ({
      ...prev,
      pull_quotes: prev.pull_quotes?.filter(q => q !== quote) || []
    }));
  };

  const addGalleryImage = () => {
    if (newGalleryImage && !formData.gallery_images?.includes(newGalleryImage)) {
      setFormData(prev => ({
        ...prev,
        gallery_images: [...(prev.gallery_images || []), newGalleryImage]
      }));
      setNewGalleryImage('');
    }
  };

  const removeGalleryImage = (image: string) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images?.filter(img => img !== image) || []
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/magazine')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Magazine
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Edit Article' : 'Create New Article'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Update your magazine article' : 'Create a new magazine article'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Switch 
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
              />
              <span>Auto-save</span>
            </div>
            <Button variant="outline" onClick={handlePreview} disabled={!isEditing}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => handleSave('draft')} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={() => handleSave('published')} disabled={saving}>
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter article title..."
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief summary of the article..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Write your article content..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Magazine-Specific Features */}
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Quote className="h-4 w-4" />
                      Pull Quotes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a pull quote..."
                        value={newPullQuote}
                        onChange={(e) => setNewPullQuote(e.target.value)}
                      />
                      <Button onClick={addPullQuote}>Add</Button>
                    </div>
                    <div className="space-y-2">
                      {formData.pull_quotes?.map((quote, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Quote className="h-3 w-3" />
                          <span className="flex-1 text-sm">{quote}</span>
                          <Button size="sm" variant="ghost" onClick={() => removePullQuote(quote)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sidebar Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      content={formData.sidebar_content || ''}
                      onChange={(content) => setFormData(prev => ({ ...prev, sidebar_content: content }))}
                      placeholder="Optional sidebar content..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="featured_image">Image URL</Label>
                      <Input
                        id="featured_image"
                        value={formData.featured_image}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="featured_image_alt">Alt Text</Label>
                      <Input
                        id="featured_image_alt"
                        value={formData.featured_image_alt}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured_image_alt: e.target.value }))}
                        placeholder="Describe the image..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Photo Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add gallery image URL..."
                        value={newGalleryImage}
                        onChange={(e) => setNewGalleryImage(e.target.value)}
                      />
                      <Button onClick={addGalleryImage}>Add</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.gallery_images?.map((image, index) => (
                        <div key={index} className="relative group">
                          <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-20 object-cover rounded" />
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => removeGalleryImage(image)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Youtube className="h-4 w-4" />
                      YouTube Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="youtube_video_id">YouTube Video ID</Label>
                      <Input
                        id="youtube_video_id"
                        value={formData.youtube_video_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, youtube_video_id: e.target.value }))}
                        placeholder="dQw4w9WgXcQ"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="seo_title">SEO Title</Label>
                      <Input
                        id="seo_title"
                        value={formData.seo_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                        placeholder="SEO-optimized title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="seo_description">SEO Description</Label>
                      <Textarea
                        id="seo_description"
                        value={formData.seo_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                        placeholder="SEO meta description..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>SEO Keywords</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Add keyword..."
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                        />
                        <Button onClick={addKeyword}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.seo_keywords?.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(keyword)}>
                            {keyword} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Article Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="issue_number">Issue Number</Label>
                      <Input
                        id="issue_number"
                        value={formData.issue_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, issue_number: e.target.value }))}
                        placeholder="2024-01"
                      />
                    </div>
                    <div>
                      <Label>Author Bio</Label>
                      <Textarea
                        placeholder="Brief author biography..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publication Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
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

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Featured Article</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_cover_story">Cover Story</Label>
                  <Switch
                    id="is_cover_story"
                    checked={formData.is_cover_story}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_cover_story: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="photo_essay">Photo Essay</Label>
                  <Switch
                    id="photo_essay"
                    checked={formData.photo_essay}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, photo_essay: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Article Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Section</Label>
                  <Select value={formData.section} onValueChange={(value) => setFormData(prev => ({ ...prev, section: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map(section => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Article Type</Label>
                  <Select value={formData.article_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, article_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {articleTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Categories</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
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
                        <Label htmlFor={`category-${category.id}`} className="text-sm">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                    />
                    <Button onClick={addTag}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tag_names.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagazineEditorPage;
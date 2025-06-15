import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Loader2, PlusCircle, FileText, History, Eye, Trash2, Edit } from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { staticContentService, StaticPage } from '@/services/staticContentService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PageFormState {
  id?: string;
  slug: string;
  title: string;
  content: string;
}

const StaticContentManagementPage: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();

  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentPageForm, setCurrentPageForm] = useState<PageFormState>({ slug: '', title: '', content: '' });
  const [previewContent, setPreviewContent] = useState('');
  const [selectedPageHistory, setSelectedPageHistory] = useState<StaticPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoadingPages(true);
    setError(null);
    try {
      const fetchedPages = await staticContentService.getPages();
      setPages(fetchedPages);
    } catch (err: any) {
      console.error('Failed to fetch static pages:', err);
      setError(err.message || 'Failed to fetch pages');
      toast.error(err.message || 'Failed to fetch pages');
    } finally {
      setLoadingPages(false);
    }
  }, []);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("You are not authorized to view this page.");
      navigate('/');
    } else if (isAdmin) {
      fetchPages();
    }
  }, [isAdmin, adminLoading, navigate, fetchPages]);

  const handleAddPage = () => {
    setCurrentPageForm({ slug: '', title: '', content: '' });
    setIsFormOpen(true);
  };

  const handleEditPage = (page: StaticPage) => {
    setCurrentPageForm({ id: page.id, slug: page.slug, title: page.title, content: page.content });
    setIsFormOpen(true);
  };

  const handleSavePage = async () => {
    setLoadingPages(true);
    try {
      if (currentPageForm.id) {
        const updatedPage = await staticContentService.updatePage(
          currentPageForm.id,
          currentPageForm.title,
          currentPageForm.slug,
          currentPageForm.content
        );
        toast.success(`Page '${updatedPage.title}' updated successfully.`);
      } else {
        const newPage = await staticContentService.createPage(
          currentPageForm.slug,
          currentPageForm.title,
          currentPageForm.content
        );
        toast.success(`Page '${newPage.title}' created successfully.`);
      }
      fetchPages();
      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(`Failed to save page: ${err.message}`);
      setError(err.message);
    } finally {
      setLoadingPages(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await staticContentService.deletePage(id);
      toast.success('Page deleted successfully.');
      fetchPages();
    } catch (err: any) {
      toast.error(`Failed to delete page: ${err.message}`);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreview = (content: string) => {
    setPreviewContent(content);
    setIsPreviewOpen(true);
  };

  const handleViewHistory = (page: StaticPage) => {
    setSelectedPageHistory(page);
    setIsHistoryOpen(true);
  };

  const handleRollback = async (pageId: string, version: number) => {
    if (!window.confirm(`Are you sure you want to rollback to version ${version}? This will overwrite the current content.`)) return;
    setLoadingPages(true);
    try {
      const rolledBackPage = await staticContentService.rollbackPage(pageId, version);
      toast.success(`Page rolled back to version ${version} successfully.`);
      onCloseHistory(); // Close history dialog after rollback
      fetchPages();
    } catch (err: any) {
      toast.error(`Failed to rollback page: ${err.message}`);
      setError(err.message);
    } finally {
      setLoadingPages(false);
    }
  };

  const onCloseHistory = () => {
    setIsHistoryOpen(false);
    setSelectedPageHistory(null);
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-primary text-xl">Checking authorization...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Content Management</h1>
          <p className="text-lg text-muted-foreground">Manage static website pages like About Us, Terms of Service, and FAQ.</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Static Pages</CardTitle>
            <Button onClick={handleAddPage}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add New Page
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-red-500 text-center py-4">
                Error: {error}
              </div>
            )}

            {loadingPages && pages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
                Loading pages...
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-8 w-8 mb-4" />
                No static pages found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>URL Slug</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>/p/{page.slug}</TableCell>
                      <TableCell>{page.lastModified}</TableCell>
                      <TableCell>{page.version}</TableCell>
                      <TableCell className="text-right flex space-x-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handlePreview(page.content)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditPage(page)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewHistory(page)}>
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePage(page.id)} disabled={isDeleting}>
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Page Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{currentPageForm.id ? 'Edit Page' : 'Add New Page'}</DialogTitle>
              <DialogDescription>Fill in the details for your static page.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input
                  id="title"
                  value={currentPageForm.title}
                  onChange={(e) => setCurrentPageForm({ ...currentPageForm, title: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">URL Slug</Label>
                <div className="col-span-3 flex items-center">
                  <span className="mr-1 text-muted-foreground">/p/</span>
                  <Input
                    id="slug"
                    value={currentPageForm.slug}
                    onChange={(e) => setCurrentPageForm({ ...currentPageForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-') })}
                    className="flex-grow"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right">Content</Label>
                {/* Placeholder for Rich Text Editor */}
                <Textarea
                  id="content"
                  value={currentPageForm.content}
                  onChange={(e) => setCurrentPageForm({ ...currentPageForm, content: e.target.value })}
                  className="col-span-3 min-h-[200px]"
                  placeholder="Enter page content (HTML or Markdown supported)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handlePreview(currentPageForm.content)}>
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Button>
              <Button onClick={handleSavePage} disabled={loadingPages || !currentPageForm.title || !currentPageForm.slug || !currentPageForm.content}>
                {loadingPages ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {currentPageForm.id ? 'Save Changes' : 'Create Page'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Content Preview</DialogTitle>
              <DialogDescription>How your content will appear on the website.</DialogDescription>
            </DialogHeader>
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: previewContent }} />
            <DialogFooter>
              <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={isHistoryOpen} onOpenChange={onCloseHistory}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Version History: {selectedPageHistory?.title}</DialogTitle>
              <DialogDescription>Review and rollback to previous versions of this page.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto pr-4">
              {selectedPageHistory?.history && selectedPageHistory.history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPageHistory.history.map((historyItem) => (
                      <TableRow key={historyItem.version}>
                        <TableCell>v{historyItem.version}</TableCell>
                        <TableCell>{historyItem.timestamp}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mr-2"
                            onClick={() => handlePreview(historyItem.content)}
                          >
                            <Eye className="h-4 w-4" /> Preview
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleRollback(selectedPageHistory.id, historyItem.version)}
                            disabled={loadingPages || historyItem.version === selectedPageHistory.version} // Cannot rollback to current version
                          >
                            <History className="h-4 w-4 mr-1" /> Rollback
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No history available for this page.</div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={onCloseHistory}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StaticContentManagementPage; 
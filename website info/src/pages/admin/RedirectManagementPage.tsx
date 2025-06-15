import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Trash2, ExternalLink, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RedirectRule {
  id: string;
  sourcePath: string;
  targetUrl: string;
  isExact: boolean;
  isActive: boolean;
}

const RedirectManagementPage = () => {
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRedirect, setNewRedirect] = useState<Omit<RedirectRule, 'id'>>({
    sourcePath: '',
    targetUrl: '',
    isExact: true,
    isActive: true
  });
  const { toast } = useToast();

  // Load redirects from localStorage on component mount
  useEffect(() => {
    const savedRedirects = localStorage.getItem('redirect_rules');
    if (savedRedirects) {
      try {
        setRedirects(JSON.parse(savedRedirects));
      } catch (error) {
        console.error('Failed to parse saved redirects:', error);
      }
    } else {
      // Default redirect for stepperslife.com/1
      setRedirects([
        {
          id: '1',
          sourcePath: '/1',
          targetUrl: 'https://stepperslifeapr30.vercel.app',
          isExact: true,
          isActive: true
        }
      ]);
    }
  }, []);

  // Save redirects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('redirect_rules', JSON.stringify(redirects));
  }, [redirects]);

  const handleAddRedirect = () => {
    if (!newRedirect.sourcePath || !newRedirect.targetUrl) {
      toast({
        title: 'Missing information',
        description: 'Please provide both source path and target URL',
        variant: 'destructive'
      });
      return;
    }

    // Ensure source path starts with /
    const sourcePath = newRedirect.sourcePath.startsWith('/') 
      ? newRedirect.sourcePath 
      : `/${newRedirect.sourcePath}`;
    
    // Add new redirect to list
    const newRedirectWithId: RedirectRule = {
      ...newRedirect,
      id: Date.now().toString(),
      sourcePath
    };
    
    setRedirects([...redirects, newRedirectWithId]);
    
    // Reset form and close dialog
    setNewRedirect({
      sourcePath: '',
      targetUrl: '',
      isExact: true,
      isActive: true
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: 'Redirect added',
      description: `New redirect from ${sourcePath} created successfully`
    });
  };

  const handleDeleteRedirect = (id: string) => {
    setRedirects(redirects.filter(redirect => redirect.id !== id));
    toast({
      title: 'Redirect deleted',
      description: 'The redirect rule has been removed'
    });
  };

  const handleToggleActive = (id: string) => {
    setRedirects(redirects.map(redirect => 
      redirect.id === id 
        ? { ...redirect, isActive: !redirect.isActive }
        : redirect
    ));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">URL Redirects</h1>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Redirect
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Redirect</DialogTitle>
              <DialogDescription>
                Create a new URL redirect rule. The source path should be relative to your domain.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sourcePath">Source Path</Label>
                <Input
                  id="sourcePath"
                  placeholder="/path-to-redirect"
                  value={newRedirect.sourcePath}
                  onChange={(e) => setNewRedirect({...newRedirect, sourcePath: e.target.value})}
                />
                <p className="text-sm text-muted-foreground">
                  Example: /events/2023 or /special-offer
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetUrl">Target URL</Label>
                <Input
                  id="targetUrl"
                  placeholder="https://destination.com/page"
                  value={newRedirect.targetUrl}
                  onChange={(e) => setNewRedirect({...newRedirect, targetUrl: e.target.value})}
                />
                <p className="text-sm text-muted-foreground">
                  The full URL where users will be redirected
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isExact"
                  checked={newRedirect.isExact}
                  onCheckedChange={(checked) => 
                    setNewRedirect({...newRedirect, isExact: checked === true})
                  }
                />
                <Label htmlFor="isExact">Exact path match only</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newRedirect.isActive}
                  onCheckedChange={(checked) => 
                    setNewRedirect({...newRedirect, isActive: checked})
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRedirect}>
                Add Redirect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Changes to redirects may take a few minutes to propagate. For external URLs, ensure you include the full URL with https://.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Redirect Rules</CardTitle>
          <CardDescription>
            Manage URL redirects for your domain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redirects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No redirects configured. Click "Add Redirect" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Source Path</TableHead>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Match Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirects.map(redirect => (
                  <TableRow key={redirect.id}>
                    <TableCell>
                      <Switch
                        checked={redirect.isActive}
                        onCheckedChange={() => handleToggleActive(redirect.id)}
                        aria-label={redirect.isActive ? "Active" : "Inactive"}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {redirect.sourcePath}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      <div className="flex items-center space-x-2">
                        <span className="truncate">{redirect.targetUrl}</span>
                        <a 
                          href={redirect.targetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                          aria-label="Open target URL"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      {redirect.isExact ? 'Exact' : 'Prefix'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRedirect(redirect.id)}
                        aria-label="Delete redirect"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RedirectManagementPage; 
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

type AuthSettings = {
  emailEnabled: boolean;
  googleEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string;
  appleEnabled: boolean;
  appleClientId: string;
  appleTeamId: string;
  appleKeyId: string;
  facebookEnabled: boolean;
  facebookAppId: string;
  facebookAppSecret: string;
};

const AuthenticationSettingsPage = () => {
  // Default state for authentication settings
  const [settings, setSettings] = useState<AuthSettings>({
    emailEnabled: true,
    googleEnabled: false,
    googleClientId: '',
    googleClientSecret: '',
    appleEnabled: false,
    appleClientId: '',
    appleTeamId: '',
    appleKeyId: '',
    facebookEnabled: false,
    facebookAppId: '',
    facebookAppSecret: '',
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch current settings on component mount
  useEffect(() => {
    // In a real app, this would fetch from your API
    // For demo purposes, we'll check if there's anything in localStorage
    const savedSettings = localStorage.getItem('auth_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Handle toggle changes
  const handleToggle = (key: keyof AuthSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle input changes
  const handleInputChange = (key: keyof AuthSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save settings
  const saveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll save to localStorage
      localStorage.setItem('auth_settings', JSON.stringify(settings));
      
      toast({
        title: "Settings saved",
        description: "Authentication settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your authentication settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Authentication Settings</h1>
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <div className="grid gap-6">
        {/* Email Authentication */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Email Authentication</CardTitle>
              <Switch 
                checked={settings.emailEnabled} 
                onCheckedChange={() => handleToggle('emailEnabled')}
              />
            </div>
            <CardDescription>
              Allow users to sign in with email and one-time verification code
            </CardDescription>
          </CardHeader>
        </Card>
        
        {/* Google Authentication */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Google Authentication</CardTitle>
              <Switch 
                checked={settings.googleEnabled} 
                onCheckedChange={() => handleToggle('googleEnabled')}
              />
            </div>
            <CardDescription>
              Allow users to sign in with their Google account
            </CardDescription>
          </CardHeader>
          {settings.googleEnabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-client-id">Client ID</Label>
                <Input 
                  id="google-client-id"
                  value={settings.googleClientId}
                  onChange={(e) => handleInputChange('googleClientId', e.target.value)}
                  placeholder="Google Client ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-client-secret">Client Secret</Label>
                <Input 
                  id="google-client-secret"
                  type="password"
                  value={settings.googleClientSecret}
                  onChange={(e) => handleInputChange('googleClientSecret', e.target.value)}
                  placeholder="Google Client Secret"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Redirect URI: {`${window.location.origin}/auth/google/callback`}</p>
                <p className="mt-2">
                  Set this redirect URI in your Google Cloud Console project.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Apple Authentication */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Apple Authentication</CardTitle>
              <Switch 
                checked={settings.appleEnabled} 
                onCheckedChange={() => handleToggle('appleEnabled')}
              />
            </div>
            <CardDescription>
              Allow users to sign in with their Apple ID
            </CardDescription>
          </CardHeader>
          {settings.appleEnabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apple-client-id">Client ID</Label>
                <Input 
                  id="apple-client-id"
                  value={settings.appleClientId}
                  onChange={(e) => handleInputChange('appleClientId', e.target.value)}
                  placeholder="Apple Client ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apple-team-id">Team ID</Label>
                <Input 
                  id="apple-team-id"
                  value={settings.appleTeamId}
                  onChange={(e) => handleInputChange('appleTeamId', e.target.value)}
                  placeholder="Apple Team ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apple-key-id">Key ID</Label>
                <Input 
                  id="apple-key-id"
                  value={settings.appleKeyId}
                  onChange={(e) => handleInputChange('appleKeyId', e.target.value)}
                  placeholder="Apple Key ID"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Redirect URI: {`${window.location.origin}/auth/apple/callback`}</p>
                <p className="mt-2">
                  Configure this in your Apple Developer account under "Sign in with Apple."
                </p>
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Facebook Authentication */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Facebook Authentication</CardTitle>
              <Switch 
                checked={settings.facebookEnabled} 
                onCheckedChange={() => handleToggle('facebookEnabled')}
              />
            </div>
            <CardDescription>
              Allow users to sign in with their Facebook account
            </CardDescription>
          </CardHeader>
          {settings.facebookEnabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook-app-id">App ID</Label>
                <Input 
                  id="facebook-app-id"
                  value={settings.facebookAppId}
                  onChange={(e) => handleInputChange('facebookAppId', e.target.value)}
                  placeholder="Facebook App ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook-app-secret">App Secret</Label>
                <Input 
                  id="facebook-app-secret"
                  type="password"
                  value={settings.facebookAppSecret}
                  onChange={(e) => handleInputChange('facebookAppSecret', e.target.value)}
                  placeholder="Facebook App Secret"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Redirect URI: {`${window.location.origin}/auth/facebook/callback`}</p>
                <p className="mt-2">
                  Configure this in your Facebook Developer account under OAuth settings.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      
      <div className="mt-8">
        <Separator className="my-4" />
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationSettingsPage; 
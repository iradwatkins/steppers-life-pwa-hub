import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface TestData {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

const DatabaseTest = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [data, setData] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>('Checking...');

  // Load data from database
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: testData, error: loadError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .limit(5);

      if (loadError) {
        throw loadError;
      }

      // Convert to our test format safely
      const safeData: TestData[] = Array.isArray(testData) ? testData.map(item => ({
        id: item.id || 'no-id',
        name: item.full_name || 'No Name',
        email: item.email || 'No Email', 
        created_at: item.created_at || 'No Date'
      })) : [];

      setData(safeData);
      console.log('✅ Data loaded successfully:', safeData);

    } catch (err) {
      console.error('❌ Load error:', err);
      setError(`Load failed: ${err.message}`);
      setData([]); // Ensure data is always an array
    } finally {
      setLoading(false);
    }
  };

  // Save data to database
  const saveData = async () => {
    if (!name || !email) {
      setError('Please fill in both name and email');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError('Please sign in first to save data to profiles table');
        return;
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      let newData;
      
      if (existingProfile) {
        // Profile exists, update it
        const { data: updatedData, error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: name,
            email: email,
          })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }
        newData = updatedData;
        console.log('✅ Profile updated successfully:', newData);
        
      } else {
        // Profile doesn't exist, create it
        const { data: insertedData, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            full_name: name,
            email: email,
            role: 'user'
          }])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }
        newData = insertedData;
        console.log('✅ Profile created successfully:', newData);
      }

      console.log('✅ Data saved successfully:', newData);
      setName('');
      setEmail('');
      
      // Reload data to show the new entry
      await loadData();

    } catch (err) {
      console.error('❌ Save error:', err);
      setError(`Save failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status
  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        setAuthStatus(`✅ Signed in as: ${user.email}`);
      } else {
        setAuthStatus('❌ Not signed in - Please log in to save data');
      }
    } catch (err) {
      setAuthStatus(`❌ Auth error: ${err.message}`);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
    checkAuth();
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Database Test - Save & Retrieve</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Input Form */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <Input
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="flex gap-4">
            <Button onClick={saveData} disabled={loading}>
              {loading ? 'Saving...' : 'Save to Database'}
            </Button>
            <Button variant="outline" onClick={loadData} disabled={loading}>
              {loading ? 'Loading...' : 'Reload Data'}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Status Display */}
          <div className="bg-blue-50 p-4 rounded">
            <p><strong>Status:</strong> {loading ? 'Processing...' : 'Ready'}</p>
            <p><strong>Records Found:</strong> {Array.isArray(data) ? data.length : 0}</p>
            <p><strong>Database:</strong> Supabase Connected</p>
            <p><strong>Authentication:</strong> {authStatus}</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Retrieved Data</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(data) && data.length > 0 ? (
            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.id} className="border p-3 rounded">
                  <p><strong>Name:</strong> {item.name}</p>
                  <p><strong>Email:</strong> {item.email}</p>
                  <p><strong>Created:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data found. Try saving some test data first.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseTest;
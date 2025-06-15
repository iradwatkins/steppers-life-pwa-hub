import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreSubmissionForm } from '@/components/stores/StoreSubmissionForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Users, 
  Star, 
  Shield, 
  CheckCircle, 
  Clock,
  Info,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const SubmitStore: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmissionSuccess = (storeId: string) => {
    // Navigate to success page or store management
    navigate('/dashboard?tab=stores', { 
      state: { 
        message: 'Store submitted successfully! We\'ll review it and get back to you soon.' 
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Store className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Submit Your Store to the Community Directory
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our growing community of steppers-owned businesses and connect with customers 
            who value recovery, community, and supporting local entrepreneurs.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-2 rounded-full w-fit">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Reach Community Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Connect with a supportive community that values recovery and personal growth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-2 rounded-full w-fit">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Build Your Reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Earn reviews and ratings from community members who appreciate quality
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-purple-100 p-2 rounded-full w-fit">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Safe & Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                All listings are moderated to ensure quality and appropriate content
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Process Information */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Submission Process</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Submit your store information using the form below</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Our team reviews your submission (usually within 24-48 hours)</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Once approved, your store goes live in the community directory</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Submission Guidelines
            </CardTitle>
            <CardDescription>
              Please ensure your store listing meets these requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-700">✅ What's Encouraged:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Recovery-friendly businesses</li>
                  <li>• Community-oriented services</li>
                  <li>• Local and small businesses</li>
                  <li>• Authentic business descriptions</li>
                  <li>• Professional store photos</li>
                  <li>• Accurate contact information</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-red-700">❌ What's Not Allowed:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Businesses that conflict with recovery values</li>
                  <li>• Alcohol-focused establishments</li>
                  <li>• Inappropriate or offensive content</li>
                  <li>• Fake or misleading information</li>
                  <li>• Spam or duplicate listings</li>
                  <li>• Pyramid schemes or MLM focused on recruitment</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Store Categories</CardTitle>
            <CardDescription>
              See what types of businesses are thriving in our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Fashion & Apparel</Badge>
              <Badge variant="secondary">Dance Gear & Equipment</Badge>
              <Badge variant="secondary">Health & Wellness</Badge>
              <Badge variant="secondary">Food & Beverage</Badge>
              <Badge variant="secondary">Beauty & Personal Care</Badge>
              <Badge variant="secondary">Lifestyle & Home</Badge>
              <Badge variant="secondary">Fitness & Recreation</Badge>
              <Badge variant="secondary">Professional Services</Badge>
              <Badge variant="secondary">Arts & Crafts</Badge>
              <Badge variant="secondary">Technology</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Don't see your category? You can suggest a new one during submission.
            </p>
          </CardContent>
        </Card>

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>
              Fill out the form below to submit your store to our community directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StoreSubmissionForm onSuccess={handleSubmissionSuccess} />
          </CardContent>
        </Card>

        {/* Footer Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-blue-900">Need Help?</h3>
              <p className="text-sm text-blue-700">
                If you have questions about submitting your store or need assistance with the form, 
                please contact our support team.
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <a href="mailto:support@stepperslife.com" className="text-blue-600 hover:underline">
                  Email Support
                </a>
                <span className="text-blue-400">•</span>
                <a href="/help" className="text-blue-600 hover:underline">
                  Help Center
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 
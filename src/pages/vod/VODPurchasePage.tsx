import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Clock, 
  Star, 
  Users, 
  Shield, 
  CreditCard,
  Check,
  ArrowLeft,
  Download,
  Smartphone,
  Tv,
  Monitor,
  Infinity,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { classesService } from '@/services/classesService';
import { paymentsService } from '@/services/paymentsService';
import { toast } from 'sonner';
import type { VODClass } from '@/types/classes';
import type { PaymentIntent } from '@/types/payments';

const VODPurchasePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [vodClass, setVodClass] = useState<VODClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPurchaseType, setSelectedPurchaseType] = useState<'lifetime' | 'rental'>('lifetime');
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadVODClass();
      checkExistingAccess();
    }
  }, [id]);

  const loadVODClass = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const result = await classesService.getVODClass(id);
      if (result.success && result.data) {
        setVodClass(result.data);
      } else {
        toast.error('VOD class not found');
        navigate('/vod');
      }
    } catch (error) {
      console.error('Error loading VOD class:', error);
      toast.error('Failed to load VOD class');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAccess = async () => {
    if (!user || !id) return;
    
    const accessCheck = await paymentsService.checkVODAccess(user.id, id);
    setHasAccess(accessCheck.hasAccess);
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      navigate('/login');
      return;
    }

    if (!vodClass) return;

    setPurchasing(true);
    try {
      const result = await paymentsService.createVODPurchase({
        vod_class_id: vodClass.id,
        purchase_type: selectedPurchaseType
      });

      if (result.success && result.data) {
        setPaymentIntent(result.data.payment_intent);
        // In production, this would redirect to Stripe Checkout or open payment modal
        toast.success('Redirecting to payment...');
        
        // Simulate successful payment for demo
        setTimeout(async () => {
          const paymentResult = await paymentsService.processPayment({
            payment_intent_id: result.data!.payment_intent.id,
            payment_method_id: 'pm_demo_card'
          });

          if (paymentResult.success) {
            toast.success('Purchase successful! You now have access to this VOD class.');
            setHasAccess(true);
          } else {
            toast.error(paymentResult.error || 'Payment failed');
          }
          setPurchasing(false);
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to create purchase');
        setPurchasing(false);
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error('Failed to process purchase');
      setPurchasing(false);
    }
  };

  const watchVOD = () => {
    navigate(`/vod/${id}/watch`);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="aspect-video bg-muted animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-40 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vodClass) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">VOD Class Not Found</h1>
          <Button onClick={() => navigate('/vod')}>
            Browse VOD Classes
          </Button>
        </div>
      </div>
    );
  }

  const lifetimePrice = vodClass.price;
  const rentalPrice = vodClass.price * 0.4; // 40% of lifetime price for 30-day rental

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Video Preview */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-8">
          <img 
            src={vodClass.thumbnail_url} 
            alt={vodClass.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 ml-1" fill="white" />
              </div>
              <p className="text-lg font-medium">Preview</p>
              <p className="text-sm opacity-90">Watch the first 5 minutes free</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={vodClass.level === 'beginner' ? 'secondary' : vodClass.level === 'intermediate' ? 'default' : 'destructive'}>
                  {vodClass.level}
                </Badge>
                <Badge variant="outline">{vodClass.category}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{vodClass.title}</h1>
              
              <div className="flex items-center gap-6 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(vodClass.video_duration_seconds)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{vodClass.rating?.toFixed(1)} ({vodClass.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{vodClass.total_purchases} students</span>
                </div>
              </div>

              <p className="text-lg leading-relaxed">{vodClass.description}</p>
            </div>

            {/* What You'll Learn */}
            {vodClass.what_youll_learn && vodClass.what_youll_learn.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {vodClass.what_youll_learn.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Instructor Info */}
            <Card>
              <CardHeader>
                <CardTitle>About Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-xl font-semibold">{vodClass.instructor_name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{vodClass.instructor_name}</h3>
                    <p className="text-muted-foreground">Professional Stepping Instructor</p>
                  </div>
                </div>
                {vodClass.instructor_bio && (
                  <p className="text-sm leading-relaxed">{vodClass.instructor_bio}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Purchase Panel */}
          <div className="space-y-6">
            {hasAccess ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">You Own This Class</CardTitle>
                  <CardDescription>
                    You have lifetime access to this VOD class
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={watchVOD} className="w-full" size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Watch Now
                  </Button>
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                      <Infinity className="h-4 w-4" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>Download available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>HD quality</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Options</CardTitle>
                  <CardDescription>
                    Choose how you'd like to access this class
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Purchase Type Selection */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedPurchaseType('lifetime')}
                      className={`w-full p-4 border rounded-lg text-left transition-colors ${
                        selectedPurchaseType === 'lifetime' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedPurchaseType === 'lifetime' 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`} />
                          <span className="font-semibold">Lifetime Access</span>
                        </div>
                        <span className="font-bold text-lg">${lifetimePrice}</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Infinity className="h-3 w-3" />
                          <span>Watch forever</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-3 w-3" />
                          <span>Download for offline viewing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor className="h-3 w-3" />
                          <span>HD quality</span>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedPurchaseType('rental')}
                      className={`w-full p-4 border rounded-lg text-left transition-colors ${
                        selectedPurchaseType === 'rental' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedPurchaseType === 'rental' 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`} />
                          <span className="font-semibold">30-Day Rental</span>
                        </div>
                        <span className="font-bold text-lg">${rentalPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Access for 30 days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-3 w-3" />
                          <span>Stream on any device</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tv className="h-3 w-3" />
                          <span>Standard quality</span>
                        </div>
                      </div>
                    </button>
                  </div>

                  <Separator />

                  {/* Purchase Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Price</span>
                      <span className="font-semibold">
                        ${selectedPurchaseType === 'lifetime' ? lifetimePrice : rentalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Processing fee</span>
                      <span>$0.30</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>
                        ${(selectedPurchaseType === 'lifetime' ? lifetimePrice : rentalPrice + 0.30).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full"
                    size="lg"
                  >
                    {purchasing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Purchase Now
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield className="h-3 w-3" />
                      <span>Secure payment with Stripe</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>70% goes directly to the instructor</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Choose SteppersLife VOD?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Learn from certified instructors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Watch at your own pace</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Access on all devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Community support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>30-day money-back guarantee</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VODPurchasePage;
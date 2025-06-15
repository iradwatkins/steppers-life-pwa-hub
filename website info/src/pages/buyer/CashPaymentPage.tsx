import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ArrowLeft, QrCode, Share2, Copy, DollarSign, User, MapPin, Calendar, Clock, Info, CheckCircle, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  ticketTypes: TicketType[];
  organizer: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
  description?: string;
}

interface CashPaymentRequest {
  id: string;
  eventId: string;
  code: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  buyerName: string;
  buyerEmail: string;
  status: 'Generated' | 'Reserved' | 'Paid' | 'Expired';
  expiryTime: string;
  generatedAt: string;
  qrCodeDataUrl?: string;
}

// Mock event data
const mockEvent: Event = {
  id: 'evt001',
  title: 'Steppers Life Annual Dance Competition',
  description: 'The biggest stepping competition of the year featuring teams from across the country.',
  date: '2025-02-15',
  time: '19:00',
  location: 'Chicago Cultural Center, 78 E Washington St, Chicago, IL',
  organizer: 'Chicago Step Team Association',
  ticketTypes: [
    {
      id: 'general',
      name: 'General Admission',
      price: 50.00,
      available: 150,
      description: 'Standard seating with great view of the stage'
    },
    {
      id: 'vip',
      name: 'VIP Package',
      price: 120.00,
      available: 25,
      description: 'Premium seating, meet & greet, and exclusive merchandise'
    },
    {
      id: 'student',
      name: 'Student Discount',
      price: 35.00,
      available: 50,
      description: 'Student pricing with valid ID (verification required)'
    }
  ]
};

const CashPaymentPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event] = useState<Event>(mockEvent);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: ''
  });
  const [generatedCode, setGeneratedCode] = useState<CashPaymentRequest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const totalAmount = selectedTicketType ? selectedTicketType.price * quantity : 0;

  useEffect(() => {
    if (generatedCode && generatedCode.code) {
      generateQRCode(generatedCode.code);
    }
  }, [generatedCode]);

  const generateQRCode = async (code: string) => {
    try {
      const url = await QRCode.toDataURL(code, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const generateCashPaymentCode = async () => {
    if (!selectedTicketType || !buyerInfo.name.trim() || !buyerInfo.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newCode: CashPaymentRequest = {
      id: `cash${Date.now()}`,
      eventId: eventId || 'evt001',
      code: `STEP-2025-${String(Date.now()).slice(-3)}`,
      ticketType: selectedTicketType.name,
      quantity,
      totalAmount,
      buyerName: buyerInfo.name,
      buyerEmail: buyerInfo.email,
      status: 'Generated',
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      generatedAt: new Date().toISOString()
    };

    setGeneratedCode(newCode);
    setIsGenerating(false);
  };

  const copyCodeToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code);
      alert('Payment code copied to clipboard!');
    }
  };

  const shareCode = () => {
    if (generatedCode && navigator.share) {
      navigator.share({
        title: 'Cash Payment Code',
        text: `My payment code for ${event.title}: ${generatedCode.code}`,
        url: window.location.href
      });
    } else if (generatedCode) {
      copyCodeToClipboard();
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `payment-code-${generatedCode?.code}.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  if (generatedCode) {
    return (
      <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" onClick={() => navigate(`/event/${eventId}`)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event
          </Button>

          <Card className="bg-surface-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-text-primary flex items-center justify-center">
                <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                Payment Code Generated!
              </CardTitle>
              <CardDescription>
                Show this code to the event organizer to complete your cash payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Display */}
              <div className="text-center space-y-4">
                {qrCodeUrl && (
                  <div className="bg-white p-4 rounded-lg shadow-inner mx-auto inline-block">
                    <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48 mx-auto" />
                  </div>
                )}
                
                <div className="bg-background-main p-4 rounded-lg">
                  <p className="text-sm text-text-tertiary mb-2">Payment Code</p>
                  <p className="text-3xl font-mono font-bold text-text-primary tracking-wider">
                    {generatedCode.code}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={copyCodeToClipboard} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                  </Button>
                  <Button onClick={shareCode} variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  {qrCodeUrl && (
                    <Button onClick={downloadQRCode} variant="outline">
                      <QrCode className="mr-2 h-4 w-4" />
                      Download QR
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Payment Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-tertiary">Event:</span>
                    <p className="font-medium">{event.title}</p>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Ticket Type:</span>
                    <p className="font-medium">{generatedCode.ticketType}</p>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Quantity:</span>
                    <p className="font-medium">{generatedCode.quantity} ticket(s)</p>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Total Amount:</span>
                    <p className="font-medium text-lg">${generatedCode.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Buyer:</span>
                    <p className="font-medium">{generatedCode.buyerName}</p>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Expires:</span>
                    <p className="font-medium">{new Date(generatedCode.expiryTime).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Next Steps:</h4>
                    <ul className="space-y-1 text-blue-700 dark:text-blue-200">
                      <li>1. Bring cash in the exact amount: ${generatedCode.totalAmount.toFixed(2)}</li>
                      <li>2. Show this code (or QR code) to the event organizer</li>
                      <li>3. Complete payment and receive your tickets</li>
                      <li>4. Code expires in 24 hours if not used</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm text-amber-700 dark:text-amber-200">
                      <strong>Status:</strong> Payment pending - awaiting cash payment verification
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" onClick={() => navigate(`/event/${eventId}`)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event
        </Button>

        <Card className="bg-surface-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <DollarSign className="mr-2 h-6 w-6 text-brand-primary" />
              Cash Payment Setup
            </CardTitle>
            <CardDescription>
              Generate a payment code to pay with cash at the venue
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Event Info */}
        <Card className="bg-surface-card mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{event.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-text-tertiary" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-text-tertiary" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center space-x-2 sm:col-span-2">
                <MapPin className="h-4 w-4 text-text-tertiary" />
                <span>{event.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Selection */}
        <Card className="bg-surface-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-text-primary">Select Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.ticketTypes.map((ticketType) => (
              <div
                key={ticketType.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTicketType?.id === ticketType.id
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border-default hover:border-brand-primary/50'
                }`}
                onClick={() => setSelectedTicketType(ticketType)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-text-primary">{ticketType.name}</h4>
                  <div className="text-right">
                    <p className="text-lg font-bold text-text-primary">${ticketType.price.toFixed(2)}</p>
                    <p className="text-xs text-text-tertiary">{ticketType.available} available</p>
                  </div>
                </div>
                {ticketType.description && (
                  <p className="text-sm text-text-secondary">{ticketType.description}</p>
                )}
              </div>
            ))}

            {selectedTicketType && (
              <div className="pt-4 border-t">
                <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(selectedTicketType.available, quantity + 1))}
                    disabled={quantity >= selectedTicketType.available}
                  >
                    +
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-background-main rounded-md">
                  <p className="text-lg font-semibold">
                    Total: ${totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buyer Information */}
        <Card className="bg-surface-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-text-primary">Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={buyerInfo.name}
                onChange={(e) => setBuyerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={buyerInfo.email}
                onChange={(e) => setBuyerInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Card className="bg-surface-card">
          <CardContent className="p-6">
            <Button
              onClick={generateCashPaymentCode}
              disabled={!selectedTicketType || !buyerInfo.name.trim() || !buyerInfo.email.trim() || isGenerating}
              className="w-full bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Code...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-5 w-5" />
                  Generate Cash Payment Code
                </>
              )}
            </Button>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-text-tertiary">
                By generating a payment code, you agree to pay the full amount in cash within 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashPaymentPage; 
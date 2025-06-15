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
import { ArrowLeft, QrCode, Search, DollarSign, User, Clock, CheckCircle, XCircle, Copy, RefreshCw } from 'lucide-react';

interface CashPaymentCode {
  id: string;
  code: string;
  eventId: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  buyerName?: string;
  buyerEmail?: string;
  status: 'Generated' | 'Reserved' | 'Paid' | 'Expired';
  expiryTime: string;
  generatedAt: string;
  paidAt?: string;
}

// Mock data for cash payment codes
const mockCashCodes: CashPaymentCode[] = [
  {
    id: 'cash001',
    code: 'STEP-2025-001',
    eventId: 'evt001',
    ticketType: 'General Admission',
    quantity: 2,
    totalAmount: 100.00,
    buyerName: 'Sarah Miller',
    buyerEmail: 'sarah.miller@example.com',
    status: 'Reserved',
    expiryTime: '2025-01-15T18:00:00Z',
    generatedAt: '2025-01-10T14:30:00Z'
  },
  {
    id: 'cash002',
    code: 'STEP-2025-002',
    eventId: 'evt001',
    ticketType: 'VIP Ticket',
    quantity: 1,
    totalAmount: 120.00,
    status: 'Generated',
    expiryTime: '2025-01-14T20:00:00Z',
    generatedAt: '2025-01-10T16:15:00Z'
  },
  {
    id: 'cash003',
    code: 'STEP-2025-003',
    eventId: 'evt001',
    ticketType: 'General Admission',
    quantity: 1,
    totalAmount: 50.00,
    buyerName: 'Mike Johnson',
    buyerEmail: 'mike.johnson@example.com',
    status: 'Paid',
    expiryTime: '2025-01-13T19:00:00Z',
    generatedAt: '2025-01-09T10:20:00Z',
    paidAt: '2025-01-09T15:45:00Z'
  }
];

const EventCashPaymentPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [cashCodes, setCashCodes] = useState<CashPaymentCode[]>(mockCashCodes);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [newCodeData, setNewCodeData] = useState({
    ticketType: '',
    quantity: 1,
    pricePerTicket: 50
  });

  const filteredCodes = cashCodes.filter(code => 
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateNewCode = () => {
    const newCode: CashPaymentCode = {
      id: `cash${Date.now()}`,
      code: `STEP-2025-${String(Date.now()).slice(-3)}`,
      eventId: eventId || 'evt001',
      ticketType: newCodeData.ticketType,
      quantity: newCodeData.quantity,
      totalAmount: newCodeData.quantity * newCodeData.pricePerTicket,
      status: 'Generated',
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      generatedAt: new Date().toISOString()
    };

    setCashCodes(prev => [newCode, ...prev]);
    setIsGenerateDialogOpen(false);
    setNewCodeData({ ticketType: '', quantity: 1, pricePerTicket: 50 });
    alert(`Cash payment code generated: ${newCode.code}`);
  };

  const verifyAndMarkPaid = () => {
    if (!verificationCode.trim()) {
      alert('Please enter a code to verify');
      return;
    }

    const codeToVerify = cashCodes.find(code => 
      code.code.toLowerCase() === verificationCode.toLowerCase()
    );

    if (!codeToVerify) {
      alert('Code not found');
      return;
    }

    if (codeToVerify.status === 'Paid') {
      alert('This code has already been used');
      return;
    }

    if (codeToVerify.status === 'Expired') {
      alert('This code has expired');
      return;
    }

    setCashCodes(prev => 
      prev.map(code => 
        code.id === codeToVerify.id 
          ? { ...code, status: 'Paid' as const, paidAt: new Date().toISOString() }
          : code
      )
    );

    setVerificationCode('');
    alert(`Payment verified for code ${codeToVerify.code}! Tickets issued.`);
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Code ${code} copied to clipboard`);
  };

  const getStatusBadgeVariant = (status: CashPaymentCode['status']) => {
    switch (status) {
      case 'Generated': return 'secondary';
      case 'Reserved': return 'default';
      case 'Paid': return 'success';
      case 'Expired': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: CashPaymentCode['status']) => {
    switch (status) {
      case 'Generated': return <QrCode className="h-3 w-3" />;
      case 'Reserved': return <Clock className="h-3 w-3" />;
      case 'Paid': return <CheckCircle className="h-3 w-3" />;
      case 'Expired': return <XCircle className="h-3 w-3" />;
      default: return <QrCode className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate(`/organizer/event/${eventId}/manage`)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Event
        </Button>

        <Card className="bg-surface-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <DollarSign className="mr-2 h-6 w-6 text-brand-primary" />
              Cash Payment Management
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Generate codes for cash payments and verify transactions on-site.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Action Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Generate Code Section */}
          <Card className="bg-surface-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-text-primary">Generate Payment Code</CardTitle>
              <CardDescription>Create a new code for cash payment collection</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary">
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate New Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Cash Payment Code</DialogTitle>
                    <DialogDescription>
                      Create a unique code for cash payment collection
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ticket-type">Ticket Type</Label>
                      <Input
                        id="ticket-type"
                        value={newCodeData.ticketType}
                        onChange={(e) => setNewCodeData(prev => ({ ...prev, ticketType: e.target.value }))}
                        placeholder="e.g., General Admission, VIP"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={newCodeData.quantity}
                          onChange={(e) => setNewCodeData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price per Ticket</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newCodeData.pricePerTicket}
                          onChange={(e) => setNewCodeData(prev => ({ ...prev, pricePerTicket: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    <div className="bg-background-main p-3 rounded-md">
                      <p className="text-sm font-medium">Total Amount: ${(newCodeData.quantity * newCodeData.pricePerTicket).toFixed(2)}</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={generateNewCode} disabled={!newCodeData.ticketType.trim()}>
                      Generate Code
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Verify Payment Section */}
          <Card className="bg-surface-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-text-primary">Verify Payment</CardTitle>
              <CardDescription>Enter code to verify cash payment received</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="verification-code">Payment Code</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter payment code (e.g., STEP-2025-001)"
                />
              </div>
              <Button 
                onClick={verifyAndMarkPaid} 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!verificationCode.trim()}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify & Mark as Paid
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-surface-card mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-tertiary" />
              <Input
                placeholder="Search by code, buyer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Codes List */}
        {filteredCodes.length === 0 ? (
          <Card className="bg-surface-card">
            <CardContent className="p-8 text-center text-text-secondary">
              <DollarSign className="mx-auto h-12 w-12 mb-4 text-text-tertiary" />
              <p>No payment codes found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCodes.map((code) => (
              <Card key={code.id} className="bg-surface-card border-border-default">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getStatusBadgeVariant(code.status)} className="flex items-center space-x-1">
                            {getStatusIcon(code.status)}
                            <span>{code.status}</span>
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-lg font-semibold text-text-primary">{code.code}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCodeToClipboard(code.code)}
                              className="p-1 h-6 w-6"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-text-primary flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {code.totalAmount.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-text-tertiary">Ticket: </span>
                          <span>{code.ticketType} (x{code.quantity})</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Generated: </span>
                          <span>{new Date(code.generatedAt).toLocaleDateString()}</span>
                        </div>
                        {code.buyerName && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-text-tertiary" />
                            <span>{code.buyerName}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-text-tertiary">Expires: </span>
                          <span>{new Date(code.expiryTime).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {code.paidAt && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                          <p className="text-sm text-green-700 dark:text-green-400">
                            <CheckCircle className="inline h-4 w-4 mr-1" />
                            Payment verified on {new Date(code.paidAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {code.status === 'Generated' || code.status === 'Reserved' ? (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-6">
                        <Button 
                          onClick={() => {
                            setVerificationCode(code.code);
                            verifyAndMarkPaid();
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Paid
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCashPaymentPage; 
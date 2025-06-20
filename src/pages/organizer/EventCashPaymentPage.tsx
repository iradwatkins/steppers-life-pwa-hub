import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  QrCode,
  RefreshCw,
  AlertTriangle,
  Copy,
  Eye,
  Plus,
  Timer,
  Users,
  TrendingUp
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CashPaymentCode {
  id: string;
  code: string;
  event_id: string;
  buyer_name: string;
  buyer_email: string;
  amount: number;
  ticket_quantity: number;
  status: 'pending' | 'verified' | 'expired' | 'used';
  created_at: string;
  expires_at: string;
  verified_at?: string;
  notes?: string;
}

interface CashPaymentStats {
  total_codes: number;
  pending_codes: number;
  verified_codes: number;
  expired_codes: number;
  total_amount_pending: number;
  total_amount_verified: number;
}

export default function EventCashPaymentPage() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [codes, setCodes] = useState<CashPaymentCode[]>([]);
  const [stats, setStats] = useState<CashPaymentStats>({
    total_codes: 0,
    pending_codes: 0,
    verified_codes: 0,
    expired_codes: 0,
    total_amount_pending: 0,
    total_amount_verified: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCode, setSelectedCode] = useState<CashPaymentCode | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for development
  useEffect(() => {
    const mockCodes: CashPaymentCode[] = [
      {
        id: 'cp_001',
        code: '12345',
        event_id: eventId || 'evt_001',
        buyer_name: 'Maria Garcia',
        buyer_email: 'maria.garcia@email.com',
        amount: 45.00,
        ticket_quantity: 1,
        status: 'pending',
        created_at: '2024-06-19T10:30:00Z',
        expires_at: '2024-06-19T14:30:00Z',
        notes: 'Beginner Salsa Class - Single ticket'
      },
      {
        id: 'cp_002',
        code: '67890',
        event_id: eventId || 'evt_001',
        buyer_name: 'Carlos Rodriguez',
        buyer_email: 'carlos.rodriguez@email.com',
        amount: 90.00,
        ticket_quantity: 2,
        status: 'verified',
        created_at: '2024-06-19T09:15:00Z',
        expires_at: '2024-06-19T13:15:00Z',
        verified_at: '2024-06-19T11:45:00Z',
        notes: 'Advanced Bachata Workshop - Couple tickets'
      },
      {
        id: 'cp_003',
        code: '54321',
        event_id: eventId || 'evt_001',
        buyer_name: 'Ana Martinez',
        buyer_email: 'ana.martinez@email.com',
        amount: 35.00,
        ticket_quantity: 1,
        status: 'expired',
        created_at: '2024-06-18T16:00:00Z',
        expires_at: '2024-06-18T20:00:00Z',
        notes: 'Merengue Fundamentals - Single ticket'
      },
      {
        id: 'cp_004',
        code: '98765',
        event_id: eventId || 'evt_001',
        buyer_name: 'Luis Fernandez',
        buyer_email: 'luis.fernandez@email.com',
        amount: 120.00,
        ticket_quantity: 3,
        status: 'pending',
        created_at: '2024-06-19T11:00:00Z',
        expires_at: '2024-06-19T15:00:00Z',
        notes: 'Latin Dance Intensive - Group tickets'
      }
    ];

    const mockStats: CashPaymentStats = {
      total_codes: 4,
      pending_codes: 2,
      verified_codes: 1,
      expired_codes: 1,
      total_amount_pending: 165.00,
      total_amount_verified: 90.00
    };

    setCodes(mockCodes);
    setStats(mockStats);
    setLoading(false);
  }, [eventId]);

  const filteredCodes = codes.filter(code => {
    const matchesSearch = code.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.buyer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.code.includes(searchTerm) ||
                         (code.notes && code.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const generatePaymentCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 5) {
      alert('Please enter a valid 5-digit code');
      return;
    }

    try {
      // Find the code to verify
      const codeToVerify = codes.find(c => c.code === verificationCode && c.status === 'pending');
      
      if (!codeToVerify) {
        alert('Invalid code or code already processed');
        return;
      }

      // Check if expired
      const now = new Date();
      const expiresAt = new Date(codeToVerify.expires_at);
      
      if (now > expiresAt) {
        alert('This code has expired');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedCodes = codes.map(code => 
        code.code === verificationCode 
          ? {
              ...code,
              status: 'verified' as const,
              verified_at: new Date().toISOString()
            }
          : code
      );
      
      setCodes(updatedCodes);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending_codes: prev.pending_codes - 1,
        verified_codes: prev.verified_codes + 1,
        total_amount_pending: prev.total_amount_pending - codeToVerify.amount,
        total_amount_verified: prev.total_amount_verified + codeToVerify.amount
      }));

      setVerificationCode('');
      setShowVerifyDialog(false);
      alert(`Payment verified! ${codeToVerify.buyer_name} - $${codeToVerify.amount.toFixed(2)}`);
    } catch (error) {
      console.error('Failed to verify code:', error);
      alert('Failed to verify code. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusBadge = (status: CashPaymentCode['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'used':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="w-3 h-3 mr-1" />Used</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cash Payment Management</h1>
          <p className="text-gray-600 mt-1">Verify cash payment codes and manage transactions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Cash Payment Code</DialogTitle>
                <DialogDescription>
                  Enter the 5-digit code provided by the customer to verify their cash payment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="verifyCode" className="text-sm font-medium">
                    Payment Code
                  </Label>
                  <Input
                    id="verifyCode"
                    placeholder="Enter 5-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 5))}
                    maxLength={5}
                    className="text-center text-2xl font-mono tracking-widest"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleVerifyCode}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={verificationCode.length !== 5}
                  >
                    Verify Payment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Codes</p>
                <p className="text-2xl font-bold">{stats.total_codes}</p>
              </div>
              <QrCode className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_codes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Amount Pending</p>
                <p className="text-2xl font-bold">${stats.total_amount_pending.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Amount Verified</p>
                <p className="text-2xl font-bold text-green-600">${stats.total_amount_verified.toFixed(2)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, code, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Payment Codes ({filteredCodes.length})</CardTitle>
          <CardDescription>
            Manage and verify cash payment codes from customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time Remaining</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold">{code.code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{code.buyer_name}</p>
                      <p className="text-sm text-gray-600">{code.buyer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${code.amount.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{code.ticket_quantity} ticket{code.ticket_quantity > 1 ? 's' : ''}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(code.status)}
                  </TableCell>
                  <TableCell>
                    {code.status === 'pending' ? (
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">{getTimeRemaining(code.expires_at)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{new Date(code.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-600">{new Date(code.created_at).toLocaleTimeString()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Payment Code Details</DialogTitle>
                            <DialogDescription>
                              Complete information for cash payment code
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                <QRCode 
                                  value={`CASH_PAYMENT:${code.code}:${code.amount}:${code.event_id}`}
                                  size={120}
                                  className="mx-auto"
                                />
                              </div>
                              <p className="font-mono text-2xl font-bold">{code.code}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Customer</Label>
                              <p className="text-sm">{code.buyer_name} ({code.buyer_email})</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Amount</Label>
                              <p className="text-sm font-medium">${code.amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Tickets</Label>
                              <p className="text-sm">{code.ticket_quantity} ticket{code.ticket_quantity > 1 ? 's' : ''}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <div className="mt-1">{getStatusBadge(code.status)}</div>
                            </div>
                            {code.notes && (
                              <div>
                                <Label className="text-sm font-medium">Notes</Label>
                                <p className="text-sm bg-gray-50 p-2 rounded">{code.notes}</p>
                              </div>
                            )}
                            {code.status === 'pending' && (
                              <div>
                                <Label className="text-sm font-medium">Expires</Label>
                                <p className="text-sm text-orange-600 font-medium">
                                  {new Date(code.expires_at).toLocaleString()}
                                  <br />
                                  <span className="text-xs">({getTimeRemaining(code.expires_at)})</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {code.status === 'pending' && (
                        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200"
                              onClick={() => setSelectedCode(code)}
                            >
                              <QrCode className="w-4 h-4 mr-1" />
                              QR
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCodes.length === 0 && (
            <div className="text-center py-8">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment codes found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No cash payment codes have been generated yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
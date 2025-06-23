import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Eye,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Receipt,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { paymentsService } from '@/services/paymentsService';
import { toast } from 'sonner';
import type { PayoutEarnings, RevenueReport, InstructorPayout } from '@/types/payments';

const EarningsPage = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<PayoutEarnings | null>(null);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [payouts, setPayouts] = useState<InstructorPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (user) {
      loadEarningsData();
    }
  }, [user, selectedPeriod]);

  const loadEarningsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load earnings summary
      const earningsData = await paymentsService.getInstructorEarnings(user.id);
      setEarnings(earningsData);

      // Load revenue report for selected period
      const revenueData = await paymentsService.getInstructorRevenueReport(user.id, selectedPeriod);
      if (revenueData.success) {
        setRevenueReport(revenueData.data!);
      }

      // Load recent payouts (mock data for demo)
      setPayouts(mockPayouts);
    } catch (error) {
      console.error('Error loading earnings data:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const generatePeriodOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  if (loading) {
    return (
      <div className=\"container mx-auto px-4 py-8\">
        <div className=\"space-y-6\">
          <div className=\"h-8 bg-muted animate-pulse rounded\" />
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
            {[...Array(3)].map((_, i) => (
              <div key={i} className=\"h-32 bg-muted animate-pulse rounded\" />
            ))}
          </div>
          <div className=\"h-96 bg-muted animate-pulse rounded\" />
        </div>
      </div>
    );
  }

  return (
    <div className=\"container mx-auto px-4 py-8\">
      <div className=\"space-y-8\">
        {/* Header */}
        <div className=\"flex items-center justify-between\">
          <div>
            <h1 className=\"text-3xl font-bold\">Earnings & Payouts</h1>
            <p className=\"text-muted-foreground\">
              Track your VOD sales and manage payout preferences
            </p>
          </div>
          
          <div className=\"flex items-center gap-4\">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className=\"w-48\">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generatePeriodOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant=\"outline\">
              <Download className=\"h-4 w-4 mr-2\" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6\">
          <Card>
            <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
              <CardTitle className=\"text-sm font-medium\">Available Balance</CardTitle>
              <DollarSign className=\"h-4 w-4 text-muted-foreground\" />
            </CardHeader>
            <CardContent>
              <div className=\"text-2xl font-bold text-green-600\">
                {formatCurrency(earnings?.total_available_amount || 0)}
              </div>
              <p className=\"text-xs text-muted-foreground\">
                Ready for payout
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
              <CardTitle className=\"text-sm font-medium\">Pending Earnings</CardTitle>
              <Clock className=\"h-4 w-4 text-muted-foreground\" />
            </CardHeader>
            <CardContent>
              <div className=\"text-2xl font-bold text-blue-600\">
                {formatCurrency(earnings?.total_pending_amount || 0)}
              </div>
              <p className=\"text-xs text-muted-foreground\">
                Processing period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
              <CardTitle className=\"text-sm font-medium\">This Month</CardTitle>
              <TrendingUp className=\"h-4 w-4 text-muted-foreground\" />
            </CardHeader>
            <CardContent>
              <div className=\"text-2xl font-bold\">
                {formatCurrency(earnings?.current_period_earnings || 0)}
              </div>
              <p className=\"text-xs text-muted-foreground\">
                {earnings?.current_period_purchases || 0} sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
              <CardTitle className=\"text-sm font-medium\">Lifetime Earnings</CardTitle>
              <BarChart3 className=\"h-4 w-4 text-muted-foreground\" />
            </CardHeader>
            <CardContent>
              <div className=\"text-2xl font-bold\">
                {formatCurrency(earnings?.lifetime_earnings || 0)}
              </div>
              <p className=\"text-xs text-muted-foreground\">
                {earnings?.lifetime_purchases || 0} total sales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Next Payout Info */}
        {earnings?.next_payout_date && (
          <Card>
            <CardHeader>
              <CardTitle className=\"flex items-center gap-2\">
                <Calendar className=\"h-5 w-5\" />
                Next Automatic Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"font-semibold\">
                    {new Date(earnings.next_payout_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className=\"text-sm text-muted-foreground\">
                    Estimated payout amount: {formatCurrency(earnings.total_available_amount)}
                  </p>
                </div>
                <Button variant=\"outline\">
                  <Settings className=\"h-4 w-4 mr-2\" />
                  Manage Payout Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue=\"overview\" className=\"space-y-6\">
          <TabsList>
            <TabsTrigger value=\"overview\">Overview</TabsTrigger>
            <TabsTrigger value=\"transactions\">Transactions</TabsTrigger>
            <TabsTrigger value=\"payouts\">Payouts</TabsTrigger>
            <TabsTrigger value=\"analytics\">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value=\"overview\" className=\"space-y-6\">
            {revenueReport && (
              <>
                {/* Revenue Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Breakdown - {new Date(selectedPeriod).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">
                      <div className=\"space-y-2\">
                        <p className=\"text-sm font-medium text-muted-foreground\">Gross Revenue</p>
                        <p className=\"text-2xl font-bold\">{formatCurrency(revenueReport.total_revenue)}</p>
                      </div>
                      <div className=\"space-y-2\">
                        <p className=\"text-sm font-medium text-muted-foreground\">Your Commission (70%)</p>
                        <p className=\"text-2xl font-bold text-green-600\">{formatCurrency(revenueReport.total_commission)}</p>
                      </div>
                      <div className=\"space-y-2\">
                        <p className=\"text-sm font-medium text-muted-foreground\">Platform Fee (30%)</p>
                        <p className=\"text-2xl font-bold text-gray-600\">{formatCurrency(revenueReport.platform_fees)}</p>
                      </div>
                      <div className=\"space-y-2\">
                        <p className=\"text-sm font-medium text-muted-foreground\">Processing Fees</p>
                        <p className=\"text-2xl font-bold text-gray-600\">{formatCurrency(revenueReport.processing_fees)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Selling Classes */}
                {revenueReport.top_selling_classes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Selling Classes This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className=\"space-y-4\">
                        {revenueReport.top_selling_classes.map((classData, index) => (
                          <div key={classData.vod_class_id} className=\"flex items-center justify-between p-4 border rounded-lg\">
                            <div className=\"flex items-center gap-4\">
                              <div className=\"w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold\">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className=\"font-semibold\">{classData.title}</h3>
                                <p className=\"text-sm text-muted-foreground\">{classData.purchases} sales</p>
                              </div>
                            </div>
                            <div className=\"text-right\">
                              <p className=\"font-semibold\">{formatCurrency(classData.revenue)}</p>
                              <p className=\"text-sm text-muted-foreground\">
                                {formatCurrency(classData.revenue * 0.7)} commission
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value=\"transactions\">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Individual VOD sales and their commission breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-4\">
                  {mockTransactions.map((transaction) => (
                    <div key={transaction.id} className=\"flex items-center justify-between p-4 border rounded-lg\">
                      <div className=\"flex items-center gap-4\">
                        <div className=\"w-10 h-10 bg-green-100 rounded-full flex items-center justify-center\">
                          <CreditCard className=\"h-5 w-5 text-green-600\" />
                        </div>
                        <div>
                          <h3 className=\"font-semibold\">{transaction.vod_title}</h3>
                          <p className=\"text-sm text-muted-foreground\">
                            Purchased by {transaction.customer_name}
                          </p>
                          <p className=\"text-xs text-muted-foreground\">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className=\"text-right\">
                        <p className=\"font-semibold\">{formatCurrency(transaction.sale_price)}</p>
                        <p className=\"text-sm text-green-600\">
                          +{formatCurrency(transaction.commission)} commission
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value=\"payouts\">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  Track your automatic and manual payouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-4\">
                  {payouts.map((payout) => (
                    <div key={payout.id} className=\"flex items-center justify-between p-4 border rounded-lg\">
                      <div className=\"flex items-center gap-4\">
                        <div className={`w-3 h-3 rounded-full ${getPayoutStatusColor(payout.payout_status)}`} />
                        <div>
                          <h3 className=\"font-semibold\">
                            {payout.payout_method === 'bank_transfer' ? 'Bank Transfer' : 
                             payout.payout_method === 'paypal' ? 'PayPal' : 'Stripe Express'}
                          </h3>
                          <p className=\"text-sm text-muted-foreground\">
                            {new Date(payout.period_start_date).toLocaleDateString()} - {new Date(payout.period_end_date).toLocaleDateString()}
                          </p>
                          {payout.processed_at && (
                            <p className=\"text-xs text-muted-foreground\">
                              Processed on {new Date(payout.processed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className=\"text-right\">
                        <p className=\"font-semibold\">{formatCurrency(payout.net_payout_amount)}</p>
                        <Badge variant={payout.payout_status === 'completed' ? 'default' : 
                                      payout.payout_status === 'processing' ? 'secondary' :
                                      payout.payout_status === 'failed' ? 'destructive' : 'outline'}>
                          {payout.payout_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value=\"analytics\">
            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
              <Card>
                <CardHeader>
                  <CardTitle className=\"flex items-center gap-2\">
                    <BarChart3 className=\"h-5 w-5\" />
                    Monthly Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=\"h-64 flex items-center justify-center text-muted-foreground\">
                    Revenue chart would be displayed here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className=\"flex items-center gap-2\">
                    <PieChart className=\"h-5 w-5\" />
                    Revenue Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=\"h-64 flex items-center justify-center text-muted-foreground\">
                    Revenue breakdown chart would be displayed here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Mock data for demonstration
const mockTransactions = [
  {
    id: '1',
    vod_title: 'Chicago Stepping Fundamentals',
    customer_name: 'Sarah Johnson',
    sale_price: 39.99,
    commission: 27.99,
    status: 'completed',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    vod_title: 'Advanced Stepping Techniques',
    customer_name: 'Michael Davis',
    sale_price: 49.99,
    commission: 34.99,
    status: 'completed',
    created_at: '2024-01-14T15:45:00Z'
  },
  {
    id: '3',
    vod_title: 'Stepping for Beginners',
    customer_name: 'Lisa Chen',
    sale_price: 29.99,
    commission: 20.99,
    status: 'completed',
    created_at: '2024-01-13T09:15:00Z'
  }
];

const mockPayouts: InstructorPayout[] = [
  {
    id: '1',
    instructor_id: 'inst-1',
    instructor_name: 'Marcus Johnson',
    payout_period: 'weekly',
    period_start_date: '2024-01-08',
    period_end_date: '2024-01-14',
    total_purchases: 12,
    gross_revenue: 479.88,
    total_commission: 335.92,
    platform_fees_deducted: 143.96,
    processing_fees_deducted: 14.40,
    net_payout_amount: 321.52,
    payout_method: 'bank_transfer',
    payout_account_id: 'acct_123',
    payout_status: 'completed',
    payout_reference: 'payout_1234567890',
    processed_at: '2024-01-15T09:00:00Z',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    instructor_id: 'inst-1',
    instructor_name: 'Marcus Johnson',
    payout_period: 'weekly',
    period_start_date: '2024-01-01',
    period_end_date: '2024-01-07',
    total_purchases: 8,
    gross_revenue: 319.92,
    total_commission: 223.94,
    platform_fees_deducted: 95.98,
    processing_fees_deducted: 9.60,
    net_payout_amount: 214.34,
    payout_method: 'bank_transfer',
    payout_account_id: 'acct_123',
    payout_status: 'completed',
    payout_reference: 'payout_0987654321',
    processed_at: '2024-01-08T09:00:00Z',
    created_at: '2024-01-08T08:00:00Z',
    updated_at: '2024-01-08T09:00:00Z'
  }
];

export default EarningsPage;
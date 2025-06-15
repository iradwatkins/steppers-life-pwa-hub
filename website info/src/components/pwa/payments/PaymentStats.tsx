import React from 'react';
import { TrendingUp, DollarSign, CreditCard, Clock, Users, Calendar, BarChart3 } from 'lucide-react';
import { PaymentStats as PaymentStatsType } from '../../../lib/services/pwaPaymentService';

interface PaymentStatsProps {
  stats: PaymentStatsType;
  formatCurrency: (amount: number) => string;
  lastRefresh: Date;
}

const PaymentStats: React.FC<PaymentStatsProps> = ({
  stats,
  formatCurrency,
  lastRefresh
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageTransactionAmount)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTransactions > 0 
                  ? ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Methods Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="space-y-3">
          {Object.entries(stats.paymentMethodBreakdown).map(([method, data]) => (
            <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {method === 'cash' && <DollarSign className="w-4 h-4 text-green-600" />}
                  {method === 'card' && <CreditCard className="w-4 h-4 text-blue-600" />}
                  {method === 'digital_wallet' && <CreditCard className="w-4 h-4 text-purple-600" />}
                  {method === 'qr_code' && <BarChart3 className="w-4 h-4 text-orange-600" />}
                  <span className="font-medium text-gray-900 capitalize">{method.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{formatCurrency(data.totalAmount)}</div>
                <div className="text-sm text-gray-500">{data.count} transactions</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hourly Sales Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Sales Today</h3>
        <div className="space-y-2">
          {stats.hourlySales.map((hour) => {
            const maxSales = Math.max(...stats.hourlySales.map(h => h.amount));
            const percentage = maxSales > 0 ? (hour.amount / maxSales) * 100 : 0;
            
            return (
              <div key={hour.hour} className="flex items-center space-x-3">
                <div className="text-sm text-gray-600 w-16">{hour.hour}:00</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-900 w-20 text-right">
                  {formatCurrency(hour.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Transaction Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Completed</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-green-700">{stats.successfulTransactions}</span>
              <span className="text-sm text-gray-600 ml-1">
                ({stats.totalTransactions > 0 
                  ? ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)
                  : 0}%)
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Failed</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-red-700">{stats.failedTransactions}</span>
              <span className="text-sm text-gray-600 ml-1">
                ({stats.totalTransactions > 0 
                  ? ((stats.failedTransactions / stats.totalTransactions) * 100).toFixed(1)
                  : 0}%)
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Pending</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-yellow-700">{stats.pendingTransactions}</span>
              <span className="text-sm text-gray-600 ml-1">
                ({stats.totalTransactions > 0 
                  ? ((stats.pendingTransactions / stats.totalTransactions) * 100).toFixed(1)
                  : 0}%)
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Refunded</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-purple-700">{stats.refundedTransactions}</span>
              <span className="text-sm text-gray-600 ml-1">
                ({formatCurrency(stats.refundedAmount)})
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Processing Times */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Average Processing Time</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-blue-700">
                {stats.averageProcessingTime ? `${stats.averageProcessingTime.toFixed(1)}s` : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Peak Processing Time</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-green-700">
                {stats.peakProcessingTime ? `${stats.peakProcessingTime.toFixed(1)}s` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Categories */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
        <div className="space-y-3">
          {Object.entries(stats.categoryBreakdown).map(([category, amount]) => {
            const maxAmount = Math.max(...Object.values(stats.categoryBreakdown));
            const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
            
            return (
              <div key={category} className="flex items-center space-x-3">
                <div className="text-sm font-medium text-gray-700 w-24 capitalize">{category}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-900 w-20 text-right">
                  {formatCurrency(amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Last Updated */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {lastRefresh.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStats; 
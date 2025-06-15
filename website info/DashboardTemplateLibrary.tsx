import React, { useState, useEffect } from 'react';
import { useCustomDashboards } from './useCustomDashboards';

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'event' | 'financial' | 'marketing' | 'analytics' | 'operational';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  previewImage: string;
  tags: string[];
  widgets: import('./src/services/custom-dashboard/customDashboardTypes').WidgetConfig[];
  layout: import('./src/services/custom-dashboard/customDashboardTypes').DashboardLayout;
  author: string;
  downloads: number;
  rating: number;
  lastUpdated: string;
  isPublic: boolean;
  isPremium: boolean;
}

interface SharingPermission {
  userId: string;
  username: string;
  role: 'viewer' | 'editor' | 'admin';
  sharedAt: string;
  expiresAt?: string;
}

interface DashboardShare {
  id: string;
  dashboardId: string;
  shareType: 'link' | 'user' | 'team' | 'public';
  permissions: SharingPermission[];
  shareUrl?: string;
  accessCode?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

const DashboardTemplateLibrary: React.FC = () => {
  const { dashboards, createDashboard, loading } = useCustomDashboards();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null);
  const [shareSettings, setShareSettings] = useState<DashboardShare | null>(null);

  // Mock template data
  useEffect(() => {
    const mockTemplates: DashboardTemplate[] = [
      {
        id: 'template-1',
        name: 'Event Performance Overview',
        description: 'Complete dashboard for tracking event ticket sales, attendance, and revenue',
        category: 'event',
        difficulty: 'beginner',
        previewImage: '/template-previews/event-overview.png',
        tags: ['sales', 'attendance', 'revenue', 'basic'],
        widgets: [
          { type: 'kpi', title: 'Total Tickets Sold', metric: 'tickets_sold' },
          { type: 'chart', title: 'Sales Over Time', chartType: 'line', metric: 'daily_sales' },
          { type: 'chart', title: 'Ticket Types', chartType: 'pie', metric: 'ticket_distribution' }
        ],
        layout: [
          { i: 'kpi-1', x: 0, y: 0, w: 4, h: 2 },
          { i: 'chart-1', x: 4, y: 0, w: 8, h: 4 },
          { i: 'chart-2', x: 0, y: 2, w: 4, h: 4 }
        ],
        author: 'SteppersLife',
        downloads: 1250,
        rating: 4.8,
        lastUpdated: '2024-12-15',
        isPublic: true,
        isPremium: false
      },
      {
        id: 'template-2',
        name: 'Financial Performance Dashboard',
        description: 'Advanced financial analytics with revenue breakdown, commission tracking, and profit analysis',
        category: 'financial',
        difficulty: 'advanced',
        previewImage: '/template-previews/financial-dashboard.png',
        tags: ['revenue', 'commissions', 'profit', 'advanced', 'financial'],
        widgets: [
          { type: 'kpi', title: 'Total Revenue', metric: 'total_revenue' },
          { type: 'kpi', title: 'Net Profit', metric: 'net_profit' },
          { type: 'chart', title: 'Revenue vs Expenses', chartType: 'bar', metric: 'revenue_expenses' },
          { type: 'table', title: 'Commission Breakdown', metric: 'commission_details' }
        ],
        layout: [
          { i: 'kpi-1', x: 0, y: 0, w: 3, h: 2 },
          { i: 'kpi-2', x: 3, y: 0, w: 3, h: 2 },
          { i: 'chart-1', x: 6, y: 0, w: 6, h: 4 },
          { i: 'table-1', x: 0, y: 2, w: 6, h: 4 }
        ],
        author: 'SteppersLife Pro',
        downloads: 890,
        rating: 4.9,
        lastUpdated: '2024-12-18',
        isPublic: true,
        isPremium: true
      },
      {
        id: 'template-3',
        name: 'Marketing Campaign Tracker',
        description: 'Track marketing campaign performance, ROI, and social media engagement',
        category: 'marketing',
        difficulty: 'intermediate',
        previewImage: '/template-previews/marketing-tracker.png',
        tags: ['marketing', 'roi', 'social', 'campaigns'],
        widgets: [
          { type: 'kpi', title: 'Campaign ROI', metric: 'campaign_roi' },
          { type: 'chart', title: 'Channel Performance', chartType: 'bar', metric: 'channel_performance' },
          { type: 'chart', title: 'Engagement Over Time', chartType: 'line', metric: 'engagement_timeline' }
        ],
        layout: [
          { i: 'kpi-1', x: 0, y: 0, w: 4, h: 2 },
          { i: 'chart-1', x: 4, y: 0, w: 8, h: 3 },
          { i: 'chart-2', x: 0, y: 2, w: 12, h: 3 }
        ],
        author: 'Marketing Pro',
        downloads: 675,
        rating: 4.6,
        lastUpdated: '2024-12-10',
        isPublic: true,
        isPremium: false
      },
      {
        id: 'template-4',
        name: 'Real-time Analytics Hub',
        description: 'Live dashboard for monitoring real-time event metrics and operational status',
        category: 'analytics',
        difficulty: 'advanced',
        previewImage: '/template-previews/realtime-hub.png',
        tags: ['real-time', 'live', 'monitoring', 'operational'],
        widgets: [
          { type: 'kpi', title: 'Live Attendance', metric: 'live_attendance' },
          { type: 'kpi', title: 'Current Sales Rate', metric: 'sales_rate' },
          { type: 'chart', title: 'Check-in Flow', chartType: 'line', metric: 'checkin_flow' },
          { type: 'map', title: 'Attendee Locations', metric: 'attendee_locations' }
        ],
        layout: [
          { i: 'kpi-1', x: 0, y: 0, w: 3, h: 2 },
          { i: 'kpi-2', x: 3, y: 0, w: 3, h: 2 },
          { i: 'chart-1', x: 6, y: 0, w: 6, h: 3 },
          { i: 'map-1', x: 0, y: 2, w: 6, h: 4 }
        ],
        author: 'Analytics Expert',
        downloads: 423,
        rating: 4.7,
        lastUpdated: '2024-12-19',
        isPublic: true,
        isPremium: true
      },
      {
        id: 'template-5',
        name: 'Simple Event Monitor',
        description: 'Basic dashboard for small events with essential metrics only',
        category: 'operational',
        difficulty: 'beginner',
        previewImage: '/template-previews/simple-monitor.png',
        tags: ['simple', 'basic', 'essential', 'small-events'],
        widgets: [
          { type: 'kpi', title: 'Tickets Sold', metric: 'tickets_sold' },
          { type: 'kpi', title: 'Revenue', metric: 'revenue' },
          { type: 'kpi', title: 'Checked In', metric: 'checked_in' }
        ],
        layout: [
          { i: 'kpi-1', x: 0, y: 0, w: 4, h: 2 },
          { i: 'kpi-2', x: 4, y: 0, w: 4, h: 2 },
          { i: 'kpi-3', x: 8, y: 0, w: 4, h: 2 }
        ],
        author: 'SteppersLife',
        downloads: 2100,
        rating: 4.5,
        lastUpdated: '2024-12-05',
        isPublic: true,
        isPremium: false
      }
    ];

    setTemplates(mockTemplates);
  }, []);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'event', label: 'Event Management' },
    { value: 'financial', label: 'Financial Analytics' },
    { value: 'marketing', label: 'Marketing & Campaigns' },
    { value: 'analytics', label: 'Real-time Analytics' },
    { value: 'operational', label: 'Operations' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const filteredTemplates = templates.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    const searchMatch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return categoryMatch && difficultyMatch && searchMatch;
  });

  const handleUseTemplate = async (template: DashboardTemplate) => {
    try {
      const newDashboard = {
        name: `${template.name} (Copy)`,
        description: `Created from template: ${template.description}`,
        widgets: template.widgets,
        layout: template.layout,
        isPublic: false,
        category: template.category
      };

      await createDashboard(newDashboard);
      alert(`Dashboard created from template: ${template.name}`);
    } catch (error) {
      alert('Failed to create dashboard from template');
    }
  };

  const handleShareTemplate = (template: DashboardTemplate) => {
    setSelectedTemplate(template);
    setShowShareDialog(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'event': return '🎫';
      case 'financial': return '💰';
      case 'marketing': return '📢';
      case 'analytics': return '📊';
      case 'operational': return '⚙️';
      default: return '📋';
    }
  };

  return (
    <div className="dashboard-template-library">
      <div className="library-header">
        <h2>Dashboard Template Library</h2>
        <p>Choose from pre-built templates or share your own dashboards with the community</p>
      </div>

      <div className="library-filters">
        <div className="filter-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-selects">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="templates-grid">
        {filteredTemplates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-preview">
              <div className="preview-placeholder">
                {getCategoryIcon(template.category)}
                <span>Preview</span>
              </div>
              {template.isPremium && <div className="premium-badge">PREMIUM</div>}
            </div>
            
            <div className="template-info">
              <div className="template-header">
                <h3>{template.name}</h3>
                <div className={`difficulty-badge ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </div>
              </div>
              
              <p className="template-description">{template.description}</p>
              
              <div className="template-tags">
                {template.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
                {template.tags.length > 3 && <span className="tag-more">+{template.tags.length - 3}</span>}
              </div>
              
              <div className="template-stats">
                <div className="stat">
                  <span className="stat-value">{template.downloads.toLocaleString()}</span>
                  <span className="stat-label">downloads</span>
                </div>
                <div className="stat">
                  <span className="stat-value">★ {template.rating}</span>
                  <span className="stat-label">rating</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{template.author}</span>
                  <span className="stat-label">by</span>
                </div>
              </div>
              
              <div className="template-actions">
                <button 
                  onClick={() => handleUseTemplate(template)}
                  className="btn-primary"
                  disabled={loading}
                >
                  Use Template
                </button>
                <button 
                  onClick={() => handleShareTemplate(template)}
                  className="btn-secondary"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="no-templates">
          <p>No templates found matching your criteria.</p>
          <button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSelectedDifficulty('all');
          }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Sharing Dialog */}
      {showShareDialog && selectedTemplate && (
        <div className="share-dialog-overlay">
          <div className="share-dialog">
            <h3>Share Dashboard Template</h3>
            <p>Share "{selectedTemplate.name}" with others</p>
            
            <div className="share-options">
              <div className="share-option">
                <label>
                  <input type="radio" name="shareType" value="link" />
                  Share via Link
                </label>
                <p>Anyone with the link can view and use this template</p>
              </div>
              
              <div className="share-option">
                <label>
                  <input type="radio" name="shareType" value="user" />
                  Share with Specific Users
                </label>
                <p>Send to specific team members</p>
              </div>
              
              <div className="share-option">
                <label>
                  <input type="radio" name="shareType" value="public" />
                  Make Public
                </label>
                <p>Add to the public template library</p>
              </div>
            </div>
            
            <div className="share-actions">
              <button onClick={() => setShowShareDialog(false)}>Cancel</button>
              <button className="btn-primary">Generate Share Link</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-template-library {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .library-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .library-header h2 {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        
        .library-header p {
          color: #666;
          font-size: 16px;
        }
        
        .library-filters {
          margin-bottom: 32px;
        }
        
        .filter-row {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .search-box {
          flex: 1;
          min-width: 300px;
        }
        
        .search-box input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .filter-selects {
          display: flex;
          gap: 12px;
        }
        
        .filter-selects select {
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          background: white;
        }
        
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        
        .template-card {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .template-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        .template-preview {
          position: relative;
          height: 120px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .preview-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 24px;
        }
        
        .premium-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #ff6b35;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        
        .template-info {
          padding: 20px;
        }
        
        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .template-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
          flex: 1;
        }
        
        .difficulty-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
          margin-left: 8px;
        }
        
        .template-description {
          color: #666;
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 12px;
        }
        
        .template-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }
        
        .tag {
          background: #f0f0f0;
          color: #666;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .tag-more {
          background: #e0e0e0;
          color: #666;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .template-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }
        
        .stat {
          text-align: center;
        }
        
        .stat-value {
          display: block;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }
        
        .stat-label {
          display: block;
          color: #999;
          font-size: 11px;
          text-transform: uppercase;
          margin-top: 2px;
        }
        
        .template-actions {
          display: flex;
          gap: 8px;
        }
        
        .btn-primary {
          flex: 1;
          padding: 10px 16px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #45a049;
        }
        
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          padding: 10px 16px;
          background: #f5f5f5;
          color: #666;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .btn-secondary:hover {
          background: #e0e0e0;
        }
        
        .no-templates {
          text-align: center;
          padding: 48px 24px;
          color: #666;
        }
        
        .no-templates button {
          margin-top: 16px;
          padding: 8px 16px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .share-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .share-dialog {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 500px;
          max-width: 90vw;
        }
        
        .share-dialog h3 {
          margin-top: 0;
          margin-bottom: 8px;
          color: #333;
        }
        
        .share-options {
          margin: 24px 0;
        }
        
        .share-option {
          margin-bottom: 16px;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .share-option label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .share-option p {
          margin: 4px 0 0 24px;
          font-size: 14px;
          color: #666;
        }
        
        .share-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .share-actions button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .share-actions button:first-child {
          background: #f5f5f5;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            min-width: auto;
          }
          
          .filter-selects {
            justify-content: space-between;
          }
          
          .templates-grid {
            grid-template-columns: 1fr;
          }
          
          .template-stats {
            flex-direction: column;
            gap: 8px;
            text-align: left;
          }
          
          .stat {
            display: flex;
            justify-content: space-between;
            text-align: left;
          }
          
          .template-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardTemplateLibrary; 
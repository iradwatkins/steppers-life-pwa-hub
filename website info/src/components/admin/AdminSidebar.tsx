import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  Calendar, 
  Store, 
  FileText, 
  Mail, 
  Globe, 
  Megaphone, 
  Shield, 
  CreditCard,
  Database,
  Bell,
  Palette,
  Download,
  UserPlus,
  UserCog
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import UserImpersonationDialog from './UserImpersonationDialog';
import { useUserImpersonation } from '@/hooks/useUserImpersonation';

interface AdminSidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className }) => {
  const location = useLocation();
  const { canImpersonate, impersonationState } = useUserImpersonation();
  const [impersonationDialogOpen, setImpersonationDialogOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: "Analytics Hub",
          href: "/admin/analytics",
          icon: BarChart3,
        }
      ]
    },
    {
      title: "User Management",
      items: [
        {
          title: "All Users",
          href: "/admin/users",
          icon: Users,
        },
        {
          title: "User Roles",
          href: "/admin/users/roles",
          icon: Shield,
        },
        {
          title: "Add User",
          href: "/admin/users/create",
          icon: UserPlus,
        }
      ]
    },
    {
      title: "Content Management",
      items: [
        {
          title: "Events",
          href: "/admin/events",
          icon: Calendar,
        },
            {
      title: "Magazine",
      href: "/admin/magazine",
          icon: FileText,
        },
        {
          title: "Store Directory",
          href: "/admin/stores",
          icon: Store,
        },
        {
          title: "Static Content",
          href: "/admin/content",
          icon: Database,
        }
      ]
    },
    {
      title: "Platform Tools",
      items: [
        {
          title: "Email Management",
          href: "/admin/email-management",
          icon: Mail,
        },
        {
          title: "Notifications",
          href: "/admin/notifications",
          icon: Bell,
        },
        {
          title: "Vanity URLs",
          href: "/admin/vanity-urls",
          icon: Globe,
        },
        {
          title: "Advertising",
          href: "/admin/advertising",
          icon: Megaphone,
        }
      ]
    },
    {
      title: "System",
      items: [
        {
          title: "Platform Settings",
          href: "/admin/settings",
          icon: Settings,
        },
        {
          title: "Theme & Design",
          href: "/admin/theme",
          icon: Palette,
        },
        {
          title: "Data Export",
          href: "/admin/export",
          icon: Download,
        },
        {
          title: "Payment Config",
          href: "/admin/payments",
          icon: CreditCard,
        }
      ]
    }
  ];

  const isActiveLink = (href: string) => {
    if (href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={cn("pb-12 min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            Admin Panel
          </h2>
          
          {/* Act As User Button */}
          {canImpersonate && (
            <div className="mb-4 px-4">
              <Button 
                onClick={() => setImpersonationDialogOpen(true)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                size="sm"
              >
                <UserCog className="h-4 w-4 mr-2" />
                {impersonationState.isImpersonating ? 'Switch User' : 'Act As User'}
              </Button>
            </div>
          )}
          
          <div className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-2 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                        isActiveLink(item.href)
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.title}
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* User Impersonation Dialog */}
      <UserImpersonationDialog 
        open={impersonationDialogOpen}
        onOpenChange={setImpersonationDialogOpen}
      />
    </div>
  );
};

export default AdminSidebar; 
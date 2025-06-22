import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import CartButton from '@/components/cart/CartButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();
  const { isOrganizer, canAccessAdmin } = useRoles();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Navigation handler that forces page refresh
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  // Navigation handler for dropdown items
  const handleDropdownNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-stepping-gradient bg-clip-text text-transparent">
              SteppersLife
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => handleNavigation('/magazine')} 
              className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
            >
              Magazine
            </button>
            <button 
              onClick={() => handleNavigation('/blog')} 
              className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
            >
              Blog
            </button>
            <button 
              onClick={() => handleNavigation('/events')} 
              className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
            >
              Events
            </button>
            <button 
              onClick={() => handleNavigation('/classes')} 
              className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
            >
              Classes
            </button>
            <button 
              onClick={() => handleNavigation('/community')} 
              className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
            >
              Community
            </button>
            <button 
              onClick={() => handleNavigation('/about')} 
              className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
            >
              About
            </button>
            {user && (
              <Button onClick={() => handleNavigation('/events/create')} className="bg-stepping-gradient">
                Post Event
              </Button>
            )}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search events, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>

          {/* Theme Toggle & Auth Buttons */}
          <div className="flex items-center space-x-4">
            <CartButton />
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDropdownNavigation('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDropdownNavigation('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDropdownNavigation('/notifications')}>
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDropdownNavigation('/tickets')}>
                    My Tickets
                  </DropdownMenuItem>
                  {isOrganizer && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDropdownNavigation('/organizer/events')}>
                        My Events
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDropdownNavigation('/organizer/manage-events')}>
                        Manage Events
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDropdownNavigation('/events/create')}>
                        Create Event
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDropdownNavigation('/organizer/multi-event-analytics')}>
                        Analytics Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  {canAccessAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDropdownNavigation('/admin/dashboard')}>
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDropdownNavigation('/admin/blog')}>
                        Blog Management
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" onClick={() => handleNavigation('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => handleNavigation('/register')}>
                  Join
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => {
                  handleNavigation('/magazine');
                  setIsMenuOpen(false);
                }}
                className="text-foreground/80 hover:text-foreground transition-colors text-left"
              >
                Magazine
              </button>
              <button 
                onClick={() => {
                  handleNavigation('/blog');
                  setIsMenuOpen(false);
                }}
                className="text-foreground/80 hover:text-foreground transition-colors text-left"
              >
                Blog
              </button>
              <button 
                onClick={() => {
                  handleNavigation('/events');
                  setIsMenuOpen(false);
                }}
                className="text-foreground/80 hover:text-foreground transition-colors text-left"
              >
                Events
              </button>
              <button 
                onClick={() => {
                  handleNavigation('/classes');
                  setIsMenuOpen(false);
                }}
                className="text-foreground/80 hover:text-foreground transition-colors text-left"
              >
                Classes
              </button>
              <button 
                onClick={() => {
                  handleNavigation('/community');
                  setIsMenuOpen(false);
                }}
                className="text-foreground/80 hover:text-foreground transition-colors text-left"
              >
                Community
              </button>
              <button 
                onClick={() => {
                  handleNavigation('/about');
                  setIsMenuOpen(false);
                }}
                className="text-foreground/80 hover:text-foreground transition-colors text-left"
              >
                About
              </button>
              
              {user && (
                <Button 
                  onClick={() => {
                    handleNavigation('/events/create');
                    setIsMenuOpen(false);
                  }} 
                  className="bg-stepping-gradient w-fit"
                >
                  Post Event
                </Button>
              )}
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center space-x-2 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </form>
              
              {!user && (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleNavigation('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => {
                      handleNavigation('/register');
                      setIsMenuOpen(false);
                    }}
                  >
                    Join
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

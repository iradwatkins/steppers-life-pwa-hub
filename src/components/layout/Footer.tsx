
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-stepping-gradient bg-clip-text text-transparent">
              SteppersLife
            </div>
            <p className="text-sm text-muted-foreground">
              The leading platform for the Chicago Stepping community. Connect, learn, and grow together.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="font-semibold">Platform</h4>
            <div className="space-y-2">
              <Link to="/magazine" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Magazine
              </Link>
              <Link to="/events" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Events
              </Link>
              <Link to="/classes" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Classes
              </Link>
              <Link to="/community" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Community
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link to="/help" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Facebook
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Instagram
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Twitter
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                YouTube
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 SteppersLife. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

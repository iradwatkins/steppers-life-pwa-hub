import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-alt border-t border-border-default mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Steppers Life</h3>
            <p className="text-sm text-foreground-muted">
              Connecting the dance community worldwide through events, classes, and resources.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-foreground-muted hover:text-brand-primary" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" className="text-foreground-muted hover:text-brand-primary" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" className="text-foreground-muted hover:text-brand-primary" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://youtube.com" className="text-foreground-muted hover:text-brand-primary" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Discover</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-sm text-foreground-muted hover:text-brand-primary">Events</Link>
              </li>
              <li>
                <Link to="/classes" className="text-sm text-foreground-muted hover:text-brand-primary">Classes</Link>
              </li>
              <li>
                <Link to="/magazine" className="text-sm text-foreground-muted hover:text-brand-primary">Magazine</Link>
              </li>
              <li>
                <Link to="/community" className="text-sm text-foreground-muted hover:text-brand-primary">Community</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Organizers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/organizer/events/create" className="text-sm text-foreground-muted hover:text-brand-primary">Create Event</Link>
              </li>
              <li>
                <Link to="/instructor/dashboard" className="text-sm text-foreground-muted hover:text-brand-primary">Instructor Portal</Link>
              </li>
              <li>
                <Link to="/stores/submit" className="text-sm text-foreground-muted hover:text-brand-primary">Submit Store</Link>
              </li>
              <li>
                <Link to="/ads/portal" className="text-sm text-foreground-muted hover:text-brand-primary">Ad Portal</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about-us" className="text-sm text-foreground-muted hover:text-brand-primary">About Us</Link>
              </li>
              <li>
                <Link to="/user-agreement" className="text-sm text-foreground-muted hover:text-brand-primary">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-foreground-muted hover:text-brand-primary">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/download" className="text-sm text-foreground-muted hover:text-brand-primary">Download App</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border-default mt-8 pt-8 text-center">
          <p className="text-sm text-foreground-muted">
            &copy; {currentYear} Steppers Life. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Home,
  Search,
  Building2,
  BarChart3,
  HelpCircle,
  BookOpen,
  Info,
  Mail,
  MapPin,
  Twitter,
  Github,
  Linkedin,
  Shield,
  Zap,
  Users,
  MessageSquare,
  FileText,
  Lock
} from 'lucide-react';
import Logo from "@/assets/logo.svg?react";

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-muted/30 via-background to-muted/20 border-t flex  justify-center align-center">
      <div >

      
      {/* Main Footer Content */}
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <Logo className="h-10 w-10 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-primary to-primary/60 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  RentChain
                </h3>
                <p className="text-xs text-muted-foreground">Blockchain Rentals</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              The future of rental property management. Secure, transparent, and decentralized real estate rentals powered by blockchain technology.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>

          {/* For Tenants */}
          <div>
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              For Tenants
            </h4>
            <div className="flex flex-col space-y-2">
              <Link to="/properties" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Search className="h-3 w-3" />
                Browse Properties
              </Link>
              <Link to="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                Advanced Search
              </Link>
              <Link to="/tenant/bookings" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                My Bookings
              </Link>
              <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Zap className="h-3 w-3" />
                How It Works
              </Link>
            </div>
          </div>

          {/* For Property Owners */}
          <div>
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              For Owners
            </h4>
            <div className="flex flex-col space-y-2">
              <Link to="/owner/properties/new" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                List Your Property
              </Link>
              <Link to="/owner/properties" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Home className="h-3 w-3" />
                Manage Listings
              </Link>
              <Link to="/owner/bookings" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                Booking Requests
              </Link>
              <Link to="/owner/stats" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                Performance Stats
              </Link>
            </div>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Resources
            </h4>
            <div className="flex flex-col space-y-2">
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <HelpCircle className="h-3 w-3" />
                FAQ
              </Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <BookOpen className="h-3 w-3" />
                Blog
              </Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <MessageSquare className="h-3 w-3" />
                Support
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Info className="h-3 w-3" />
                About Us
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6 mb-8 border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
              <p className="text-sm text-muted-foreground">
                Get the latest news about blockchain rentals and platform updates.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64"
              />
              <Button size="sm" className="whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Email Support</p>
              <p className="text-xs text-muted-foreground">support@rentchain.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Security</p>
              <p className="text-xs text-muted-foreground">Blockchain Protected</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Community</p>
              <p className="text-xs text-muted-foreground">Join 10,000+ users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t bg-muted/30">
        <div className=" px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-muted-foreground">
              <p>© 2025 RentChain. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-primary transition-colors flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Terms of Service
                </Link>
                <Link to="/cookies" className="hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Academic Project - Not for Production Use</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}

export default Footer;
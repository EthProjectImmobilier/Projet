import { Link, useLocation } from 'react-router-dom';
import { authStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTheme } from 'next-themes';
import {
  Moon,
  Sun,
  Menu,
  User,
  LogOut,
  ChevronDown,
  HelpCircle,
  BookOpen,
  Info,
  MessageSquare,
  Home,
  Search,
  Building2,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';
import Logo from "@/assets/logo.svg?react";
import { useState } from 'react';
import { getVisibleMenuItems, roleHelpers } from '@/lib/auth.utils';
function Navbar() {
  const { isAuthenticated, user, logout } = authStore();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const visibleMenuItems = getVisibleMenuItems(isAuthenticated, user);
  const isActive = (href: string) => location.pathname === href;

  // Separate menu items by category for better organization
  const publicItems = visibleMenuItems.filter(item => item.roles === 'ALL');
  const tenantItems = visibleMenuItems.filter(item => Array.isArray(item.roles) && item.roles.includes('ROLE_TENANT') && item.roles.length === 1);
  const ownerItems = visibleMenuItems.filter(item => Array.isArray(item.roles) && item.roles.includes('ROLE_OWNER') && item.roles.length === 1);
  const adminItems = visibleMenuItems.filter(item => Array.isArray(item.roles) && item.roles.includes('ROLE_ADMIN') && item.roles.length === 1);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm flex items-center justify-center">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <Logo className="h-9 w-9 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-primary to-primary/60 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              RentChain
            </span>
            <span className="text-xs text-muted-foreground -mt-1">Blockchain Rentals</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {/* Public links */}
          {publicItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                isActive(item.href)
                  ? 'text-primary bg-primary/10 border border-primary/20'
                  : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Resources dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-all duration-200 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                Resources
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/faq" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  FAQ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/blog" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Blog
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  About Us
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tenant links */}
          {tenantItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1 ${
                isActive(item.href)
                  ? 'text-primary bg-primary/10 border border-primary/20'
                  : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
              }`}
            >
              <Home className="w-4 h-4" />
              {item.label}
            </Link>
          ))}

          {/* Owner links */}
          {ownerItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-all duration-200 flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  Host
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {ownerItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link to={item.href} className="flex items-center gap-2">
                      {item.label.includes('Properties') && <Building2 className="w-4 h-4" />}
                      {item.label.includes('Bookings') && <BarChart3 className="w-4 h-4" />}
                      {item.label.includes('Stats') && <BarChart3 className="w-4 h-4" />}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Admin links */}
          {adminItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-all duration-200 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Admin
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {adminItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link to={item.href} className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Quick Support Link - Desktop */}
          <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
            <Link to="/faq" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden xl:inline">Support</span>
            </Link>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hover:bg-accent/50"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isAuthenticated ? (
            <>
              {/* User dropdown - hidden on mobile, shown on desktop */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50 transition-colors">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={user?.photoUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                          <AvatarImage src={user?.photoUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                          <Badge
                            variant="secondary"
                            className={`w-fit text-xs ${
                              user?.role === 'ROLE_TENANT'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : user?.role === 'ROLE_OWNER'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            }`}
                          >
                            {user?.role === 'ROLE_TENANT' ? 'Tenant' : user?.role === 'ROLE_OWNER' ? 'Owner' : 'Admin'}
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'ROLE_TENANT' && (
                      <DropdownMenuItem asChild>
                        <Link to="/tenant/bookings" className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          My Bookings
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'ROLE_OWNER' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/owner/properties" className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            My Properties
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/owner/stats" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Statistics
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setOpen(true)} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden hover:bg-accent/50">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] sm:w-[400px]">
                  <SheetHeader className="border-b pb-4">
                    <SheetTitle className="flex items-center space-x-3">
                      <div className="relative">
                        <Logo className="h-8 w-8 text-primary" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-primary to-primary/60 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          RentChain
                        </span>
                        <span className="text-xs text-muted-foreground -mt-1">Blockchain Rentals</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col space-y-6 mt-6">
                    {/* User info for mobile */}
                    {isAuthenticated && user && (
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                          <AvatarImage src={user.photoUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1">
                          <p className="text-sm font-semibold">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                          <Badge
                            variant="secondary"
                            className={`w-fit text-xs mt-1 ${
                              user.role === 'ROLE_TENANT'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : user.role === 'ROLE_OWNER'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            }`}
                          >
                            {roleHelpers.isTenant(user) ? 'Tenant' : roleHelpers.isOwner(user) ? 'Owner' : 'Admin'}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Navigation links */}
                    <div className="flex flex-col space-y-2">
                      {publicItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive(item.href)
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          {item.label === 'Properties' && <Search className="w-4 h-4" />}
                          {item.label === 'Home' && <Home className="w-4 h-4" />}
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Resources */}
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold text-muted-foreground px-4 py-2 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Resources
                      </p>
                      <div className="space-y-1">
                        <Link
                          to="/faq"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>FAQ</span>
                        </Link>
                        <Link
                          to="/blog"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Blog</span>
                        </Link>
                        <Link
                          to="/"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                          <Info className="w-4 h-4" />
                          <span>About Us</span>
                        </Link>
                      </div>
                    </div>

                    {/* Tenant section */}
                    {tenantItems.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-xs font-semibold text-muted-foreground px-4 py-2 flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          Tenant
                        </p>
                        {tenantItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                          >
                            <Home className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Owner section */}
                    {ownerItems.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-xs font-semibold text-muted-foreground px-4 py-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Host
                        </p>
                        {ownerItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                          >
                            {item.label.includes('Properties') && <Building2 className="w-4 h-4" />}
                            {item.label.includes('Bookings') && <BarChart3 className="w-4 h-4" />}
                            {item.label.includes('Stats') && <BarChart3 className="w-4 h-4" />}
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Admin section */}
                    {adminItems.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-xs font-semibold text-muted-foreground px-4 py-2 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin
                        </p>
                        {adminItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Profile and logout for authenticated users */}
                    {isAuthenticated && (
                      <div className="border-t pt-4 space-y-2">
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>Profile Settings</span>
                        </Link>
                        <button
                          onClick={() => {
                            setOpen(true);
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-sm font-medium hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 rounded-md transition-colors text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link to="/register">Register</Link>
              </Button>
              {/* Mobile auth buttons */}
              <div className="sm:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[320px] sm:w-[400px]">
                    <SheetHeader className="border-b pb-4">
                      <SheetTitle className="flex items-center space-x-3">
                        <div className="relative">
                          <Logo className="h-8 w-8 text-primary" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-primary to-primary/60 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            RentChain
                          </span>
                          <span className="text-xs text-muted-foreground -mt-1">Blockchain Rentals</span>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col space-y-6 mt-6">
                      {/* Navigation links */}
                      <div className="flex flex-col space-y-2">
                        {publicItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                              isActive(item.href)
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {item.label === 'Properties' && <Search className="w-4 h-4" />}
                            {item.label === 'Home' && <Home className="w-4 h-4" />}
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>

                      {/* Resources */}
                      <div className="border-t pt-4">
                        <p className="text-xs font-semibold text-muted-foreground px-4 py-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          Resources
                        </p>
                        <div className="space-y-1">
                          <Link
                            to="/faq"
                            className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                          >
                            <HelpCircle className="w-4 h-4" />
                            <span>FAQ</span>
                          </Link>
                          <Link
                            to="/blog"
                            className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Blog</span>
                          </Link>
                          <Link
                            to="/how-it-works"
                            className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                          >
                            <Zap className="w-4 h-4" />
                            <span>How It Works</span>
                          </Link>
                          <Link
                            to="/"
                            className="flex items-center space-x-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                          >
                            <Info className="w-4 h-4" />
                            <span>About Us</span>
                          </Link>
                        </div>
                      </div>

                      {/* Auth buttons */}
                      <div className="border-t pt-4 flex flex-col space-y-3">
                        <Button asChild className="w-full">
                          <Link to="/login">Login</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/register">Register</Link>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will log you out of your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { logout(); setOpen(false); }}>
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}

export default Navbar;
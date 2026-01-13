import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  CreditCard,
  Search,
  Lock,
  CheckCircle,
  ArrowRight,
  Building,
  AlertCircle,
  UserCheck,
  Sparkles,
  Wallet,
  Star,
  Zap,
  Globe,
  Cpu
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Particles from "@/components/Particles";
import { MarketTrendsWidget } from "@/components/ai/MarketTrendsWidget";
import { RecommendedProperties } from "@/components/ai/RecommendedProperties";
import { AiBadge } from "@/components/ai/AiBadge";
import { useMarketAnalytics, usePropertyRecommendations } from "@/hooks/ai";
import { useUserRole } from "@/hooks/useUserRole";
import { usePropertyList } from "@/hooks/useProperty";
import { PropertyCard } from "@/components/properties/PropertyCard";

const Home = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { isTenant, isOwner, user } = useUserRole();
  const [budget, setBudget] = useState<number>(5000);
  const [budgetSubmitted, setBudgetSubmitted] = useState<boolean>(false);

  // AI hooks
  const { data: marketAnalytics, isLoading: analyticsLoading, isError: analyticsError } = useMarketAnalytics();
  const { data: recommendations, isLoading: recsLoading, isError: recsError } = usePropertyRecommendations(
    budget,
    isTenant && !!user && budgetSubmitted
  );

  // Latest properties
  const { data: latestProperties, loading: propertiesLoading } = usePropertyList(0, 6);

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetSubmitted(true);
  };

  const handleBrowseProperties = () => navigate('/properties');
  const handleListProperty = () => navigate('/register');
  const handleMyListings = () => navigate('/owner/properties');

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero Section */}
      <div className="w-full absolute h-[100vh]">
        <Particles
          particleColors={theme === 'dark' ? ['#ffffff', '#aaaaaa', '#777777'] : ['#000000', '#555555', '#888888']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      <section className="container mx-auto px-14 py-24 text-center z-10 relative min-h-[100vh] flex flex-col items-center justify-center" style={{ pointerEvents: 'none' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="pointer-events-auto text-sm px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Now Live on Ethereum Mainnet
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Rent Without
            <br />
            <span className="text-foreground">Intermediaries</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the future of rentals: secure, transparent, and AI-powered property discovery
            on the blockchain. No hidden fees, no middlemen, just pure peer-to-peer transactions.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">$85K+</div>
              <div className="text-sm text-muted-foreground">ETH Secured</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <div className="text-sm text-muted-foreground">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">2.5K+</div>
              <div className="text-sm text-muted-foreground">Happy Renters</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="pointer-events-auto text-lg px-8 py-4 h-auto" onClick={handleBrowseProperties}>
              <Search className="mr-2 h-5 w-5" />
              Explore Properties
            </Button>
            {isOwner ? (
              <Button variant="outline" size="lg" className="pointer-events-auto text-lg px-8 py-4 h-auto" onClick={handleMyListings}>
                <Building className="mr-2 h-5 w-5" />
                Manage Listings
              </Button>
            ) : (
              <Button variant="outline" size="lg" className="pointer-events-auto text-lg px-8 py-4 h-auto" onClick={handleListProperty}>
                <Building className="mr-2 h-5 w-5" />
                List Your Property
              </Button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="secondary" className="pointer-events-auto flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Instant Booking
            </Badge>
            <Badge variant="secondary" className="pointer-events-auto flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Smart Contract Escrow
            </Badge>
            <Badge variant="secondary" className="pointer-events-auto flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="pointer-events-auto flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Global Reach
            </Badge>
            <AiBadge size="sm" />
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Audited Smart Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-500" />
              <span>Verified Owners</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-500" />
              <span>Bank-Level Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Properties */}
      <div className="bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <section id="popular-properties" className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Most Popular Properties</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Discover the highest-rated properties loved by our community of renters
            </p>
          </div>

          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !latestProperties?.content?.length ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Unable to load popular properties. Please try again later.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestProperties?.content
                ?.filter(property => property.averageRating && property.averageRating > 0)
                ?.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
                ?.slice(0, 3)
                .map((property) => (
                  <div key={property.id} className="relative">
                    <PropertyCard
                      property={property}
                    />
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {property.averageRating?.toFixed(1)}
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => navigate('/properties')}>
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <section id="how-it-works" className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Four simple steps to your perfect rental experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Search & Book</h3>
              <p className="text-muted-foreground">
                Browse available properties and book your perfect rental with transparent pricing.
              </p>
            </div>
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Pay with MetaMask</h3>
              <p className="text-muted-foreground">
                Connect your wallet and pay the rental fee plus security deposit in ETH.
              </p>
            </div>
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Escrow Lock</h3>
              <p className="text-muted-foreground">
                Funds are securely locked in a smart contract escrow during your stay.
              </p>
            </div>
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                  4
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Release to Owner</h3>
              <p className="text-muted-foreground">
                After successful stay, funds are automatically released to the property owner.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose RentChain?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Experience the future of property rentals with cutting-edge blockchain technology
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-6 shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Trustless Escrow</h3>
            <p className="text-muted-foreground">
              Smart contracts hold funds securely until rental completion, protecting both parties.
            </p>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center mb-6 shadow-lg">
              <CreditCard className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">On-Chain Payments</h3>
            <p className="text-muted-foreground">
              Direct ETH payments with transparent blockchain records and instant settlement.
            </p>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center mb-6 shadow-lg">
              <UserCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Verified Owners</h3>
            <p className="text-muted-foreground">
              Identity-verified property owners with KYC and background checks for your peace of mind.
            </p>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center mb-6 shadow-lg relative">
              <Sparkles className="h-8 w-8" />
              <div className="absolute -top-1 -right-1">
                <AiBadge size="sm" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Discovery</h3>
            <p className="text-muted-foreground">
              Smart recommendations and market insights powered by advanced AI algorithms.
            </p>
          </div>
        </div>
      </section>

      {/* AI Market Trends */}
      <section id="ai-market-trends" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Market Trends</h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <AiBadge size="md" />
            <span className="text-sm text-muted-foreground font-medium">AI-Powered Insights</span>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Get real-time market predictions and pricing trends powered by advanced AI models
          </p>
        </div>

        <div className="bg-gradient-to-br from-card to-card/50 rounded-xl p-8 shadow-lg border">
          <MarketTrendsWidget
            analytics={marketAnalytics || []}
            loading={analyticsLoading}
            error={analyticsError}
            maxCitiesToShow={5}
          />
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            AI-powered market analysis with real-time pricing predictions
          </p>
        </div>
      </section>

      {/* Trust & Security */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <section id="trust-security" className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trust & Security</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Your security and trust are our top priorities. Every transaction is protected by blockchain technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-10 w-10" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Smart Contract Escrow</h3>
              <p className="text-muted-foreground leading-relaxed">
                Funds are held securely in smart contracts until rental completion, protecting both parties from fraud and ensuring fair transactions.
              </p>
            </div>
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-10 w-10" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Immutable Records</h3>
              <p className="text-muted-foreground leading-relaxed">
                All transactions and agreements are recorded on the blockchain with complete transparency and cannot be altered or deleted.
              </p>
            </div>
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="h-10 w-10" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Verified Owners</h3>
              <p className="text-muted-foreground leading-relaxed">
                Property owners undergo identity verification and background checks for your peace of mind and security.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Budget-based Recommendations */}
      {user && (
        <section id="budget-recommendations" className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Find Your Perfect Property</h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <AiBadge size="md" />
              <span className="text-sm text-muted-foreground font-medium">AI-Powered Recommendations</span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Enter your budget to get personalized property recommendations tailored to your preferences
            </p>
          </div>

          <div className="max-w-md mx-auto mb-16">
            <div className="bg-gradient-to-br from-card to-card/50 rounded-xl p-8 shadow-lg border">
              <form onSubmit={handleBudgetSubmit} className="space-y-6">
                <div>
                  <label htmlFor="budget" className="block text-sm font-semibold mb-3 text-foreground">
                    Daily Budget
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-semibold">ETH</span>
                      <input
                        id="budget"
                        type="number"
                        min="0"
                        step="0.0001"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full pl-12 pr-4 py-4 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-medium"
                        placeholder="5000"
                      />
                    </div>
                    <Button type="submit" size="lg" className="px-8 py-4 h-auto gap-2 shadow-lg hover:shadow-xl transition-shadow">
                      <Search className="h-5 w-5" />
                      Find
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {budgetSubmitted && (
            <div className="mt-12">
              <RecommendedProperties
                properties={recommendations || []}
                loading={recsLoading}
                error={recsError}
                onPropertySelect={(id) => {
                  window.location.href = `/properties/${id}`;
                }}
              />
            </div>
          )}
        </section>
      )}


      

      {/* Owner CTA */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <section id="owner-cta" className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-2xl">
              <CardContent className="pt-16 pb-16 px-8">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 shadow-lg">
                      <Building className="h-8 w-8" />
                    </div>
                  </div>
                  <h2 className="text-4xl font-bold mb-6">List Your Property Today</h2>
                  <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                    Join hundreds of property owners earning passive income through secure, blockchain-powered rentals.
                    No intermediaries, direct payments, and complete control over your listings.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" onClick={handleListProperty} className="px-8 py-4 h-auto text-lg gap-3 shadow-lg hover:shadow-xl transition-shadow">
                      <Building className="h-5 w-5" />
                      Start Listing Now
                    </Button>
                    <Button variant="outline" size="lg" className="px-8 py-4 h-auto text-lg border-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      
    </div>
  );
};

export default Home;
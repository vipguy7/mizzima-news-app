
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Search, 
  Home, 
  Tv, 
  Newspaper, 
  User, 
  Menu,
  Heart,
  Share2,
  Download,
  Settings,
  LogOut,
  Crown,
  Tv2,
  Youtube,
  BookOpen,
  Users
} from "lucide-react";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

interface Subscription {
  subscription_tier: string;
  subscribed: boolean;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSubscription();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user?.id)
        .single();
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data } = await supabase
        .from('subscribers')
        .select('subscription_tier, subscribed')
        .eq('user_id', user?.id)
        .single();
      
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const isPremium = subscription?.subscription_tier === 'premium' && subscription?.subscribed;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6 animate-fade-in-up">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <Tv2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Welcome to Mizzima Media Hub</h2>
                  <p className="text-muted-foreground">
                    Your comprehensive source for Myanmar news, live TV, and multimedia content
                  </p>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/dashboard')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Enter Media Hub
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access Features */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/dashboard')}>
                <CardContent className="p-4 text-center">
                  <Tv className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Live TV</h3>
                  <p className="text-xs text-muted-foreground">Watch Mizzima TV Live</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/dashboard')}>
                <CardContent className="p-4 text-center">
                  <Youtube className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Videos</h3>
                  <p className="text-xs text-muted-foreground">YouTube Content</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/dashboard')}>
                <CardContent className="p-4 text-center">
                  <Newspaper className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">News</h3>
                  <p className="text-xs text-muted-foreground">Latest Articles</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/dashboard')}>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Social</h3>
                  <p className="text-xs text-muted-foreground">Facebook Updates</p>
                </CardContent>
              </Card>
            </div>

            {/* Premium Upgrade */}
            {!isPremium && (
              <Card className="bg-gradient-to-r from-accent/20 to-primary/20 border-accent/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-accent" />
                      <div>
                        <h3 className="font-semibold text-foreground">Upgrade to Premium</h3>
                        <p className="text-sm text-muted-foreground">Unlock exclusive content & features</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/subscription')}
                      className="bg-accent hover:bg-accent/90"
                    >
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6 animate-fade-in-up">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {profile?.full_name || "User"}
                </h2>
                <p className="text-muted-foreground mb-2">{user?.email}</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge 
                    variant={isPremium ? "default" : "secondary"}
                    className={isPremium ? "bg-primary text-primary-foreground" : ""}
                  >
                    {isPremium && <Crown className="w-3 h-3 mr-1" />}
                    {subscription?.subscription_tier?.charAt(0).toUpperCase() + 
                     (subscription?.subscription_tier?.slice(1) || "Free")}
                  </Badge>
                </div>
                {!isPremium && (
                  <Button 
                    className="bg-primary hover:bg-primary/90 mb-4"
                    onClick={() => navigate('/subscription')}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <div className="grid gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard')}
                  >
                    <Tv2 className="w-4 h-4 mr-3" />
                    Media Hub
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/subscription')}
                  >
                    <Crown className="w-4 h-4 mr-3" />
                    Subscription Plans
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <Button variant="ghost" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-3" />
                    Downloads
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">Mizzima</h1>
              {isPremium && (
                <Crown className="w-4 h-4 text-primary" />
              )}
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border"
              />
            </div>
          </div>

          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <div className="p-4">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around p-2">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "profile", icon: User, label: "Profile" }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-3 min-w-0 ${
                activeTab === tab.id 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;

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
  Crown
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

  const featuredContent = [
    {
      id: 1,
      title: "Breaking News Live",
      thumbnail: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=450&fit=crop",
      duration: "LIVE",
      category: "News",
      isLive: true
    },
    {
      id: 2,
      title: "Myanmar Cultural Documentary",
      thumbnail: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=450&fit=crop",
      duration: "45:30",
      category: "Documentary"
    },
    {
      id: 3,
      title: "Wildlife of Myanmar",
      thumbnail: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=800&h=450&fit=crop",
      duration: "32:15",
      category: "Nature"
    }
  ];

  const liveChannels = [
    { id: 1, name: "Mizzima TV", status: "LIVE", viewers: "2.3K" },
    { id: 2, name: "Mizzima News", status: "LIVE", viewers: "1.8K" },
    { id: 3, name: "Cultural Channel", status: "OFFLINE", viewers: "0" }
  ];

  const newsArticles = [
    {
      id: 1,
      title: "Latest Updates from Myanmar",
      summary: "Breaking news and developments...",
      time: "2 hours ago",
      category: "Politics"
    },
    {
      id: 2,
      title: "Cultural Festival Highlights",
      summary: "Celebrating traditional Myanmar culture...",
      time: "4 hours ago",
      category: "Culture"
    },
    {
      id: 3,
      title: "Economic Development News",
      summary: "Recent economic trends and analysis...",
      time: "6 hours ago",
      category: "Economy"
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6 animate-fade-in-up">
            {/* Premium Content Banner */}
            {!isPremium && (
              <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">Unlock Premium Content</h3>
                        <p className="text-sm text-muted-foreground">Get HD streaming, no ads, and exclusive content</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/subscription')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Featured Content Carousel */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-foreground">Featured</h2>
              <div className="relative">
                <Card className="overflow-hidden bg-card border-border">
                  <div className="relative">
                    <img 
                      src={featuredContent[0].thumbnail} 
                      alt={featuredContent[0].title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        {featuredContent[0].isLive && (
                          <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                            LIVE
                          </Badge>
                        )}
                        <Badge variant="secondary">{featuredContent[0].category}</Badge>
                        {isPremium && (
                          <Badge className="bg-primary text-primary-foreground">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {featuredContent[0].title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <Play className="w-4 h-4 mr-1" />
                          Watch Now
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Trending Videos */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-foreground">Trending</h2>
              <div className="grid grid-cols-1 gap-4">
                {featuredContent.slice(1).map((content) => (
                  <Card key={content.id} className="overflow-hidden bg-card border-border hover:border-primary/50 transition-colors">
                    <div className="flex">
                      <div className="relative w-32 h-20 flex-shrink-0">
                        <img 
                          src={content.thumbnail} 
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                          {content.duration}
                        </div>
                      </div>
                      <CardContent className="flex-1 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {content.category}
                          </Badge>
                          {!isPremium && (
                            <Badge variant="outline" className="text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                          {content.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">2 hours ago</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        );

      case "live":
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-foreground">Live Channels</h2>
            <div className="grid gap-4">
              {liveChannels.map((channel) => (
                <Card key={channel.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Tv className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{channel.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={channel.status === "LIVE" ? "bg-destructive animate-pulse" : "bg-muted"}
                            >
                              {channel.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {channel.viewers} viewers
                            </span>
                            {!isPremium && channel.status === "LIVE" && (
                              <Badge variant="outline" className="text-xs">
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        disabled={channel.status === "OFFLINE" || (!isPremium && channel.status === "LIVE")}
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => !isPremium && channel.status === "LIVE" ? navigate('/subscription') : null}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {!isPremium && channel.status === "LIVE" ? "Upgrade" : "Watch"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "news":
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-foreground">Latest News</h2>
            <div className="grid gap-4">
              {newsArticles.map((article) => (
                <Card key={article.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{article.category}</Badge>
                        {!isPremium && (
                          <Badge variant="outline" className="text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{article.time}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{article.summary}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => !isPremium ? navigate('/subscription') : null}
                    >
                      {!isPremium ? "Upgrade to Read" : "Read More"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                placeholder="Search videos, news..."
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
            { id: "live", icon: Tv, label: "Live" },
            { id: "news", icon: Newspaper, label: "News" },
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

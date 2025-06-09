
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Download
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

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

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6 animate-fade-in-up">
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
                        <Badge variant="secondary" className="text-xs mb-1">
                          {content.category}
                        </Badge>
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
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        disabled={channel.status === "OFFLINE"}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Watch
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
                      <Badge variant="outline">{article.category}</Badge>
                      <span className="text-xs text-muted-foreground">{article.time}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{article.summary}</p>
                    <Button variant="outline" size="sm">
                      Read More
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
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Welcome User</h2>
                <p className="text-muted-foreground mb-4">Enjoy unlimited streaming</p>
                <Button className="bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </CardContent>
            </Card>
            
            <div className="grid gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">Downloads</h3>
                  <p className="text-sm text-muted-foreground">Manage your offline content</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">Settings</h3>
                  <p className="text-sm text-muted-foreground">Customize your experience</p>
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
            <h1 className="text-xl font-bold text-primary">Mizzima</h1>
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

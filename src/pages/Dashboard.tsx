
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LivePlayer from '@/components/streaming/LivePlayer';
import YouTubePlayer from '@/components/youtube/YouTubePlayer';
import NewsReader from '@/components/news/NewsReader';
import SocialFeed from '@/components/social/SocialFeed'; // Assuming this exists and is generic
import ContinueWatchingList from '@/components/youtube/ContinueWatchingList'; // Import ContinueWatchingList
import { 
  Tv2, 
  Youtube, 
  Newspaper, 
  Users, 
  BookOpen, 
  Mail,
  Crown,
  Play,
  TrendingUp,
  Globe,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('live');
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for the externally controlled YouTube player
  const [controlledPlayerVideoId, setControlledPlayerVideoId] = useState<string | null>(null);
  const [controlledPlayerStartSeconds, setControlledPlayerStartSeconds] = useState<number>(0);

  const handleContinueWatchingSelect = (videoId: string, startSeconds: number) => {
    setControlledPlayerVideoId(videoId);
    setControlledPlayerStartSeconds(startSeconds);
    // Optionally, switch to the 'youtube' tab if not already active,
    // and ensure the player receiving these props is visible.
    setActiveTab('youtube');
    // Scroll to player? Or ensure it's in view. For now, just sets state.
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Tv2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Mizzima Media Hub</h1>
                <p className="text-xs text-muted-foreground">Your gateway to Myanmar news & media</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Live
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/subscription')}
              >
                <Crown className="w-4 h-4 mr-1" />
                Premium
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Tv2 className="w-4 h-4" />
              <span className="hidden sm:inline">Live TV</span>
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger value="magazine" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Magazine</span>
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Newsletter</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <LivePlayer 
                  title="Mizzima TV Live"
                  isLive={true}
                />
              </div>
              <div className="space-y-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-foreground">Live Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Viewers</span>
                        <span className="text-sm font-medium">2,340</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Quality</span>
                        <Badge variant="secondary" className="text-xs">HD</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className="bg-destructive text-xs animate-pulse">LIVE</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-foreground">Schedule</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Evening News</p>
                          <p className="text-xs text-muted-foreground">6:00 PM - 7:00 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Editorial Talk</p>
                          <p className="text-xs text-muted-foreground">8:00 PM - 9:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-6">
            {user && (
              <ContinueWatchingList
                onVideoSelect={handleContinueWatchingSelect}
                maxItems={5}
              />
            )}
            <div className="grid gap-6 lg:grid-cols-2">
              <YouTubePlayer 
                playlistId="PL1FfogmNIjcSbnZZ9-izjbZOsgF30tAZM" // Mizzima Primetime - this will be controllable
                title="The Mizzima Primetime"
                externalVideoId={controlledPlayerVideoId}
                externalStartSeconds={controlledPlayerStartSeconds}
                onVideoSelect={() => {
                  // When user clicks a video within this player's list,
                  // we should clear the external control so it plays from its own list.
                  if (controlledPlayerVideoId) setControlledPlayerVideoId(null);
                }}
              />
              <YouTubePlayer 
                playlistId="PL1FfogmNIjcTA-8U3nEisarLVyurdpP9w" // Editorial Talk
                title="Editorial Talk"
                // This player is not controlled by ContinueWatchingList in this setup
              />
              <YouTubePlayer 
                playlistId="PL1FfogmNIjcSl8mb5J2vyLWPJyxFZ7oom"
                title="Exclusive Interviews"
              />
              <YouTubePlayer 
                playlistId="PL1FfogmNIjcSHGnHLAsUaE-a0Yzj-ob_O"
                title="Latest Local News"
              />
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <NewsReader language="both" />
              </div>
              <div className="space-y-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-foreground">Trending Topics</h3>
                    <div className="space-y-2">
                      {['Politics', 'Economy', 'Culture', 'International'].map((topic) => (
                        <div key={topic} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{topic}</span>
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Hot
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="magazine" className="space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <BookOpen className="w-16 h-16 text-primary mx-auto" />
                  <h2 className="text-2xl font-bold text-foreground">Mizzima Weekly Magazine</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Access our comprehensive weekly magazine with in-depth analysis, 
                    exclusive interviews, and cultural features.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button>
                      <Play className="w-4 h-4 mr-2" />
                      Latest Issue
                    </Button>
                    <Button variant="outline">
                      Browse Archive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter" className="space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Mail className="w-16 h-16 text-primary mx-auto" />
                  <h2 className="text-2xl font-bold text-foreground">Daily Newsletter</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Stay informed with our daily newsletter featuring the most important 
                    news and analysis delivered to your inbox.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button>
                      Subscribe Now
                    </Button>
                    <Button variant="outline">
                      View Archives
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialFeed platform="facebook" maxPosts={10} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;

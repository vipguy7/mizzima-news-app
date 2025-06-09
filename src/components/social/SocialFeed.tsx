
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, ExternalLink, Clock } from 'lucide-react';

interface SocialPost {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram';
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  postUrl: string;
}

interface SocialFeedProps {
  platform?: 'facebook' | 'all';
  maxPosts?: number;
}

const SocialFeed = ({ platform = 'all', maxPosts = 5 }: SocialFeedProps) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock social media data - in production, this would use Facebook Graph API
    const mockPosts: SocialPost[] = [
      {
        id: 'fb_1',
        platform: 'facebook',
        content: 'Breaking: New diplomatic talks scheduled for next week. Stay tuned for live coverage on Mizzima TV.',
        imageUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=500&h=300&fit=crop',
        author: 'Mizzima Daily',
        authorAvatar: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=40&h=40&fit=crop',
        publishedAt: '2024-01-15T14:30:00Z',
        likes: 245,
        comments: 32,
        shares: 18,
        postUrl: 'https://facebook.com/MizzimaDaily/posts/123'
      },
      {
        id: 'fb_2',
        platform: 'facebook',
        content: 'Watch our exclusive interview with community leaders discussing local development projects. Full interview available on our YouTube channel.',
        videoUrl: 'https://example.com/video.mp4',
        author: 'Mizzima Daily',
        authorAvatar: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=40&h=40&fit=crop',
        publishedAt: '2024-01-14T16:45:00Z',
        likes: 189,
        comments: 24,
        shares: 15,
        postUrl: 'https://facebook.com/MizzimaDaily/posts/124'
      },
      {
        id: 'fb_3',
        platform: 'facebook',
        content: 'မင်္ဂလာပါ! နံနက်ပိုင်း သတင်းများကို လိုက်ရှာကြည့်ရှုနိုင်ပါပြီ။ Mizzima TV Live ကို ကြည့်ရှုရန် အပ်ပ်ကို ဒေါင်းလုဒ်လုပ်ပါ။',
        imageUrl: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=500&h=300&fit=crop',
        author: 'Mizzima Daily',
        authorAvatar: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=40&h=40&fit=crop',
        publishedAt: '2024-01-13T09:15:00Z',
        likes: 312,
        comments: 45,
        shares: 28,
        postUrl: 'https://facebook.com/MizzimaDaily/posts/125'
      }
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPosts = posts.filter(post => {
    if (platform === 'all') return true;
    return post.platform === platform;
  });

  const formatPublishedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="flex gap-4">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Social Updates</h2>
          <Badge variant="outline">Facebook</Badge>
        </div>

        <div className="space-y-6">
          {filteredPosts.slice(0, maxPosts).map((post) => (
            <Card key={post.id} className="bg-muted/20 border-border">
              <CardContent className="p-4 space-y-4">
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">{post.author}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatPublishedDate(post.publishedAt)}
                        <Badge variant="outline" className="text-xs">
                          {post.platform}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

                {/* Post Content */}
                <div className="space-y-3">
                  <p className="text-foreground">{post.content}</p>
                  
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}

                  {post.videoUrl && (
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white">Video content</span>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      {formatNumber(post.likes)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      {formatNumber(post.comments)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Share2 className="w-4 h-4" />
                      {formatNumber(post.shares)}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" asChild>
                    <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
                      View on Facebook
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialFeed;

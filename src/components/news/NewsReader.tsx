
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Bookmark, Share2, ExternalLink } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
  sourceUrl: string;
  language: 'burmese' | 'english';
}

interface NewsReaderProps {
  language?: 'burmese' | 'english' | 'both';
}

const NewsReader = ({ language = 'both' }: NewsReaderProps) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);

  useEffect(() => {
    // Mock news data - in production, this would fetch from mizzima APIs
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'Myanmar Economic Summit Discusses Regional Trade Partnerships',
        summary: 'Regional leaders gather to discuss new economic partnerships and trade agreements...',
        content: 'Full article content would be loaded here from the API...',
        category: 'Economy',
        publishedAt: '2024-01-15T08:30:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=600&h=400&fit=crop',
        sourceUrl: 'https://eng.mizzima.com/article/123',
        language: 'english'
      },
      {
        id: '2',
        title: 'Cultural Festival Celebrates Traditional Arts',
        summary: 'Annual festival showcases Myanmar traditional music, dance, and visual arts...',
        content: 'Full article content would be loaded here from the API...',
        category: 'Culture',
        publishedAt: '2024-01-14T16:15:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&h=400&fit=crop',
        sourceUrl: 'https://eng.mizzima.com/article/124',
        language: 'english'
      },
      {
        id: '3',
        title: 'နိုင်ငံတကာ သတင်းများ',
        summary: 'အပတ်စဉ် နိုင်ငံတကာ အရေးကြီး သတင်းများကို ပြန်လည် သုံးသပ်ခြင်း...',
        content: 'မြန်မာ ဘာသာဖြင့် ပြည့်စုံသော ဆောင်းပါးများ...',
        category: 'နိုင်ငံတကာ',
        publishedAt: '2024-01-13T12:00:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=600&h=400&fit=crop',
        sourceUrl: 'https://bur.mizzima.com/article/125',
        language: 'burmese'
      }
    ];

    setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredArticles = articles.filter(article => {
    if (language === 'both') return true;
    return article.language === language;
  });

  const formatPublishedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-40 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedArticle) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)}>
              ← Back to Articles
            </Button>
          </div>

          <article className="space-y-6">
            {selectedArticle.imageUrl && (
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{selectedArticle.category}</Badge>
                <Badge variant="secondary">
                  {selectedArticle.language === 'english' ? 'EN' : 'မြန်မာ'}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatPublishedDate(selectedArticle.publishedAt)}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-foreground">
                {selectedArticle.title}
              </h1>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBookmark(selectedArticle.id)}
                >
                  <Bookmark
                    className={`w-4 h-4 mr-1 ${
                      bookmarkedArticles.includes(selectedArticle.id)
                        ? 'fill-current'
                        : ''
                    }`}
                  />
                  Bookmark
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={selectedArticle.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Source
                  </a>
                </Button>
              </div>

              <div className="prose prose-sm max-w-none text-foreground">
                <p className="text-lg text-muted-foreground mb-4">
                  {selectedArticle.summary}
                </p>
                <div className="whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>
              </div>
            </div>
          </article>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Latest News</h2>
          <Tabs defaultValue="all" className="w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="english">English</TabsTrigger>
              <TabsTrigger value="burmese">မြန်မာ</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="bg-muted/20 border-border hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => setSelectedArticle(article)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-32 h-20 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {article.language === 'english' ? 'EN' : 'မြန်မာ'}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatPublishedDate(article.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsReader;

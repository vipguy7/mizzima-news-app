
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Bookmark as LucideBookmark, Share2, ExternalLink, BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react'; // Renamed Bookmark to LucideBookmark
import { useAuth } from '@/hooks/useAuth';
import {
  WatchlistItem,
  NewWatchlistItem,
  getWatchlistItem,
  addToWatchlist,
  removeFromWatchlist
} from '@/integrations/supabase/watchlistService';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  id: string; // Will use NewsAPI's article.url for uniqueness
  title: string;
  summary: string; // NewsAPI: description
  content: string | null; // NewsAPI: content (can be null or partial)
  category?: string; // NewsAPI: source.name can be used, or make optional
  publishedAt: string; // NewsAPI: publishedAt
  imageUrl?: string; // NewsAPI: urlToImage
  sourceUrl: string; // NewsAPI: url
  sourceName?: string; // NewsAPI: source.name
  language: 'burmese' | 'english' | 'unknown'; // To store the language of the article
}

interface NewsReaderProps {
  language?: 'burmese' | 'english' | 'both'; // This prop controls the desired language for fetching
}

const NewsReader = ({ language: languageProp = 'both' }: NewsReaderProps) => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [apiLoading, setApiLoading] = useState(true); // Renamed loading to apiLoading
  // const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]); // Old localStorage bookmarks
  const [error, setError] = useState<string | null>(null);

  // Watchlist specific state for selected article
  const [selectedArticleWatchlistItem, setSelectedArticleWatchlistItem] = useState<WatchlistItem | null>(null);
  const [isTogglingWatchlist, setIsTogglingWatchlist] = useState(false);


  const VITE_NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

  // Fallback mock articles if API fails or key is missing
  const fallbackMockArticles: NewsArticle[] = [
    {
      id: 'fallback-mock-1', // Ensure IDs are unique if using URLs from real sources
      title: 'Fallback: General News Update (Cached)',
      summary: 'This is a cached summary of a general news update...',
      content: 'Full content of the cached article...',
      category: 'General',
      publishedAt: '2024-01-15T08:30:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&h=400&fit=crop',
      sourceUrl: 'https://example.com/fallback1',
      sourceName: 'MockSource',
      language: 'english'
    },
     {
      id: 'fallback-mock-2',
      title: 'Fallback: နောက်ဆုံးရ မြန်မာ့သတင်း (Cached)',
      summary: 'မြန်မာနိုင်ငံ၏ နောက်ဆုံးရသတင်းအကျဉ်းချုပ်...',
      content: 'ဤသည်မှာ ကက်ရှ်လုပ်ထားသော ဆောင်းပါး၏ အကြောင်းအရာအပြည့်အစုံဖြစ်သည်...',
      category: 'ပြည်တွင်းသတင်း',
      publishedAt: '2024-01-14T12:00:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1560184240-9c5a4753ef78?w=600&h=400&fit=crop',
      sourceUrl: 'https://example.com/fallback2',
      sourceName: 'MockSource Burmese',
      language: 'burmese'
    }
  ];

  useEffect(() => {
    // Removed old localStorage bookmark loading. Supabase watchlist is fetched on article selection.

    const fetchNewsApiArticles = async () => {
      setApiLoading(true);
      setError(null);

      if (!VITE_NEWS_API_KEY) {
        setError('NewsAPI key is missing. Please set VITE_NEWS_API_KEY. Displaying cached data.');
        setArticles(fallbackMockArticles);
        setApiLoading(false);
        console.error('NewsAPI key is missing. Please set VITE_NEWS_API_KEY.');
        return;
      }

      let apiLanguage = 'en'; // Default to English
      let queryLanguage: NewsArticle['language'] = 'english';

      if (languageProp === 'english') {
        apiLanguage = 'en';
        queryLanguage = 'english';
      } else if (languageProp === 'burmese') {
        apiLanguage = 'my';
        queryLanguage = 'burmese';
      } else if (languageProp === 'both') {
        apiLanguage = 'en'; // Default to English for 'both' for now
        queryLanguage = 'english';
        console.warn("NewsReader: 'both' language selected. Fetching English articles from NewsAPI. For true bilingual display, separate API calls might be needed if NewsAPI doesn't support multilingual domain search effectively.");
        // Future enhancement: make two separate API calls if languageProp is 'both' and NewsAPI requires it.
        // Then merge and de-duplicate results. For now, we fetch one language.
      }

      const domains = 'mizzima.com,bur.mizzima.com,eng.mizzima.com';
      const pageSize = 20;
      const url = `https://newsapi.org/v2/everything?apiKey=${VITE_NEWS_API_KEY}&domains=${domains}&language=${apiLanguage}&pageSize=${pageSize}&sortBy=publishedAt`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('NewsAPI Error:', errorData);
          throw new Error(errorData.message || `Failed to fetch news (status: ${response.status})`);
        }
        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
          setError(`No articles found from Mizzima domains for the selected language (${queryLanguage}).`);
        setArticles([]);
        } else {
          const mappedArticles: NewsArticle[] = data.articles.map((apiArticle: any) => ({
          id: apiArticle.url,
            title: apiArticle.title || 'No title',
            summary: apiArticle.description || '',
            content: apiArticle.content || null,
          category: apiArticle.source?.name || 'General',
            publishedAt: apiArticle.publishedAt,
            imageUrl: apiArticle.urlToImage,
            sourceUrl: apiArticle.url,
            sourceName: apiArticle.source?.name,
          language: queryLanguage,
          }));
          setArticles(mappedArticles);
        }
      } catch (err: any) {
        console.error('Error fetching or processing NewsAPI data:', err);
        setError(err.message || 'An unknown error occurred while fetching news. Displaying cached data.');
        setArticles(fallbackMockArticles);
      } finally {
      setApiLoading(false);
      }
    };

    fetchNewsApiArticles();
  }, [languageProp, VITE_NEWS_API_KEY]);

  // Effect to fetch watchlist status for the selected article
  useEffect(() => {
    if (selectedArticle && user) {
      setIsTogglingWatchlist(true); // Use this to indicate loading status for the button
      getWatchlistItem(selectedArticle.id, 'article')
        .then(item => {
          setSelectedArticleWatchlistItem(item);
        })
        .catch(err => {
          console.error(`Failed to get watchlist status for article ${selectedArticle.id}:`, err);
          setSelectedArticleWatchlistItem(null);
        })
        .finally(() => {
          setIsTogglingWatchlist(false);
        });
    } else if (!user) {
      setSelectedArticleWatchlistItem(null); // Clear status if user logs out or no article selected
    }
  }, [selectedArticle, user]);


  const handleToggleWatchlistSelectedArticle = async () => {
    if (!user || !selectedArticle) {
      toast({ title: "Authentication Required", description: "Please log in to manage your watchlist.", variant: "destructive" });
      return;
    }

    setIsTogglingWatchlist(true);

    try {
      if (selectedArticleWatchlistItem) {
        await removeFromWatchlist(selectedArticle.id, 'article');
        setSelectedArticleWatchlistItem(null);
        toast({ title: "Removed from Watchlist", description: `"${selectedArticle.title}" removed.` });
      } else {
        const newItemData: NewWatchlistItem = {
          item_id: selectedArticle.id,
          item_type: 'article',
          title: selectedArticle.title,
          thumbnail_url: selectedArticle.imageUrl,
          source_url: selectedArticle.sourceUrl,
        };
        const addedItem = await addToWatchlist(newItemData);
        setSelectedArticleWatchlistItem(addedItem);
        toast({ title: "Added to Watchlist", description: `"${selectedArticle.title}" added.` });
      }
    } catch (error: any) {
      console.error("Failed to update article watchlist:", error);
      toast({ title: "Error", description: error.message || "Could not update watchlist.", variant: "destructive" });
    } finally {
      setIsTogglingWatchlist(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    // The filtering based on languageProp is now primarily handled by the API query.
    // This client-side filter remains as a safeguard or if 'both' were to fetch all and then filter.
    // However, with current 'both' defaulting to 'en' in API, this might not be strictly necessary
    // if articles always match queryLanguage.
    if (languageProp === 'both') return true; // If 'both', show all fetched (which is currently 'en')
    return article.language === languageProp;
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

  // Old toggleBookmark for localStorage is removed. New one is handleToggleWatchlistSelectedArticle.

  if (apiLoading) {
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
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleWatchlistSelectedArticle}
                    disabled={authLoading || isTogglingWatchlist}
                  >
                    {isTogglingWatchlist ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : selectedArticleWatchlistItem ? (
                      <BookmarkCheck className="w-4 h-4 mr-2 text-green-500" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4 mr-2" />
                    )}
                    {selectedArticleWatchlistItem ? t('Remove from Watchlist') : t('Add to Watchlist')}
                  </Button>
                )}
                {!user && (
                   <Button variant="outline" size="sm" disabled title="Log in to add to watchlist">
                     <BookmarkPlus className="w-4 h-4 mr-2" /> {t('Add to Watchlist')}
                   </Button>
                )}
                <Button variant="outline" size="sm"> {/* Keep Share and Source buttons */}
                  <Share2 className="w-4 h-4 mr-1" />
                  {t('Share')} {/* Assuming 'Share' key exists or will be added */}
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
          <h2 className="text-xl font-bold text-foreground">{t('latestNews')}</h2>
          {/* TODO: Wire up these tabs to actually filter based on the 'language' prop or a local state for tabs */}
          {/* For now, the tabs will use the global language setting for their labels. */}
          {/* The actual filtering logic based on languageProp for fetching data is separate. */}
          <Tabs defaultValue="all" className="w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">{t('all')}</TabsTrigger>
              <TabsTrigger value="english">{t('english')}</TabsTrigger>
              <TabsTrigger value="burmese">{t('burmese')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {filteredArticles.length === 0 && !apiLoading && (
            <p className="text-muted-foreground text-center">No articles found for the selected criteria.</p>
          )}
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
                    {article.category || article.sourceName || 'News'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                    {article.language === 'english' ? 'EN' : article.language === 'burmese' ? 'မြန်မာ' : 'N/A'}
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

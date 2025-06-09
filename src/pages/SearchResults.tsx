import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, PlayCircle, Newspaper, Loader2 } from 'lucide-react';

import { searchChannelVideos, YouTubeSearchResult } from '@/integrations/youtubeService';
import { searchNewsArticles, NewsAPISearchResult } from '@/integrations/newsApiService'; // Ensure NewsArticle interface is compatible or import specific type

const MIZZIMA_CHANNEL_ID = 'UCk9f0cLiMmtchQySOogzoig'; // Mizzima YouTube Channel ID

const SearchResults: React.FC = () => {
  const { query } = useParams<{ query?: string }>();
  const { t, i18n } = useTranslation();

  const [videoResults, setVideoResults] = useState<YouTubeSearchResult[]>([]);
  const [articleResults, setArticleResults] = useState<NewsAPISearchResult[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [articleLoading, setArticleLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [articleError, setArticleError] = useState<string | null>(null);

  const VITE_YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const VITE_NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

  useEffect(() => {
    const performSearch = async () => {
      if (!query || query.trim() === "") {
        setVideoResults([]);
        setArticleResults([]);
        setVideoError(null);
        setArticleError(null);
        return;
      }

      // Search YouTube Videos
      if (VITE_YOUTUBE_API_KEY) {
        setVideoLoading(true);
        setVideoError(null);
        try {
          const videos = await searchChannelVideos({
            apiKey: VITE_YOUTUBE_API_KEY,
            channelId: MIZZIMA_CHANNEL_ID,
            query: query,
            maxResults: 10,
          });
          setVideoResults(videos);
        } catch (err: any) {
          console.error("YouTube Search Error:", err);
          setVideoError(err.message || "Failed to fetch video results.");
        } finally {
          setVideoLoading(false);
        }
      } else {
        setVideoError("YouTube API Key not configured.");
      }

      // Search News Articles
      if (VITE_NEWS_API_KEY) {
        setArticleLoading(true);
        setArticleError(null);
        try {
          // Determine language for NewsAPI based on current i18n language
          const newsApiLang = i18n.language === 'my' ? 'my' : 'en';
          const articles = await searchNewsArticles({
            apiKey: VITE_NEWS_API_KEY,
            query: query,
            language: newsApiLang,
            pageSize: 10,
          });
          setArticleResults(articles);
        } catch (err: any) {
          console.error("NewsAPI Search Error:", err);
          setArticleError(err.message || "Failed to fetch article results.");
        } finally {
          setArticleLoading(false);
        }
      } else {
        setArticleError("NewsAPI Key not configured.");
      }
    };

    performSearch();
  }, [query, VITE_YOUTUBE_API_KEY, VITE_NEWS_API_KEY, i18n.language]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-bold">
          {t('searchResultsTitle')} for: <span className="text-primary">{query || "..."}</span>
        </CardTitle>
      </CardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Video Results Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlayCircle className="w-6 h-6 mr-2 text-red-600" /> {t('videoResultsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {videoLoading && (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="ml-2">{t('loading')}...</p>
                </div>
              )}
              {videoError && <p className="text-destructive">{videoError}</p>}
              {!videoLoading && !videoError && videoResults.length === 0 && query && (
                <p>{t('noVideosFound')}</p>
              )}
              <div className="space-y-4">
                {videoResults.map((video) => (
                  <div key={video.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                    <div className="flex-1">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm hover:text-primary line-clamp-2"
                      >
                        {video.title}
                      </a>
                      <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Article Results Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Newspaper className="w-6 h-6 mr-2 text-blue-600" /> {t('articleResultsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {articleLoading && (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="ml-2">{t('loading')}...</p>
                </div>
              )}
              {articleError && <p className="text-destructive">{articleError}</p>}
              {!articleLoading && !articleError && articleResults.length === 0 && query &&(
                <p>{t('noArticlesFound')}</p>
              )}
              <div className="space-y-4">
                {articleResults.map((article) => (
                  <div key={article.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    {article.imageUrl && (
                      <img src={article.imageUrl} alt={article.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm hover:text-primary line-clamp-2"
                      >
                        {article.title}
                      </a>
                      <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(article.publishedAt).toLocaleDateString()} - {article.sourceName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default SearchResults;

// Re-defining a similar interface here. Ideally, NewsArticle would be in a shared types file.
export interface NewsAPISearchResult {
  id: string; // Using article.url for id
  title: string;
  summary: string; // from description
  content: string | null;
  category?: string; // from source.name
  publishedAt: string;
  imageUrl?: string; // from urlToImage
  sourceUrl: string; // from url
  sourceName?: string; // from source.name
  language: 'burmese' | 'english' | 'unknown'; // Based on query
}

interface SearchNewsArticlesParams {
  apiKey: string;
  query: string;
  domains?: string[];
  language?: 'en' | 'my'; // NewsAPI language codes
  pageSize?: number;
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
}

export const searchNewsArticles = async ({
  apiKey,
  query,
  domains = ['mizzima.com', 'bur.mizzima.com', 'eng.mizzima.com'],
  language = 'en',
  pageSize = 10,
  sortBy = 'relevancy',
}: SearchNewsArticlesParams): Promise<NewsAPISearchResult[]> => {
  if (!apiKey) {
    throw new Error('NewsAPI key is required for searching articles.');
  }
  if (!query) {
    return []; // Return empty if query is empty
  }

  const domainString = domains.join(',');
  const url = `https://newsapi.org/v2/everything?apiKey=${apiKey}&q=${encodeURIComponent(query)}&domains=${domainString}&language=${language}&pageSize=${pageSize}&sortBy=${sortBy}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('NewsAPI Search Error:', errorData);
      throw new Error(errorData.message || `Failed to search NewsAPI articles (status: ${response.status})`);
    }
    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      console.warn('No articles found in NewsAPI search result:', data);
      return [];
    }

    const searchResults: NewsAPISearchResult[] = data.articles.map((apiArticle: any) => ({
      id: apiArticle.url,
      title: apiArticle.title || 'No title',
      summary: apiArticle.description || '',
      content: apiArticle.content || null,
      category: apiArticle.source?.name || 'General',
      publishedAt: apiArticle.publishedAt,
      imageUrl: apiArticle.urlToImage,
      sourceUrl: apiArticle.url,
      sourceName: apiArticle.source?.name,
      language: language === 'my' ? 'burmese' : 'english', // Map back to our internal language type
    }));

    return searchResults;
  } catch (err) {
    console.error('Error fetching or processing NewsAPI search results:', err);
    throw err;
  }
};

// Mizzima Channel ID: UCk9f0cLiMmtchQySOogzoig

export interface YouTubeSearchResult {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelTitle?: string;
  viewCount?: string; // Not available in search result directly, would need another call
  duration?: string; // Not available in search result directly
}

interface SearchChannelVideosParams {
  apiKey: string;
  channelId: string;
  query: string;
  maxResults?: number;
}

export const searchChannelVideos = async ({
  apiKey,
  channelId,
  query,
  maxResults = 10,
}: SearchChannelVideosParams): Promise<YouTubeSearchResult[]> => {
  if (!apiKey) {
    throw new Error('YouTube API key is required for searching videos.');
  }
  if (!channelId) {
    throw new Error('YouTube Channel ID is required.');
  }
  if (!query) {
    return []; // Return empty if query is empty
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&q=${encodeURIComponent(query)}&type=video&key=${apiKey}&maxResults=${maxResults}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Search Error:', errorData);
      throw new Error(errorData.error?.message || `Failed to search YouTube videos (status: ${response.status})`);
    }
    const data = await response.json();

    if (!data.items) {
      console.warn('No video items found in YouTube search result:', data);
      return [];
    }

    const searchResults: YouTubeSearchResult[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    }));

    return searchResults;
  } catch (err) {
    console.error('Error fetching or processing YouTube search results:', err);
    // Re-throw or handle as per application's error handling strategy
    // For now, re-throwing to be caught by the calling component
    throw err;
  }
};

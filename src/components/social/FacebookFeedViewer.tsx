import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FacebookFeedViewerProps {
  pageUrl?: string;
  width?: string;
  height?: string;
  showFacepile?: boolean;
  smallHeader?: boolean;
  hideCover?: boolean;
  tabs?: string; // e.g., "timeline", "events", "messages"
}

const DEFAULT_FACEBOOK_PAGE_URL = 'https://www.facebook.com/MizzimaDaily';

// Extend window interface to include FB object
declare global {
  interface Window {
    FB?: {
      XFBML: {
        parse: () => void;
      };
    };
  }
}

const FacebookFeedViewer: React.FC<FacebookFeedViewerProps> = ({
  pageUrl = DEFAULT_FACEBOOK_PAGE_URL,
  width = "500", // Default width, can be overridden
  height = "", // Default height, let Facebook decide or override
  showFacepile = true,
  smallHeader = false,
  hideCover = false,
  tabs = "timeline",
}) => {
  useEffect(() => {
    // The Facebook SDK script in index.html loads asynchronously.
    // FB.XFBML.parse() is needed to render XFBML elements (like the Page Plugin)
    // that are added to the DOM after the initial SDK load & parse.
    // It's good practice to check if window.FB and window.FB.XFBML are defined.
    if (window.FB && window.FB.XFBML) {
      console.log('Facebook SDK found, parsing XFBML for FacebookFeedViewer.');
      window.FB.XFBML.parse();
    } else {
      console.warn('Facebook SDK (FB or FB.XFBML) not found when FacebookFeedViewer mounted. Page plugin might not render if added dynamically.');
      // If the SDK script in index.html hasn't loaded yet, it should parse automatically once it does.
      // This explicit call is mainly for plugins added after initial page load.
    }
  }, [pageUrl, width, height, showFacepile, smallHeader, hideCover, tabs]); // Re-run if props change, FB might need to re-parse

  return (
    <Card className="bg-card border-border w-full max-w-lg mx-auto"> {/* Example styling: centered, max-width */}
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Mizzima Facebook Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/*
          The div below is the Facebook Page Plugin.
          The Facebook SDK (loaded from index.html) will find this div and render the feed.
          Ensure the pageUrl is a public Facebook page.
          If it doesn't render, check browser console for errors from Facebook SDK.
          Also, ad blockers can sometimes interfere with social plugins.
        */}
        <div
          className="fb-page"
          data-href={pageUrl}
          data-tabs={tabs}
          data-width={width}
          data-height={height}
          data-small-header={smallHeader}
          data-adapt-container-width="true"
          data-hide-cover={hideCover}
          data-show-facepile={showFacepile.toString()} // data attributes are strings
        >
          <blockquote cite={pageUrl} className="fb-xfbml-parse-ignore">
            <a href={pageUrl}>Mizzima</a>
          </blockquote>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          If the feed doesn't load, ensure you are connected to the internet and that ad blockers are not interfering. The Facebook page must also be public and allow embedding.
        </p>
      </CardContent>
    </Card>
  );
};

export default FacebookFeedViewer;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface MagazineViewerProps {
  url?: string;
}

const DEFAULT_MAGAZINE_URL = 'https://www.mizzimaweekly.com';

const MagazineViewer: React.FC<MagazineViewerProps> = ({ url = DEFAULT_MAGAZINE_URL }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  // Attempt to detect iframe loading issues (basic detection)
  // Note: This is not foolproof. X-Frame-Options or CSP issues might prevent 'load' event
  // or block content without firing the 'error' event in a way we can easily catch from parent.
  useEffect(() => {
    setIsLoading(true);
    setIframeError(false); // Reset error state on url change

    // Give the iframe a few seconds to load. If 'load' doesn't fire,
    // assume an issue. This is a heuristic.
    const timer = setTimeout(() => {
      if (isLoading) { // If still loading after timeout
        // This doesn't necessarily mean X-Frame-Options, could be slow network
        // but for this specific use case, embedding external sites often faces this.
        console.warn(`Iframe for ${url} is taking a long time to load. It might be blocked by X-Frame-Options or CSP.`);
        // We can't definitively say it's an error, so we might just stop 'isLoading'
        // or set a specific type of warning. For now, let's assume it might be an issue if it takes too long.
        // To actually detect X-Frame-Options, a backend proxy would be more reliable.
        // For now, we'll just stop the loading indicator and let the user see the (potentially blank) iframe.
        // A more robust solution might involve a proxy or server-side check.
      }
    }, 8000); // 8 seconds timeout

    return () => clearTimeout(timer);
  }, [url, isLoading]); // Added isLoading to dependencies to reset timer if loading finishes early

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeError(false);
    console.log(`Iframe for ${url} loaded successfully.`);
  };

  // This error handler on iframe is very unreliable for X-Frame-Options
  const handleIframeError = () => {
    setIsLoading(false);
    setIframeError(true);
    console.error(`Iframe for ${url} failed to load. This might be due to X-Frame-Options or CSP.`);
  };

  return (
    <Card className="bg-card border-border w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">
          Mizzima Weekly Magazine Viewer
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </a>
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {/*
          Embedding external sites like www.mizzimaweekly.com can be blocked
          if the site sets 'X-Frame-Options: DENY' or 'X-Frame-Options: SAMEORIGIN',
          or uses a strict Content Security Policy (CSP) 'frame-ancestors'.
          If the iframe appears blank, this is the most likely cause.
          The browser's console will typically show an error message.
        */}
        {iframeError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p>Could not embed the magazine. The website may not allow embedding. Try opening it in a new tab.</p>
          </div>
        )}
        <div
          className="relative w-full bg-muted/30"
          style={{
            paddingBottom: '129.41%', /* Aspect ratio for many PDF viewers/magazines (e.g. A4 portrait ~ 1/sqrt(2) height/width) */
                                     /* For 16:9 it would be 56.25% */
                                     /* For standard US Letter portrait, it's approx 129.41% (11 / 8.5 * 100) */
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="text-foreground">Loading Magazine...</div>
              {/* You could add a spinner here */}
            </div>
          )}
          <iframe
            src={url}
            title="Mizzima Weekly Magazine"
            className="absolute top-0 left-0 w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Common sandbox attributes, adjust if needed
            loading="lazy" // Defer loading until it's near the viewport
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          If the magazine does not load, it might be due to the website's embedding restrictions (X-Frame-Options or Content-Security-Policy).
          Please use the "Open in New Tab" button.
        </p>
      </CardContent>
    </Card>
  );
};

export default MagazineViewer;

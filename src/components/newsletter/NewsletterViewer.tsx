import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface NewsletterViewerProps {
  substackUrl?: string;
}

const DEFAULT_SUBSTACK_URL = 'https://mizzimadailynews.substack.com';

const NewsletterViewer: React.FC<NewsletterViewerProps> = ({ substackUrl = DEFAULT_SUBSTACK_URL }) => {
  const [mainIframeLoading, setMainIframeLoading] = useState(true);
  const [embedIframeLoading, setEmbedIframeLoading] = useState(true);
  const [mainIframeError, setMainIframeError] = useState(false);
  const [embedIframeError, setEmbedIframeError] = useState(false);

  const substackEmbedUrl = `${substackUrl}/embed`;

  // Basic timeout to hide loader if iframe takes too long (heuristic for potential blocking)
  useEffect(() => {
    setMainIframeLoading(true);
    setMainIframeError(false);
    const mainTimer = setTimeout(() => {
      if (mainIframeLoading) {
        console.warn(`Main content iframe for ${substackUrl} is taking a long time. It might be blocked by X-Frame-Options or CSP.`);
        // Do not set error here, just stop loading indicator. User might see blank iframe.
        setMainIframeLoading(false);
      }
    }, 8000);
    return () => clearTimeout(mainTimer);
  }, [substackUrl, mainIframeLoading]);

  useEffect(() => {
    setEmbedIframeLoading(true);
    setEmbedIframeError(false);
    const embedTimer = setTimeout(() => {
      if (embedIframeLoading) {
        console.warn(`Subscription embed iframe for ${substackEmbedUrl} is taking a long time. It might be blocked.`);
        setEmbedIframeLoading(false);
         // If embed iframe fails to load, we'll rely more on the direct link button.
        setEmbedIframeError(true); // Consider it an error to prompt fallback.
      }
    }, 8000);
    return () => clearTimeout(embedTimer);
  }, [substackEmbedUrl, embedIframeLoading]);


  return (
    <Card className="bg-card border-border w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Mizzima Daily Newsletter
            </CardTitle>
            <CardDescription>
              Latest updates and articles directly from Mizzima Daily on Substack.
            </CardDescription>
          </div>
          <Button variant="default" size="sm" asChild className="mt-2 sm:mt-0">
            <a href={substackUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Mizzima Daily on Substack
            </a>
          </Button>
        </div>
      </CardHeader>

      {/* Section for Substack Subscription Embed */}
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Subscribe to our Newsletter</h3>
        {/*
          Substack's primary embedding method for subscriptions is using the /embed URL.
          If this iframe appears blank or shows an error, it's likely due to
          X-Frame-Options or CSP settings by Substack, though they usually allow /embed.
        */}
        <div className="relative w-full h-64 bg-muted/30 rounded-md overflow-hidden border border-border">
          {embedIframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="text-foreground">Loading Subscription Form...</div>
            </div>
          )}
          <iframe
            src={substackEmbedUrl}
            title="Subscribe to Mizzima Daily Newsletter"
            className="absolute top-0 left-0 w-full h-full border-0"
            onLoad={() => { setEmbedIframeLoading(false); setEmbedIframeError(false); }}
            onError={() => { setEmbedIframeLoading(false); setEmbedIframeError(true); }}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
          />
        </div>
        {embedIframeError && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-semibold">Could not load the subscription form.</p>
              <p>The embedded form might be blocked. Please use the button below to subscribe directly on Substack.</p>
              <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1">
                <a href={substackUrl} target="_blank" rel="noopener noreferrer" className="text-destructive hover:text-destructive/80">
                  Subscribe on Substack <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          By subscribing, you agree to Substack's terms and privacy policy. You can unsubscribe at any time.
          Push notifications are managed separately via browser/OS settings if offered by Substack.
        </p>
      </CardContent>

      <Separator className="my-6" />

      {/* Section for Recent Posts iframe */}
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Recent Posts</h3>
        {/*
          Embedding the main Substack page can be restricted by X-Frame-Options or CSP.
          If the iframe below is blank, this is the likely cause.
        */}
        {mainIframeError && ( // This state might not be reliably set by iframe's onError for X-Frame issues
           <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm rounded-md flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p>The main content view might be restricted. Please visit the Substack page directly for all posts.</p>
          </div>
        )}
        <div
          className="relative w-full bg-muted/30 rounded-md overflow-hidden border border-border"
          style={{ height: '70vh', minHeight: '500px' }} // Fixed height or aspect ratio
        >
          {mainIframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="text-foreground">Loading Recent Posts...</div>
            </div>
          )}
          <iframe
            src={substackUrl}
            title="Mizzima Daily Newsletter Archive"
            className="absolute top-0 left-0 w-full h-full border-0"
            onLoad={() => { setMainIframeLoading(false); setMainIframeError(false);}}
            onError={() => { setMainIframeLoading(false); setMainIframeError(true); }}
            sandbox="allow-scripts allow-same-origin" // More restrictive for main content view
            loading="lazy"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          If recent posts do not load, the website may restrict embedding. Use the button at the top to visit the page directly.
        </p>
      </CardContent>
    </Card>
  );
};

export default NewsletterViewer;


import { CardContent } from '@/components/ui/card';

interface StreamInfoProps {
  title: string;
  streamError: string | null;
  hasValidStream: boolean;
  isLive: boolean;
}

const StreamInfo = ({ title, streamError, hasValidStream, isLive }: StreamInfoProps) => {
  return (
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {streamError ? 'Stream offline' : hasValidStream ? 
              (isLive ? 'Broadcasting live from Myanmar' : 'Video content') : 
              'Stream configuration needed'
            }
          </p>
        </div>
        {isLive && !streamError && hasValidStream && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">LIVE</span>
          </div>
        )}
      </div>
    </CardContent>
  );
};

export default StreamInfo;


import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface PlayerOverlaysProps {
  isLoading: boolean;
  streamError: string | null;
  hasValidStream: boolean;
  onRetry: () => void;
}

const PlayerOverlays = ({
  isLoading,
  streamError,
  hasValidStream,
  onRetry
}: PlayerOverlaysProps) => {
  return (
    <>
      {/* Loading Overlay */}
      {isLoading && !streamError && hasValidStream && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}
      
      {/* Error Overlay */}
      {streamError && hasValidStream && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="text-center text-white">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="text-red-500 mb-2">Stream Error</div>
            <p className="text-sm mb-4">{streamError}</p>
            <Button onClick={onRetry} variant="outline" size="sm">
              Retry Stream
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerOverlays;

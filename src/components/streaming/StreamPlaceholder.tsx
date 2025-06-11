
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';

interface StreamPlaceholderProps {
  title: string;
}

const StreamPlaceholder = ({ title }: StreamPlaceholderProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center text-white p-8">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">Live stream will be available soon</p>
        <Badge className="bg-yellow-600 text-yellow-100">Coming Soon</Badge>
      </div>
    </div>
  );
};

export default StreamPlaceholder;

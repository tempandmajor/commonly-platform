
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  loadMoreUsers: () => void;
  lastVisible: any | null;
  loadingMore: boolean;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ 
  loadMoreUsers, 
  lastVisible, 
  loadingMore 
}) => {
  return (
    <div className="flex justify-center">
      <Button 
        variant="outline" 
        onClick={loadMoreUsers} 
        disabled={!lastVisible || loadingMore}
      >
        {loadingMore ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
};

export default LoadMoreButton;


import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { getPodcasts, getPodcastCategories } from "@/services/podcast";
import { isUserPro } from "@/services/subscriptionService";
import { Podcast, PodcastCategory } from "@/types/podcast";
import { useToast } from "@/components/ui/use-toast";
import RecordPodcastModal from "@/components/podcasts/RecordPodcastModal";
import UploadPodcastModal from "@/components/podcasts/UploadPodcastModal";
import PodcastHeader from "@/components/podcasts/PodcastHeader";
import PodcastSearch from "@/components/podcasts/PodcastSearch";
import PodcastContent from "@/components/podcasts/PodcastContent";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Podcasts = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchPodcasts = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Using Supabase functions instead of Firebase
      const result = await getPodcasts(12, reset ? null : lastDoc, selectedCategory, searchTerm);
      
      if (reset) {
        setPodcasts(result.podcasts || []);
      } else {
        setPodcasts(prev => [...prev, ...(result.podcasts || [])]);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.podcasts?.length === 12);
    } catch (error: any) {
      console.error("Error fetching podcasts:", error);
      setError(error?.message || "Failed to load podcasts. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load podcasts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await getPodcastCategories();
      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Warning",
        description: "Unable to load podcast categories. Some filtering options may be unavailable.",
        variant: "destructive",
      });
    }
  };

  const checkProStatus = async () => {
    if (currentUser) {
      try {
        const isPro = await isUserPro(currentUser.uid);
        setIsProUser(isPro);
      } catch (error) {
        console.error("Error checking pro status:", error);
      }
    }
  };

  // Initial data loading
  useEffect(() => {
    // Load data in sequence to avoid overwhelming the connection
    const loadInitialData = async () => {
      try {
        await fetchCategories();
        await fetchPodcasts(true);
        await checkProStatus();
      } catch (error) {
        console.error("Error during initial data loading:", error);
      }
    };
    
    loadInitialData();
  }, []);

  // Handle search/filter changes
  useEffect(() => {
    if (!initialLoad) {
      // Add a small delay to prevent too many requests when typing
      const timer = setTimeout(() => {
        fetchPodcasts(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, searchTerm]);

  const handleLoadMore = () => {
    if (!lastDoc || loading) return;
    fetchPodcasts();
  };

  const handlePodcastCreated = (podcastId: string) => {
    navigate(`/podcast/${podcastId}`);
    // Refresh the podcast list after creation
    fetchPodcasts(true);
  };

  const handleRetry = () => {
    setError(null);
    fetchPodcasts(true);
  };

  return (
    <ErrorBoundary>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PodcastHeader
          onRecordClick={() => setIsRecordModalOpen(true)}
          onUploadClick={() => setIsUploadModalOpen(true)}
          isAuthenticated={!!currentUser}
          isProUser={isProUser}
        />

        <div className="mb-6">
          <PodcastSearch
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            categories={categories}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              <p>{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="self-start flex gap-2"
                onClick={handleRetry}
              >
                <RefreshCcw className="h-4 w-4" /> Try Again
              </Button>
            </AlertDescription>
          </Alert>
        ) : initialLoad ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <PodcastContent
            activeTab={activeTab}
            onTabChange={setActiveTab}
            podcasts={podcasts}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>

      <RecordPodcastModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        categories={categories}
        onSuccess={handlePodcastCreated}
      />

      <UploadPodcastModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        categories={categories}
        onSuccess={handlePodcastCreated}
      />
    </ErrorBoundary>
  );
};

export default Podcasts;

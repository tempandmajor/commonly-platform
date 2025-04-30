
import { useState, useEffect } from "react";
import { Podcast, PodcastCategory } from "@/types/podcast";
import { getPodcasts, getPodcastCategories } from "@/services/podcast";
import { useToast } from "@/components/ui/use-toast";
import { isUserPro } from "@/services/subscriptionService";

export const usePodcastData = (userId: string | null) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [isProUser, setIsProUser] = useState<boolean>(false);

  const { toast } = useToast();

  const fetchPodcasts = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Using updated service function
      const result = await getPodcasts(12, reset ? null : lastId, selectedCategory, searchTerm);
      
      if (reset) {
        setPodcasts(result.podcasts || []);
      } else {
        setPodcasts(prev => [...prev, ...(result.podcasts || [])]);
      }
      
      setLastId(result.lastId);
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
    if (userId) {
      try {
        const isPro = await isUserPro(userId);
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
    if (!lastId || loading) return;
    fetchPodcasts();
  };

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    podcasts,
    loading,
    initialLoad,
    error,
    hasMore,
    categories,
    isProUser,
    handleLoadMore,
    fetchPodcasts,
  };
};

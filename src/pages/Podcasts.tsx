
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { getPodcasts, getPodcastCategories } from "@/services/podcast"; // Updated import path
import { isUserPro } from "@/services/subscriptionService";
import { Podcast, PodcastCategory } from "@/types/podcast";
import { useToast } from "@/hooks/use-toast";
import RecordPodcastModal from "@/components/podcasts/RecordPodcastModal";
import UploadPodcastModal from "@/components/podcasts/UploadPodcastModal";
import PodcastHeader from "@/components/podcasts/PodcastHeader";
import PodcastSearch from "@/components/podcasts/PodcastSearch";
import PodcastContent from "@/components/podcasts/PodcastContent";

const Podcasts = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true);
        const result = await getPodcasts(12, null, selectedCategory, searchTerm);
        setPodcasts(result.podcasts);
        setLastDoc(result.lastDoc);
        setHasMore(result.podcasts.length === 12);
      } catch (error) {
        console.error("Error fetching podcasts:", error);
        toast({
          title: "Error",
          description: "Failed to load podcasts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoriesData = await getPodcastCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
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

    fetchPodcasts();
    fetchCategories();
    checkProStatus();
  }, [currentUser, selectedCategory, searchTerm, toast]);

  const handleLoadMore = async () => {
    if (!lastDoc) return;

    try {
      setLoading(true);
      const result = await getPodcasts(12, lastDoc, selectedCategory, searchTerm);
      setPodcasts([...podcasts, ...result.podcasts]);
      setLastDoc(result.lastDoc);
      setHasMore(result.podcasts.length === 12);
    } catch (error) {
      console.error("Error loading more podcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePodcastCreated = (podcastId: string) => {
    navigate(`/podcasts/${podcastId}`);
  };

  return (
    <>
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

        <PodcastContent
          activeTab={activeTab}
          onTabChange={setActiveTab}
          podcasts={podcasts}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
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
    </>
  );
};

export default Podcasts;


import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import RecordPodcastModal from "@/components/podcasts/RecordPodcastModal";
import UploadPodcastModal from "@/components/podcasts/UploadPodcastModal";
import PodcastHeader from "@/components/podcasts/PodcastHeader";
import PodcastSearch from "@/components/podcasts/PodcastSearch";
import PodcastContent from "@/components/podcasts/PodcastContent";
import ErrorDisplay from "@/components/podcasts/ErrorDisplay";
import LoadingIndicator from "@/components/podcasts/LoadingIndicator";
import { usePodcastData } from "@/hooks/usePodcastData";

const Podcasts = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  
  const {
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
  } = usePodcastData(currentUser?.id);

  const handlePodcastCreated = (podcastId: string) => {
    navigate(`/podcast/${podcastId}`);
    // Refresh the podcast list after creation
    fetchPodcasts(true);
  };

  const handleRetry = () => {
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
          <ErrorDisplay message={error} onRetry={handleRetry} />
        ) : initialLoad ? (
          <LoadingIndicator />
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

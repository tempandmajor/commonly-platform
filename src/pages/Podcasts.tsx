
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PodcastGrid from "@/components/podcasts/PodcastGrid";
import { getPodcasts, getPodcastCategories } from "@/services/podcastService";
import { Podcast, PodcastCategory } from "@/types/podcast";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Search, Mic, Upload, Podcast as PodcastIcon } from "lucide-react";
import { isUserPro } from "@/services/subscriptionService";
import RecordPodcastModal from "@/components/podcasts/RecordPodcastModal";
import UploadPodcastModal from "@/components/podcasts/UploadPodcastModal";

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already triggered by the useEffect
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

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

  const handleCreateClick = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a podcast",
        variant: "destructive",
      });
      return;
    }

    if (isProUser) {
      setIsRecordModalOpen(true);
    } else {
      toast({
        title: "Pro subscription required",
        description: "You need a Pro subscription to record podcasts. You can still upload external podcasts.",
        variant: "default",
      });
    }
  };

  const handleUploadClick = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload a podcast",
        variant: "destructive",
      });
      return;
    }

    setIsUploadModalOpen(true);
  };

  const handlePodcastCreated = (podcastId: string) => {
    navigate(`/podcasts/${podcastId}`);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <PodcastIcon className="h-8 w-8 mr-2" />
              Podcasts
            </h1>
            <p className="text-muted-foreground">
              Discover and listen to podcasts from creators
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleCreateClick} className="flex items-center">
              <Mic className="h-4 w-4 mr-2" />
              Record Podcast
            </Button>
            <Button variant="outline" onClick={handleUploadClick}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Podcast
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search podcasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Podcasts</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <PodcastGrid
              podcasts={podcasts}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
            />
          </TabsContent>

          <TabsContent value="audio" className="mt-6">
            <PodcastGrid
              podcasts={podcasts.filter((podcast) => podcast.type === "audio")}
              loading={loading}
              hasMore={hasMore && podcasts.some((podcast) => podcast.type === "audio")}
              onLoadMore={handleLoadMore}
            />
          </TabsContent>

          <TabsContent value="video" className="mt-6">
            <PodcastGrid
              podcasts={podcasts.filter((podcast) => podcast.type === "video")}
              loading={loading}
              hasMore={hasMore && podcasts.some((podcast) => podcast.type === "video")}
              onLoadMore={handleLoadMore}
            />
          </TabsContent>
        </Tabs>
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

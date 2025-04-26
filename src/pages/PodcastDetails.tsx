
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import {
  getPodcast,
  getPodcastComments,
  addPodcastComment,
} from "@/services/podcastService";
import { Podcast, PodcastComment } from "@/types/podcast";
import { useToast } from "@/hooks/use-toast";
import PodcastPlayer from "@/components/podcasts/PodcastPlayer";
import { ArrowLeft, Calendar, Headphones, MessageSquare, Share, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PodcastDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [comments, setComments] = useState<PodcastComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPodcastData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const podcastData = await getPodcast(id);
        if (podcastData) {
          setPodcast(podcastData);
          
          // Fetch comments
          const commentsData = await getPodcastComments(id);
          setComments(commentsData);
        } else {
          toast({
            title: "Podcast not found",
            description: "The requested podcast could not be found",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching podcast:", error);
        toast({
          title: "Error",
          description: "Failed to load podcast",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPodcastData();
  }, [id, toast]);

  const formatDate = (timestamp: any): string => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !currentUser || !id) return;
    
    try {
      setIsSubmittingComment(true);
      const comment = await addPodcastComment(id, currentUser.uid, commentText);
      setComments([comment, ...comments]);
      setCommentText("");
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!podcast) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Podcast not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/podcasts" className="inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to podcasts
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{podcast.title}</h1>
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant={podcast.type === "audio" ? "outline" : "secondary"}>
                  {podcast.type === "audio" ? (
                    <Headphones className="h-3 w-3 mr-1" />
                  ) : (
                    <Video className="h-3 w-3 mr-1" />
                  )}
                  {podcast.type}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(podcast.createdAt)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {podcast.listens} listens
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {podcast.creatorName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Link
                  to={`/profile/${podcast.creatorId}`}
                  className="font-medium hover:underline"
                >
                  {podcast.creatorName}
                </Link>
              </div>
            </div>

            <PodcastPlayer podcast={podcast} />

            <div className="mt-6">
              <Tabs defaultValue="description">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="comments">
                    Comments ({comments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="whitespace-pre-line">{podcast.description}</p>

                      {podcast.tags && podcast.tags.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Tags:</h4>
                          <div className="flex flex-wrap gap-2">
                            {podcast.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="mr-2">
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comments" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      {currentUser ? (
                        <form onSubmit={handleSubmitComment} className="mb-6">
                          <Textarea
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="mb-2 resize-none"
                            rows={3}
                          />
                          <Button
                            type="submit"
                            disabled={!commentText.trim() || isSubmittingComment}
                          >
                            {isSubmittingComment ? "Posting..." : "Post Comment"}
                          </Button>
                        </form>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-md mb-6 text-center">
                          <p className="text-muted-foreground mb-2">
                            Sign in to add a comment
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => window.location.href = "/login"}
                          >
                            Sign In
                          </Button>
                        </div>
                      )}

                      {comments.length > 0 ? (
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <div key={comment.id} className="pb-4">
                              <div className="flex space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.userPhotoUrl || undefined} />
                                  <AvatarFallback>
                                    {comment.userName?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <Link
                                      to={`/profile/${comment.userId}`}
                                      className="font-medium hover:underline"
                                    >
                                      {comment.userName}
                                    </Link>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="mt-1">{comment.content}</p>
                                </div>
                              </div>
                              <Separator className="mt-4" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-6">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">More from this creator</h2>
                <p className="text-sm text-muted-foreground py-6 text-center">
                  More podcasts will appear here as they are added.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PodcastDetails;

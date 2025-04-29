
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  getVenturesContent, 
  getArtistsByCategory, 
  updateVenturesContent, 
  addArtist,
  updateArtist,
  deleteArtist 
} from '@/services/venturesService';
import ContentEditor from '@/components/admin/ventures/ContentEditor';
import ArtistForm from '@/components/admin/ventures/ArtistForm';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VenturesContent, ArtistProfile } from '@/types/ventures';
import { useQueryClient } from '@tanstack/react-query';

const Ventures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('management');
  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [isAddArtistOpen, setIsAddArtistOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<ArtistProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content } = useQuery({
    queryKey: ['venturesContent', activeTab],
    queryFn: () => getVenturesContent(activeTab),
  });

  const { data: artists } = useQuery({
    queryKey: ['artists', activeTab],
    queryFn: () => getArtistsByCategory(activeTab),
  });

  const handleSaveContent = async (data: Partial<VenturesContent>) => {
    setIsSubmitting(true);
    try {
      await updateVenturesContent(activeTab, data);
      await queryClient.invalidateQueries({ queryKey: ['venturesContent', activeTab] });
      setIsContentEditorOpen(false);
      toast({ title: "Content updated successfully" });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Failed to update content", 
        description: "Please try again later" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddArtist = async (data: Partial<ArtistProfile>) => {
    setIsSubmitting(true);
    try {
      await addArtist({
        ...data,
        category: activeTab as 'management' | 'records' | 'studios'
      } as any);
      await queryClient.invalidateQueries({ queryKey: ['artists', activeTab] });
      setIsAddArtistOpen(false);
      toast({ title: "Artist added successfully" });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Failed to add artist", 
        description: "Please try again later" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateArtist = async (data: Partial<ArtistProfile>) => {
    if (!editingArtist) return;
    
    setIsSubmitting(true);
    try {
      await updateArtist(editingArtist.id, data);
      await queryClient.invalidateQueries({ queryKey: ['artists', activeTab] });
      setEditingArtist(null);
      toast({ title: "Artist updated successfully" });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Failed to update artist", 
        description: "Please try again later" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArtist = async (artist: ArtistProfile) => {
    if (!confirm(`Are you sure you want to delete ${artist.name}?`)) return;
    
    try {
      await deleteArtist(artist.id);
      await queryClient.invalidateQueries({ queryKey: ['artists', activeTab] });
      toast({ title: "Artist deleted successfully" });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Failed to delete artist", 
        description: "Please try again later" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ventures Management</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="studios">Studios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Page Content</h2>
                  <p className="text-muted-foreground">
                    Edit the content displayed on the Management page
                  </p>
                </div>
                <Button onClick={() => setIsContentEditorOpen(true)}>
                  Edit Content
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Management Artists</h2>
                  <p className="text-muted-foreground">
                    Manage artists displayed on the Management page
                  </p>
                </div>
                <Button onClick={() => setIsAddArtistOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Artist
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artists?.map((artist) => (
                  <Card key={artist.id} className="overflow-hidden">
                    <div className="relative h-40">
                      {artist.imageUrl ? (
                        <img 
                          src={artist.imageUrl} 
                          alt={artist.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 h-full flex items-center justify-center">
                          No Image
                        </div>
                      )}
                      {artist.featured && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-lg">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {artist.bio}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingArtist(artist)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteArtist(artist)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {!artists?.length && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No artists found. Add your first artist.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Page Content</h2>
                  <p className="text-muted-foreground">
                    Edit the content displayed on the Records page
                  </p>
                </div>
                <Button onClick={() => setIsContentEditorOpen(true)}>
                  Edit Content
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Records Artists</h2>
                  <p className="text-muted-foreground">
                    Manage artists displayed on the Records page
                  </p>
                </div>
                <Button onClick={() => setIsAddArtistOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Artist
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artists?.map((artist) => (
                  <Card key={artist.id} className="overflow-hidden">
                    <div className="relative h-40">
                      {artist.imageUrl ? (
                        <img 
                          src={artist.imageUrl} 
                          alt={artist.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 h-full flex items-center justify-center">
                          No Image
                        </div>
                      )}
                      {artist.featured && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-lg">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {artist.bio}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingArtist(artist)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteArtist(artist)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {!artists?.length && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No artists found. Add your first artist.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="studios" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Page Content</h2>
                  <p className="text-muted-foreground">
                    Edit the content displayed on the Studios page
                  </p>
                </div>
                <Button onClick={() => setIsContentEditorOpen(true)}>
                  Edit Content
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Studios Artists</h2>
                  <p className="text-muted-foreground">
                    Manage artists displayed on the Studios page
                  </p>
                </div>
                <Button onClick={() => setIsAddArtistOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Artist
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artists?.map((artist) => (
                  <Card key={artist.id} className="overflow-hidden">
                    <div className="relative h-40">
                      {artist.imageUrl ? (
                        <img 
                          src={artist.imageUrl} 
                          alt={artist.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 h-full flex items-center justify-center">
                          No Image
                        </div>
                      )}
                      {artist.featured && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-lg">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {artist.bio}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingArtist(artist)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteArtist(artist)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {!artists?.length && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No artists found. Add your first artist.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isContentEditorOpen} onOpenChange={setIsContentEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Content</DialogTitle>
          </DialogHeader>
          <ContentEditor
            initialData={content || {}}
            contentType={activeTab}
            onSubmit={handleSaveContent}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddArtistOpen} onOpenChange={setIsAddArtistOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Artist</DialogTitle>
          </DialogHeader>
          <ArtistForm
            onSubmit={handleAddArtist}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingArtist} onOpenChange={(open) => !open && setEditingArtist(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Artist</DialogTitle>
          </DialogHeader>
          {editingArtist && (
            <ArtistForm
              initialData={editingArtist}
              onSubmit={handleUpdateArtist}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ventures;

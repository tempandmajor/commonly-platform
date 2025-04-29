
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ContentItem {
  id: string;
  title: string | null;
  updated_at: string | null;
}

const ContentListTable = () => {
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContentList();
  }, []);

  const fetchContentList = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      setContentList(data || []);
    } catch (error) {
      console.error('Error fetching content list:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load content list',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/content/edit/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Content Pages</h2>
        <Button onClick={() => navigate('/admin/content/new')}>
          Create New Page
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : contentList.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No content pages found.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/admin/content/new')}
          >
            Create Your First Page
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.id}</TableCell>
                  <TableCell>{item.title || 'Untitled'}</TableCell>
                  <TableCell>
                    {item.updated_at 
                      ? new Date(item.updated_at).toLocaleDateString() 
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(item.id)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ContentListTable;

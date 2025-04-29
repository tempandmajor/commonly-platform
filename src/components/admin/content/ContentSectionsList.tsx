
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ContentData, Section } from './types';
import ContentSectionItem from './ContentSectionItem';

interface ContentSectionsListProps {
  pageData: ContentData;
  onAddSection: () => void;
  onSectionChange: (index: number, field: keyof Section, value: string) => void;
  onRemoveSection: (index: number) => void;
  sectionImageFiles: Record<number, File>;
  onSectionImageChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  uploading: string | null;
  setUploading: React.Dispatch<React.SetStateAction<string | null>>;
  setSectionImageFiles: React.Dispatch<React.SetStateAction<Record<number, File>>>;
}

const ContentSectionsList: React.FC<ContentSectionsListProps> = ({
  pageData,
  onAddSection,
  onSectionChange,
  onRemoveSection,
  sectionImageFiles,
  onSectionImageChange,
  uploading,
  setUploading,
  setSectionImageFiles
}) => {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Content Sections</h3>
        <Button 
          onClick={onAddSection} 
          variant="outline"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>
      
      {pageData.sections.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            No content sections added yet. Click "Add Section" to create one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pageData.sections.map((section, index) => (
            <ContentSectionItem
              key={index}
              section={section}
              index={index}
              onSectionChange={onSectionChange}
              onRemoveSection={onRemoveSection}
              sectionImageFile={sectionImageFiles[index]}
              onSectionImageChange={onSectionImageChange}
              uploading={uploading}
              setUploading={setUploading}
              setSectionImageFiles={setSectionImageFiles}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentSectionsList;

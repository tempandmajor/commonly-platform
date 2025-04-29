
import React from 'react';
import { Input } from '@/components/ui/input';

interface PageMetadataFormProps {
  pageTitle: string;
  setPageTitle: React.Dispatch<React.SetStateAction<string>>;
  pageIdInput: string;
  setPageIdInput: React.Dispatch<React.SetStateAction<string>>;
  isNew: boolean;
}

const PageMetadataForm: React.FC<PageMetadataFormProps> = ({
  pageTitle,
  setPageTitle,
  pageIdInput,
  setPageIdInput,
  isNew
}) => {
  return (
    <div className="grid gap-6">
      {isNew && (
        <div className="grid gap-2">
          <label htmlFor="pageId" className="text-sm font-medium">
            Page ID (URL slug) *
          </label>
          <Input
            id="pageId"
            value={pageIdInput}
            onChange={(e) => setPageIdInput(e.target.value)}
            placeholder="e.g. for-creators, help-center, privacy-policy"
            required
          />
          <p className="text-xs text-muted-foreground">
            This will be used in the URL, e.g. /content/for-creators
          </p>
        </div>
      )}

      <div className="grid gap-2">
        <label htmlFor="pageTitle" className="text-sm font-medium">
          Page Title *
        </label>
        <Input
          id="pageTitle"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          placeholder="Enter page title"
          required
        />
      </div>
    </div>
  );
};

export default PageMetadataForm;

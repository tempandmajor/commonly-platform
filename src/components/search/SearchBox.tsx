import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { globalSearch, SearchResult } from '@/services/searchService';
import { useNavigate } from 'react-router-dom';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SearchBoxProps {
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
        // Focus the input after a short delay to ensure the popover is open
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const searchResults = await globalSearch(query, 5);
        // Combine all results into a single array
        const combinedResults: SearchResult[] = [
          ...searchResults.events,
          ...searchResults.venues,
          ...searchResults.users,
          ...searchResults.podcasts,
        ];
        setResults(combinedResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'event':
        navigate(`/events/${result.id}`);
        break;
      case 'venue':
        navigate(`/venues/${result.id}`);
        break;
      case 'user':
        navigate(`/profile/${result.id}`);
        break;
      case 'podcast':
        navigate(`/podcasts/${result.id}`);
        break;
      default:
        console.warn('Unknown search result type:', result.type);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`group flex items-center rounded-lg border border-input bg-background px-4 py-2 text-sm text-muted-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Search...</span>
          <span className="ml-auto text-xs tracking-widest text-muted-foreground group-hover:text-foreground">
            Ctrl+K
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder="Type a command or search..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {loading && (
              <CommandItem className="justify-center">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  Searching...
                </div>
              </CommandItem>
            )}
            {results.length > 0 && (
              <CommandGroup heading="Results">
                {results.map((result) => (
                  
                  {result.type === 'event' && (
                    <div key={result.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer" onClick={() => handleSelect(result)}>
                      <div className="h-10 w-10 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                        {result.imageUrl ? (
                          <img src={result.imageUrl} alt={result.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                            E
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      </div>
                    </div>
                  )}

                  
                  {result.type === 'venue' && (
                    <div key={result.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer" onClick={() => handleSelect(result)}>
                      <div className="h-10 w-10 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                        {result.imageUrl ? (
                          <img src={result.imageUrl} alt={result.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                            V
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      </div>
                    </div>
                  )}

                  
                  {result.type === 'user' && (
                    <div key={result.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer" onClick={() => handleSelect(result)}>
                      <div className="h-10 w-10 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                        {result.imageUrl ? (
                          <img src={result.imageUrl} alt={result.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                            U
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      </div>
                    </div>
                  )}

                  
                  {result.type === 'podcast' && (
                    <div key={result.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer" onClick={() => handleSelect(result)}>
                      <div className="h-10 w-10 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                        {result.imageUrl ? (
                          <img src={result.imageUrl} alt={result.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                            P
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      </div>
                    </div>
                  )}
                
                ))}
              </CommandGroup>
            )}
            <CommandSeparator />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchBox;

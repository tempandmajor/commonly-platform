
import React, { useRef, useState } from 'react';
import { SearchIcon, Loader2, X } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useNavigate } from 'react-router-dom';
import { useOnClickOutside } from '@/hooks/useClickOutside';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

export function SearchBox() {
  const [open, setOpen] = useState(false);
  const { query, setQuery, results, isSearching } = useSearch();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSelect = (result: any) => {
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
      default:
        break;
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setQuery('');
    }
  };

  // Close dropdown when clicking outside
  useOnClickOutside(searchRef, () => setOpen(false));

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <Button
        variant="outline"
        className="flex items-center justify-between px-3 w-full md:w-64 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center">
          <SearchIcon className="mr-2 h-4 w-4" />
          <span className="text-muted-foreground">
            Search events, venues, people...
          </span>
        </div>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <div className="flex items-center border-b px-3">
          <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            placeholder="Search events, venues, people..."
            value={query}
            onValueChange={setQuery}
          />
          {isSearching && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          {query && !isSearching && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CommandList>
          {query.length < 3 && (
            <CommandEmpty>
              Type at least 3 characters to search...
            </CommandEmpty>
          )}
          {query.length >= 3 && results.length === 0 && !isSearching && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {results.length > 0 && (
            <>
              {results.some(result => result.type === 'event') && (
                <CommandGroup heading="Events">
                  {results
                    .filter(result => result.type === 'event')
                    .map(result => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                      >
                        <div className="flex items-center">
                          {result.image_url && (
                            <img
                              src={result.image_url}
                              alt={result.title}
                              className="mr-2 h-6 w-6 rounded-full object-cover"
                            />
                          )}
                          <span>{result.title}</span>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}

              {results.some(result => result.type === 'venue') && (
                <CommandGroup heading="Venues">
                  {results
                    .filter(result => result.type === 'venue')
                    .map(result => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                      >
                        <div className="flex items-center">
                          {result.image_url && (
                            <img
                              src={result.image_url}
                              alt={result.title}
                              className="mr-2 h-6 w-6 rounded object-cover"
                            />
                          )}
                          <span>{result.title}</span>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}

              {results.some(result => result.type === 'user') && (
                <CommandGroup heading="People">
                  {results
                    .filter(result => result.type === 'user')
                    .map(result => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                      >
                        <div className="flex items-center">
                          {result.image_url ? (
                            <img
                              src={result.image_url}
                              alt={result.title}
                              className="mr-2 h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="mr-2 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                              {result.title.charAt(0)}
                            </div>
                          )}
                          <span>{result.title}</span>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}

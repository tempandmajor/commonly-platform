
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { SearchResult } from "@/types/search";
import { Search, X, Users, MapPin, Calendar, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SearchBoxProps {
  onSearch?: (query: string) => void;
  initialResults?: {
    events: SearchResult[];
    venues: SearchResult[];
    users: SearchResult[];
    podcasts: SearchResult[];
  };
}

export const SearchBox: React.FC<SearchBoxProps> = ({ 
  onSearch, 
  initialResults = { events: [], venues: [], users: [], podcasts: [] } 
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<{
    events: SearchResult[];
    venues: SearchResult[];
    users: SearchResult[];
    podcasts: SearchResult[];
  }>(initialResults);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("events");
  const [showResults, setShowResults] = useState<boolean>(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setResults({ events: [], venues: [], users: [], podcasts: [] });
      return;
    }
    
    setIsSearching(true);
    if (onSearch) onSearch(searchQuery);
    setIsSearching(false);
    setShowResults(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") {
      setResults({ events: [], venues: [], users: [], podcasts: [] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleClear = () => {
    setSearchQuery("");
    setResults({ events: [], venues: [], users: [], podcasts: [] });
    setShowResults(false);
  };

  // Handle clicks outside the search box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Count total results
  const totalResults = 
    results.events.length + 
    results.venues.length + 
    results.users.length + 
    results.podcasts.length;

  return (
    <div className="relative w-full" ref={searchBoxRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search events, venues, people..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => searchQuery && setShowResults(true)}
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={handleClear}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        <button type="submit" className="sr-only">Search</button>
      </form>

      {showResults && totalResults > 0 && (
        <Card className="absolute mt-2 w-full z-50">
          <CardContent className="p-0">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="events" className="flex-1">
                  Events ({results.events.length})
                </TabsTrigger>
                <TabsTrigger value="venues" className="flex-1">
                  Venues ({results.venues.length})
                </TabsTrigger>
                <TabsTrigger value="users" className="flex-1">
                  People ({results.users.length})
                </TabsTrigger>
                <TabsTrigger value="podcasts" className="flex-1">
                  Podcasts ({results.podcasts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="py-1">
                {results.events.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {results.events.map((event) => (
                      <Link
                        key={event.id}
                        to={`/events/${event.id}`}
                        className="flex items-center p-2 hover:bg-gray-100 transition-colors"
                      >
                        <div className="h-10 w-10 mr-3 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                          {event.image_url ? (
                            <img src={event.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Calendar className="h-5 w-5 m-auto text-gray-400" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs text-gray-500 truncate">{event.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">No events found</div>
                )}
              </TabsContent>

              <TabsContent value="venues" className="py-1">
                {results.venues.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {results.venues.map((venue) => (
                      <Link
                        key={venue.id}
                        to={`/venues/${venue.id}`}
                        className="flex items-center p-2 hover:bg-gray-100 transition-colors"
                      >
                        <div className="h-10 w-10 mr-3 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                          {venue.image_url ? (
                            <img src={venue.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <MapPin className="h-5 w-5 m-auto text-gray-400" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium">{venue.title}</div>
                          <div className="text-xs text-gray-500 truncate">{venue.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">No venues found</div>
                )}
              </TabsContent>

              <TabsContent value="users" className="py-1">
                {results.users.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {results.users.map((user) => (
                      <Link
                        key={user.id}
                        to={`/profile/${user.id}`}
                        className="flex items-center p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={user.image_url || ''} />
                          <AvatarFallback>
                            {user.title ? user.title.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="font-medium">{user.title}</div>
                          <div className="text-xs text-gray-500 truncate">{user.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">No users found</div>
                )}
              </TabsContent>

              <TabsContent value="podcasts" className="py-1">
                {results.podcasts.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {results.podcasts.map((podcast) => (
                      <Link
                        key={podcast.id}
                        to={`/podcasts/${podcast.id}`}
                        className="flex items-center p-2 hover:bg-gray-100 transition-colors"
                      >
                        <div className="h-10 w-10 mr-3 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                          {podcast.image_url ? (
                            <img src={podcast.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Mic className="h-5 w-5 m-auto text-gray-400" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium">{podcast.title}</div>
                          <div className="text-xs text-gray-500 truncate">{podcast.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">No podcasts found</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {showResults && totalResults === 0 && searchQuery.trim() !== "" && !isSearching && (
        <Card className="absolute mt-2 w-full z-50">
          <CardContent className="p-4 text-center">
            <p className="text-gray-500">No results found for "{searchQuery}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBox;

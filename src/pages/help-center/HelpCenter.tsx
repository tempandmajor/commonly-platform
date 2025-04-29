
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Book, Calendar, Pencil, User, Users, Info, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const categories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: <Info className="h-5 w-5" />,
    guides: [
      { id: 'platform-overview', title: 'Platform Overview', slug: 'platform-overview' },
      { id: 'account-setup', title: 'Account Setup', slug: 'account-setup' },
      { id: 'navigation', title: 'Navigating the Platform', slug: 'navigation' }
    ]
  },
  {
    id: 'events',
    name: 'Events',
    icon: <Calendar className="h-5 w-5" />,
    guides: [
      { id: 'create-event', title: 'Creating an Event', slug: 'create-event' },
      { id: 'manage-events', title: 'Managing Your Events', slug: 'manage-events' },
      { id: 'virtual-events', title: 'Setting Up Virtual Events', slug: 'virtual-events' }
    ]
  },
  {
    id: 'venues',
    name: 'Venues',
    icon: <Book className="h-5 w-5" />,
    guides: [
      { id: 'add-venue', title: 'Adding a Venue', slug: 'add-venue' },
      { id: 'venue-verification', title: 'Venue Verification Process', slug: 'venue-verification' }
    ]
  },
  {
    id: 'creators',
    name: 'For Creators',
    icon: <Pencil className="h-5 w-5" />,
    guides: [
      { id: 'creator-tools', title: 'Creator Tools Overview', slug: 'creator-tools' },
      { id: 'content-promotion', title: 'Promoting Your Content', slug: 'content-promotion' },
      { id: 'engagement', title: 'Boosting Engagement', slug: 'engagement' }
    ]
  },
  {
    id: 'monetization',
    name: 'Monetization',
    icon: <Link className="h-5 w-5" />,
    guides: [
      { id: 'referrals', title: 'Referral Program', slug: 'referrals' },
      { id: 'platform-credits', title: 'Platform Credits', slug: 'platform-credits' },
      { id: 'payment-options', title: 'Payment Options', slug: 'payment-options' }
    ]
  },
  {
    id: 'account',
    name: 'Account & Profile',
    icon: <User className="h-5 w-5" />,
    guides: [
      { id: 'profile-optimization', title: 'Optimizing Your Profile', slug: 'profile-optimization' },
      { id: 'privacy-settings', title: 'Privacy Settings', slug: 'privacy-settings' }
    ]
  },
  {
    id: 'community',
    name: 'Community',
    icon: <Users className="h-5 w-5" />,
    guides: [
      { id: 'connecting', title: 'Connecting with Others', slug: 'connecting' },
      { id: 'messaging', title: 'Messaging System', slug: 'messaging' }
    ]
  }
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCategories = searchQuery 
    ? categories.map(category => ({
        ...category,
        guides: category.guides.filter(guide => 
          guide.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.guides.length > 0)
    : categories;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions and step-by-step guides to help you make the most of the platform.
            </p>
            
            <div className="mt-8 max-w-lg mx-auto">
              <Input
                type="search"
                placeholder="Search for help..."
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Popular Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Creating Your First Event',
                  description: 'Learn how to create and publish your first event',
                  slug: 'create-event'
                },
                {
                  title: 'Using Platform Credits',
                  description: 'How to earn and spend credits on our platform',
                  slug: 'platform-credits'
                },
                {
                  title: 'Setting Up Your Profile',
                  description: 'Optimize your profile for better visibility',
                  slug: 'profile-optimization'
                }
              ].map((topic, index) => (
                <div key={index} className="bg-white p-5 rounded-lg shadow-sm hover:shadow transition-shadow">
                  <h3 className="font-medium mb-2">{topic.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{topic.description}</p>
                  <Button asChild variant="outline" size="sm">
                    <RouterLink to={`/help-center/guides/${topic.slug}`}>Read Guide</RouterLink>
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <NavigationMenu className="my-6 flex justify-center">
            <NavigationMenuList className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <NavigationMenuItem key={category.id}>
                  <NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-2 p-4">
                      {category.guides.map((guide) => (
                        <li key={guide.id}>
                          <NavigationMenuLink asChild>
                            <RouterLink
                              to={`/help-center/guides/${guide.slug}`}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{guide.title}</div>
                            </RouterLink>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">Help Categories</h2>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No guides found matching "{searchQuery}"</p>
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <Collapsible key={category.id} className="border rounded-lg bg-white overflow-hidden">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="mr-3 text-primary">{category.icon}</div>
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {category.guides.length} guide{category.guides.length !== 1 ? 's' : ''}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-1 border-t">
                      <ul className="space-y-2">
                        {category.guides.map((guide) => (
                          <li key={guide.id}>
                            <RouterLink 
                              to={`/help-center/guides/${guide.slug}`}
                              className="block p-2 hover:bg-gray-50 rounded text-sm transition-colors"
                            >
                              {guide.title}
                            </RouterLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;

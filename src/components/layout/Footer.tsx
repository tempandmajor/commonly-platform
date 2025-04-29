
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/">
              <img 
                src="/lovable-uploads/13680d9d-b642-446a-9311-a7707d98a527.png" 
                alt="Commonly" 
                className="h-8 mb-4" 
              />
            </Link>
            <p className="text-gray-300 mb-4">
              Creating memorable experiences and connecting communities through events, venues and more.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Youtube />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/events" className="text-gray-300 hover:text-white">Events</Link></li>
              <li><Link to="/venues" className="text-gray-300 hover:text-white">Venues</Link></li>
              <li><Link to="/catering" className="text-gray-300 hover:text-white">Catering</Link></li>
              <li><Link to="/podcasts" className="text-gray-300 hover:text-white">Podcasts</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Commonly Ventures</h3>
            <ul className="space-y-2">
              <li><Link to="/ventures/management" className="text-gray-300 hover:text-white">Management</Link></li>
              <li><Link to="/ventures/records" className="text-gray-300 hover:text-white">Records</Link></li>
              <li><Link to="/ventures/studios" className="text-gray-300 hover:text-white">Studios</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Press</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Commonly. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-eco-green/10 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-eco-dark mb-4">
              <span className="text-3xl">🌱</span>
              EcoSort
            </div>
            <p className="text-eco-light mb-4 max-w-md">
              Making waste management smarter and more sustainable. Join our community 
              in building a cleaner, greener future through proper waste disposal education.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/ecosort" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-eco-light hover:text-eco-green transition-colors"
              >
                <Github size={20} />
              </a>
              <a 
                href="mailto:contact@ecosort.com"
                className="text-eco-light hover:text-eco-green transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-eco-dark mb-4">Quick Links</h3>
            <ul className="space-y-2 text-eco-light">
              <li>
                <Link to="/waste-guide" className="hover:text-eco-green transition-colors">
                  Waste Guide
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-eco-green transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-eco-green transition-colors">
                  Bin Locator
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-eco-dark mb-4">Support</h3>
            <ul className="space-y-2 text-eco-light">
              <li>
                <a href="#" className="hover:text-eco-green transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-eco-green transition-colors">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-eco-green transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-eco-green transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-eco-light text-sm">
            © 2025 EcoSort. Built for sustainable waste management.
          </p>
          <p className="text-eco-light text-sm flex items-center gap-1">
            Made with <Heart className="text-eco-green" size={16} /> for a cleaner planet
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

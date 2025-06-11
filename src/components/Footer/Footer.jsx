import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';

function Footer() {
  return (
    <footer className="bg-[#3980d1] text-white border-t border-blue-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="flex flex-col space-y-4">
            <Logo width="120px" />
            <p className="text-sm text-white/80">
              Building better digital experiences with powerful tools and beautiful design.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase mb-4 text-white tracking-wider">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:underline text-white/90">Features</Link></li>
              <li><Link to="/" className="hover:underline text-white/90">Pricing</Link></li>
              <li><Link to="/" className="hover:underline text-white/90">Affiliate Program</Link></li>
              <li><Link to="/" className="hover:underline text-white/90">Press Kit</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase mb-4 text-white tracking-wider">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:underline text-white/90">Account</Link></li>
              <li><Link to="/" className="hover:underline text-white/90">Help</Link></li>
              <li><Link to="/" className="hover:underline text-white/90">Contact Us</Link></li>
              <li><Link to="/" className="hover:underline text-white/90">Customer Support</Link></li>
            </ul>
          </div>

          {/* Legals */}
          <div>
            <h3 className="text-sm font-semibold uppercase mb-4 text-white tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:underline text-white/90">Terms & Conditions</Link></li>
              <li><Link to="/" className="hover:underline text-white/90">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:underline text-white/90">Licensing</Link></li>
            </ul>
            <p className="text-xs mt-6 text-white/70">
              &copy; {new Date().getFullYear()} Nishant. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

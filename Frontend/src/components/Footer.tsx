import React from 'react';
import { Linkedin, Twitter, Mail, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="mr-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-white/15">
                <img
                  src="/logo.png"
                  alt="AlumniConnect"
                  className="mt-2 block h-full w-full scale-[1.8] origin-center object-contain object-center"
                />
              </div>
              <h2 className="text-2xl font-bold font-syne">AlumniConnect</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Bridging the gap between students and alumni through meaningful professional connections.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">For Students</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">For Alumni</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Mentorship Programs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Success Stories</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Events</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Career Resources</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition">
                <Linkedin size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-blue-400 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-red-500 transition">
                <Mail size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-green-500 transition">
                <Globe size={20} />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              Questions? Contact us at<br />
              <a href="mailto:support@alumniconnect.edu" className="text-blue-400 hover:underline">
                support@alumniconnect.edu
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} AlumniConnect. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
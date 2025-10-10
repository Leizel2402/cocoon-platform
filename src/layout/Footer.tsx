import {
  HomeIcon,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import React from "react";
 
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 lg:grid-cols-2 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg mr-3">
                <HomeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                {/* <h3 className="text-2xl font-bold">Cocoon</h3> */}
                <p className="text-blue-300 text-sm">Find Your Dream Home</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Discover amazing rental properties in top cities across the
              country. Your perfect home is just a search away with our
              comprehensive platform.
            </p>
 
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  123 Real Estate Ave, City, State 12345
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@renthome.com</span>
              </div>
            </div>
          </div>
 
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                "Search Properties",
                "Featured Listings",
                "Property Management",
                "Rent Calculator",
                "Neighborhood Guide",
                "Moving Tips",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
 
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Services</h4>
            <ul className="space-y-3">
              {[
                
                "Rent a Home",
               
                "Real Estate Agent",
                "Market Analysis",
              ].map((service) => (
                <li key={service}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>
 
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">
              Stay Connected
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              Subscribe to our newsletter for the latest property updates and
              market insights.
            </p>
 
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium text-sm whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
 
            <div>
              <h5 className="text-sm font-medium text-white mb-3">Follow Us</h5>
              <div className="flex space-x-3">
                {[
                  { icon: Facebook, href: "#", label: "Facebook" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" },
                  { icon: Youtube, href: "#", label: "YouTube" },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 group"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5 text-gray-300 group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
 
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-gray-300 text-sm">
                © 2022 rental. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
 
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-gray-300 text-sm">Secure Platform</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span className="text-gray-300 text-sm">Verified Listings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
 
export default Footer;
 
 
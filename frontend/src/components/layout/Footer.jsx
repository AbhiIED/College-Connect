import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Github, Youtube, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-indigo-950 text-gray-300 overflow-hidden">
      {/* Decorative top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      {/* Decorative background circles */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 -right-20 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">
              Alumni Connect
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              A platform to connect students and alumni of MANIT. Stay in touch,
              explore opportunities, and give back to your community.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Github, href: "#" },
                { Icon: Youtube, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Alumni Directory", to: "/directory" },
                { label: "My Connections", to: "/connections" },
                { label: "Feed", to: "/feed" },
                { label: "Jobs", to: "/jobs" },
                { label: "Donate", to: "/donations" },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "MANIT", href: "#" },
                { label: "Vision", href: "#" },
                { label: "About Us", href: "#" },
                { label: "Events", to: "/events" },
                { label: "News", to: "/all-news" },
              ].map((item, i) =>
                item.to ? (
                  <li key={i}>
                    <Link
                      to={item.to}
                      className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ) : (
                  <li key={i}>
                    <a
                      href={item.href}
                      className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                    >
                      {item.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Stay Connected
            </h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Subscribe to get the latest updates from alumni and students.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Alumni Connect, MANIT Bhopal. All
            rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by MANIT Students
          </p>
        </div>
      </div>
    </footer>
  );
}

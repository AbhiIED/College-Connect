// src/components/layout/Layout.jsx
import React, { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change (mimic natural page navigation)
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet /> {/* ✅ Required for nested route rendering */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

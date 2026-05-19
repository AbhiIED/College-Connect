// src/components/layout/Layout.jsx
import React, { useEffect, useRef } from "react";
import LocomotiveScroll from "locomotive-scroll";
import { useLocation, Outlet } from "react-router-dom";
import "locomotive-scroll/dist/locomotive-scroll.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  const scrollRef = useRef(null);
  const location = useLocation();
  const locoScroll = useRef(null);

  useEffect(() => {
    locoScroll.current = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
      lerp: 0.1,
    });

    return () => {
      locoScroll.current?.destroy();
    };
  }, []);

  useEffect(() => {
    // Refresh LocomotiveScroll on route change
    setTimeout(() => {
      locoScroll.current?.update();
    }, 100);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <div data-scroll-container ref={scrollRef} className="overflow-hidden pt-16">
        <Outlet /> {/* ✅ Required for nested route rendering */}
        <Footer />
      </div>
    </>
  );
};

export default Layout;

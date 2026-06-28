"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastProvider() {
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
   const timer = window.setTimeout(() => setMounted(true), 0);
   return () => window.clearTimeout(timer);
 }, []);

 if (!mounted) return null;

 return (
 <ToastContainer
 position="top-right"
 autoClose={4000}
 hideProgressBar={false}
 newestOnTop
 closeOnClick
 rtl={false}
 pauseOnFocusLoss
 draggable
 pauseOnHover
 theme="light"
 />
 );
}

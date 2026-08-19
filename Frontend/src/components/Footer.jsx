import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-outline-variant py-8 px-container-padding-mobile md:px-container-padding-desktop mt-auto w-full z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-primary">local_library</span>
          <span className="font-headline-md text-xl tracking-tight text-primary font-bold">DigitalLib</span>
        </div>
        
        <p className="text-xs text-outline font-body-md">
          &copy; {new Date().getFullYear()} DigitalLib. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

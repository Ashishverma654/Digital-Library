import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-transparent text-on-background font-body-md min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Main Content Area with entrance animations */}
      <main className="pt-24 px-container-padding-mobile md:px-container-padding-desktop pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-gutter">
          {/* Hero Section */}
          <header className="text-center py-12 md:py-20 fade-in-up">
            <h1 className="font-headline-xl text-headline-xl text-gray-900 dark:text-primary-fixed mb-4">Discover Boundless Worlds</h1>
            <p className="font-body-lg text-body-lg text-gray-700 dark:text-on-surface-variant max-w-2xl mx-auto">
              Step into a sanctuary of curated knowledge. Explore our vast archives illuminated by advanced glassmorphism and modern design.
            </p>
          </header>

          {/* Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Main Feature Card */}
            <div className="md:col-span-8 glass-panel rounded-xl p-glass-padding fade-in-up delay-100 hover:bg-black/5 dark:hover:bg-white/10 hover:backdrop-blur-[40px] hover:border-black/10 dark:hover:border-white/25 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 dark:from-primary-container/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col h-full justify-end min-h-[300px]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-secondary/10 dark:bg-secondary-container/20 text-secondary-hover dark:text-secondary border border-secondary/20 dark:border-secondary/30 px-3 py-1 rounded-full font-label-sm text-label-sm backdrop-blur-md">Featured Archive</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-gray-900 dark:text-inverse-surface mb-2">The Philosophy of Glass</h2>
                <p className="font-body-md text-body-md text-gray-700 dark:text-on-surface-variant mb-6 max-w-lg">A deep dive into transparent UI patterns and structural clarity in modern digital architecture.</p>
                <div className="flex items-center gap-4 mt-auto">
                  <Link to="/books" className="bg-gradient-to-r from-primary-container to-secondary-container text-white dark:text-on-primary font-body-md px-6 py-2 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(189,0,255,0.3)] transition-all active:scale-95 text-center">
                    Read Now
                  </Link>
                  <button className="glass-panel text-primary-hover dark:text-primary font-body-md px-6 py-2 rounded-lg font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2">
                    <span className="material-symbols-outlined">bookmark_add</span> Save
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Card */}
            <div className="md:col-span-4 glass-panel rounded-xl p-glass-padding fade-in-up delay-200 flex flex-col justify-between group hover:border-primary/30 dark:hover:border-primary/50 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-surface-container-high flex items-center justify-center mb-6 text-tertiary-hover dark:text-tertiary">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-gray-900 dark:text-primary-fixed mb-2">Reading Analytics</h3>
                <p className="font-body-md text-body-md text-gray-700 dark:text-on-surface-variant">Track your progress through the DigitalLib.</p>
              </div>
              <div className="mt-8 space-y-4">
                <div>
                  <div className="flex justify-between text-label-sm font-label-sm text-gray-600 dark:text-on-surface-variant mb-2">
                    <span>Current Volume</span>
                    <span className="text-tertiary-hover dark:text-tertiary">68%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary shadow-[0_0_10px_theme('colors.tertiary')] w-[68%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

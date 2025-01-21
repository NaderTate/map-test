import { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Main content */}
      <main className="p-4">
        <Outlet />
      </main>

      {/* Floating fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className="fixed bottom-4 right-4 p-3 bg-black hover:bg-gray-900 text-white rounded-full shadow-lg transition-colors"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-6 h-6" />
        ) : (
          <Maximize2 className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default AppLayout;

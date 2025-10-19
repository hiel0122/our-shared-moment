import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSectionDesktop from "./HeroSectionDesktop";
import HeroSectionMobile from "./HeroSectionMobile";

const HeroSection = () => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="relative">
      {/* View Mode Toggle */}
      <div className="view-toggle absolute top-4 left-4 z-50 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-pressed={viewMode === 'desktop'}
          onClick={() => setViewMode('desktop')}
          className="w-10 h-10 rounded-lg backdrop-blur-md transition-all"
          style={{
            background: viewMode === 'desktop' 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(0, 0, 0, 0.38)',
            color: '#fff',
            outline: viewMode === 'desktop' ? '2px solid rgba(255, 255, 255, 0.22)' : 'none',
          }}
        >
          <Monitor className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-pressed={viewMode === 'mobile'}
          onClick={() => setViewMode('mobile')}
          className="w-10 h-10 rounded-lg backdrop-blur-md transition-all"
          style={{
            background: viewMode === 'mobile' 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(0, 0, 0, 0.38)',
            color: '#fff',
            outline: viewMode === 'mobile' ? '2px solid rgba(255, 255, 255, 0.22)' : 'none',
          }}
        >
          <Smartphone className="w-5 h-5" />
        </Button>
      </div>

      {/* Conditional Hero Section Rendering */}
      {viewMode === 'desktop' ? <HeroSectionDesktop /> : <HeroSectionMobile />}
    </div>
  );
};

export default HeroSection;

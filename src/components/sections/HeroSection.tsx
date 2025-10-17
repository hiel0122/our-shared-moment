import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FlipClock } from "@/components/FlipClock";
import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroEditModal from "@/components/HeroEditModal";

const HeroSection = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [displayedLine1, setDisplayedLine1] = useState("");
  const [displayedLine2, setDisplayedLine2] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const { data: invitation, refetch } = useQuery({
    queryKey: ["invitation"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invitation").select("*").single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

      setIsAdmin(profile?.role === "admin");
    };

    checkAdmin();
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Two-line typing animation - starts after video loads
  useEffect(() => {
    if (!videoLoaded) return;

    const line1Text = invitation?.hero_line1 || "우리, 마주서다.";
    const line2Text = invitation?.hero_line2 || "2026.12.5, 우리가 마주보는 시간.";

    // If reduced motion, show all text immediately with cursor
    if (prefersReducedMotion) {
      setDisplayedLine1(line1Text);
      setDisplayedLine2(line2Text);
      setShowCursor(true);
      return;
    }

    // Wait 1 second after video loads before starting typing
    const startDelay = setTimeout(() => {
      let currentIndex = 0;
      let isLine1Complete = false;

      const typingInterval = setInterval(() => {
        if (!isLine1Complete) {
          // Type line 1
          if (currentIndex <= line1Text.length) {
            setDisplayedLine1(line1Text.slice(0, currentIndex));
            currentIndex++;
          } else {
            // Line 1 complete, wait 1 second before starting line 2
            isLine1Complete = true;
            currentIndex = 0;
            setTimeout(() => {
              // Start line 2
              const line2Interval = setInterval(() => {
                if (currentIndex <= line2Text.length) {
                  setDisplayedLine2(line2Text.slice(0, currentIndex));
                  currentIndex++;
                  if (currentIndex > line2Text.length) {
                    setShowCursor(true);
                    clearInterval(line2Interval);
                  }
                }
              }, 150); // 15-20% slower
            }, 1000);
            clearInterval(typingInterval);
          }
        }
      }, 150); // 15-20% slower than original 130ms

      return () => clearInterval(typingInterval);
    }, 1000);

    return () => clearTimeout(startDelay);
  }, [invitation?.hero_line1, invitation?.hero_line2, videoLoaded, prefersReducedMotion]);

  // Cursor blink
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const weddingDate = new Date(invitation?.wedding_at || "2026-12-05T00:00:00+09:00");
  const backgroundVideo = invitation?.hero_video_url || "";

  // Extract YouTube ID and create proper embed URL with all parameters
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?\/\s]+)/)?.[1];
    if (!videoId) return url;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&enablejsapi=1`;
  };

  const handleSave = (videoUrl: string) => {
    refetch();
  };

  useEffect(() => {
    // Simulate video loading
    const timer = setTimeout(() => setVideoLoaded(true), 500);
    return () => clearTimeout(timer);
  }, [backgroundVideo]);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 pt-32 overflow-hidden bg-black"
      onMouseEnter={() => isAdmin && setShowEdit(true)}
      onMouseLeave={() => setShowEdit(false)}
    >
      {backgroundVideo && (
        <>
          <div 
            className={`absolute inset-0 z-0 transition-all duration-900 ease-out ${
              videoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{
              width: '100vw',
              height: '100vh',
              overflow: 'hidden',
            }}
          >
            <div
              className="hero-video-wrap"
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                transform: 'scale(1.10)',
                willChange: 'transform',
              }}
            >
              {backgroundVideo.includes("youtube.com") || backgroundVideo.includes("youtu.be") ? (
                <iframe
                  src={getYoutubeEmbedUrl(backgroundVideo)}
                  allow="autoplay; encrypted-media"
                  style={{ 
                    border: 0,
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    aspectRatio: '16/9',
                    minWidth: '100%',
                    minHeight: '100%',
                  }}
                  onLoad={() => setVideoLoaded(true)}
                />
              ) : (
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-full object-cover" 
                  src={backgroundVideo}
                  onLoadedData={() => setVideoLoaded(true)}
                />
              )}
            </div>
          </div>
          <div 
            className="absolute inset-0 z-0 transition-opacity duration-600"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)',
            }}
          />
        </>
      )}

      {isAdmin && showEdit && (
        <Button onClick={() => setEditModalOpen(true)} className="absolute top-20 right-4 z-10" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          편집
        </Button>
      )}

      <div className="text-center space-y-8 max-w-4xl relative z-10 flex flex-col items-center">
        <div 
          className="relative inline-flex flex-col items-center gap-2 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.66)',
            padding: 'clamp(14px, 2.4vw, 26px) clamp(20px, 3.2vw, 36px)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
            backdropFilter: 'blur(4px)',
            minWidth: 'clamp(320px, 52vw, 780px)',
          }}
        >
          <h1 
            className="font-bold tracking-wide font-serif whitespace-nowrap"
            style={{ 
              color: '#111',
              fontSize: 'clamp(2.4rem, 7.2vw, 6.0rem)',
              lineHeight: '1.15',
              textShadow: '0 2px 8px rgba(0,0,0,0.35)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {displayedLine1}
          </h1>
          <p 
            className="font-serif font-semibold tracking-wide whitespace-nowrap relative"
            style={{ 
              color: '#111',
              fontSize: 'clamp(1.2rem, 3.8vw, 2.4rem)',
              lineHeight: '1.2',
              textShadow: '0 2px 8px rgba(0,0,0,0.35)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {displayedLine2}
          </p>
          {showCursor && (
            <span 
              className="typing-caret"
              style={{
                position: 'absolute',
                right: '-0.35ch',
                bottom: '14px',
                fontSize: 'clamp(1.2rem, 3.8vw, 2.4rem)',
                animation: 'blink 1s step-end infinite',
              }}
            >
              ▍
            </span>
          )}
        </div>
        <div className="pt-8 flex justify-center">
          <FlipClock targetDate={weddingDate} />
        </div>
      </div>

      <HeroEditModal open={editModalOpen} onOpenChange={setEditModalOpen} onSave={handleSave} />
    </section>
  );
};

export default HeroSection;

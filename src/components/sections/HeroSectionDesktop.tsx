import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FlipClock } from "@/components/FlipClock";
import { useState, useEffect, useRef } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroEditModal from "@/components/HeroEditModal";

const HeroSectionDesktop = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [line1Text, setLine1Text] = useState("");
  const [line2Text, setLine2Text] = useState("");
  const [currentLine, setCurrentLine] = useState<1 | 2>(1);
  const [showCursor, setShowCursor] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [cursorStyle, setCursorStyle] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const line1Ref = useRef<HTMLHeadingElement>(null);
  const line2Ref = useRef<HTMLHeadingElement>(null);

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

  // Update cursor position and size based on text metrics
  const updateCursor = (lineEl: HTMLElement | null) => {
    if (!lineEl) return;
    
    const cs = getComputedStyle(lineEl);
    const fs = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight) || fs * 1.2;
    
    const range = document.createRange();
    range.selectNodeContents(lineEl);
    const rects = range.getClientRects();
    const lastRect = rects[rects.length - 1];
    
    if (lastRect) {
      const lineBox = lineEl.getBoundingClientRect();
      const containerBox = lineEl.parentElement?.getBoundingClientRect();
      if (containerBox) {
        const left = lastRect.right - containerBox.left;
        const top = lastRect.top - containerBox.top + (lh - (lh * 0.9)) / 2;
        
        setCursorStyle({
          width: fs * 0.1,
          height: lh * 0.9,
          x: left,
          y: top
        });
      }
    }
  };

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Main typing sequence - starts after video loads
  useEffect(() => {
    if (!videoLoaded) return;

    const mainSequences = [
      "우리, 결혼할 수 있을까?",
      "우리, 결혼하자.",
      invitation?.hero_line1 || "우리, 마주서다."
    ];
    const subtitleText = "2026년 12월 5일, 우리가 마주보는 날.";

    // If reduced motion, show final text immediately with cursor
    if (prefersReducedMotion) {
      setLine1Text(mainSequences[mainSequences.length - 1]);
      setLine2Text(subtitleText);
      setCurrentLine(2);
      setShowCursor(true);
      setTimeout(() => updateCursor(line2Ref.current), 50);
      return;
    }

    const runTypingSequence = async () => {
      // Wait 2 seconds after video loads before starting typing (2x slower)
      await new Promise(r => setTimeout(r, 2000));

      // Type and delete first two sequences (2x slower)
      for (let seqIndex = 0; seqIndex < 2; seqIndex++) {
        const text = mainSequences[seqIndex];
        setCurrentLine(1);
        
        // Type sequence (2x slower: 40ms -> 80ms)
        for (let i = 0; i <= text.length; i++) {
          setLine1Text(text.slice(0, i));
          await new Promise(r => setTimeout(r, 80));
          setTimeout(() => updateCursor(line1Ref.current), 20);
        }
        
        // Hold the complete text (2x longer)
        await new Promise(r => setTimeout(r, 1600));
        
        // Delete sequence (2x slower: 20ms -> 40ms)
        for (let i = text.length; i >= 0; i--) {
          setLine1Text(text.slice(0, i));
          await new Promise(r => setTimeout(r, 40));
          setTimeout(() => updateCursor(line1Ref.current), 20);
        }
        await new Promise(r => setTimeout(r, 400)); // Brief pause before next sequence (2x)
      }

      // Type final main sequence (2x slower: 70ms -> 140ms)
      const finalMainText = mainSequences[2];
      setCurrentLine(1);
      for (let i = 0; i <= finalMainText.length; i++) {
        setLine1Text(finalMainText.slice(0, i));
        await new Promise(r => setTimeout(r, 140));
        setTimeout(() => updateCursor(line1Ref.current), 20);
      }

      // Wait 2 seconds, then animate cursor moving to line 2 (2x longer)
      await new Promise(r => setTimeout(r, 2000));
      setCurrentLine(2);

      // Type subtitle (2x slower: 70ms -> 140ms)
      for (let i = 0; i <= subtitleText.length; i++) {
        setLine2Text(subtitleText.slice(0, i));
        await new Promise(r => setTimeout(r, 140));
        setTimeout(() => updateCursor(line2Ref.current), 20);
      }

      // Keep cursor blinking on line 2
      setShowCursor(true);
    };

    runTypingSequence();
  }, [invitation?.hero_line1, videoLoaded, prefersReducedMotion]);

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
            <div className="hero-video-wrap" style={{ transform: 'scale(1.08)', transformOrigin: 'center center' }}>
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
        <div className="relative inline-flex flex-col items-center justify-center gap-2">
          <h1 
            ref={line1Ref}
            className="hero-title font-bold tracking-wide font-serif whitespace-nowrap"
            style={{ 
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              fontWeight: 800,
              color: '#fff',
              textShadow: '0 3px 12px rgba(0,0,0,0.45)',
              lineHeight: '1.12',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {line1Text}
          </h1>
          <h2
            ref={line2Ref}
            className="hero-subtitle font-semibold tracking-wide font-serif whitespace-nowrap"
            style={{ 
              fontSize: 'clamp(1.25rem, 3.2vw, 2.1rem)',
              fontWeight: 600,
              color: '#fff',
              opacity: 0.95,
              textShadow: '0 2px 10px rgba(0,0,0,0.4)',
              lineHeight: '1.14',
              marginTop: '0.6rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {line2Text}
          </h2>
          {showCursor && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: `${cursorStyle.width}px`,
                height: `${cursorStyle.height}px`,
                transform: `translate(${cursorStyle.x}px, ${cursorStyle.y}px)`,
                background: '#fff',
                borderRadius: '1px',
                animation: 'blink 1s step-end infinite',
                pointerEvents: 'none',
                transition: 'transform 0.3s ease-out',
              }}
            />
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

export default HeroSectionDesktop;

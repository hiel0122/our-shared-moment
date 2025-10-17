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
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

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

  // Typing animation with two phases - starts after video loads
  useEffect(() => {
    if (!videoLoaded) return;

    // Wait 1 second after video loads before starting typing
    const startDelay = setTimeout(() => {
      const firstText = "우리, 결혼합니다.";
      const secondText = invitation?.hero_line1 || "우리, 마주보다.";
      let currentIndex = 0;
      let isTyping = true;
      let isFirstPhase = true;

      const typingInterval = setInterval(() => {
        if (isFirstPhase) {
          if (isTyping && currentIndex <= firstText.length) {
            setDisplayedText(firstText.slice(0, currentIndex));
            currentIndex++;
          } else if (isTyping && currentIndex > firstText.length) {
            setTimeout(() => {
              isTyping = false;
              currentIndex = firstText.length;
            }, 1000);
          } else if (!isTyping && currentIndex > 0) {
            currentIndex--;
            setDisplayedText(firstText.slice(0, currentIndex));
          } else if (!isTyping && currentIndex === 0) {
            isFirstPhase = false;
            isTyping = true;
            currentIndex = 0;
          }
        } else {
          if (currentIndex <= secondText.length) {
            setDisplayedText(secondText.slice(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }
      }, 150); // 15-20% slower than original 130ms

      return () => clearInterval(typingInterval);
    }, 1000);

    return () => clearTimeout(startDelay);
  }, [invitation?.hero_line1, videoLoaded]);

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
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&controls=0&modestbranding=1&rel=0&showinfo=0`;
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
            }}
          >
            {backgroundVideo.includes("youtube.com") || backgroundVideo.includes("youtu.be") ? (
              <iframe
                src={getYoutubeEmbedUrl(backgroundVideo)}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                style={{ 
                  border: 0,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100vw',
                  height: '100vh',
                  transform: 'translate(-50%, -50%)',
                  objectFit: 'cover',
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

      <div className="text-center space-y-8 max-w-4xl relative z-10">
        <h1 
          className="text-3xl md:text-7xl font-bold tracking-wide font-serif text-white"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {displayedText}
          <span className={`ml-1 ${showCursor ? "opacity-100" : "opacity-0"}`}>|</span>
        </h1>
        <p 
          className="text-xl md:text-3xl font-serif font-semibold tracking-wide text-white"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {invitation?.hero_line2 || "2026년 12월 5일, 우리가 마주보는 시간"}
        </p>
        <div className="pt-8 flex justify-center">
          <FlipClock targetDate={weddingDate} />
        </div>
      </div>

      <HeroEditModal open={editModalOpen} onOpenChange={setEditModalOpen} onSave={handleSave} />
    </section>
  );
};

export default HeroSection;

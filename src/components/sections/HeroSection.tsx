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

  const { data: invitation, refetch } = useQuery({
    queryKey: ["invitation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitation")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    };

    checkAdmin();
  }, []);

  // Typing animation
  useEffect(() => {
    const fullText = invitation?.hero_line1 || "우리, 마주서다.";
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [invitation?.hero_line1]);

  // Cursor blink
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const weddingDate = new Date(invitation?.wedding_at || "2026-12-05T00:00:00+09:00");
  const backgroundVideo = invitation?.hero_video_url || "";

  const handleSave = (videoUrl: string) => {
    refetch();
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 pt-32"
      onMouseEnter={() => isAdmin && setShowEdit(true)}
      onMouseLeave={() => setShowEdit(false)}
    >
      {backgroundVideo && (
        <>
          <div className="absolute inset-0 z-0">
            {backgroundVideo.includes("youtube.com") ? (
              <iframe
                src={backgroundVideo}
                className="w-full h-full object-cover"
                allow="autoplay; encrypted-media"
                style={{ border: 0 }}
              />
            ) : (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                src={backgroundVideo}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 z-0" />
        </>
      )}

      {isAdmin && showEdit && (
        <Button
          onClick={() => setEditModalOpen(true)}
          className="absolute top-20 right-4 z-10"
          size="sm"
        >
          <Edit className="w-4 h-4 mr-2" />
          편집
        </Button>
      )}

      <div className="text-center space-y-8 max-w-4xl relative z-10">
        <h1 className="text-3xl md:text-7xl font-bold tracking-wide font-serif">
          {displayedText}
          {displayedText.length === (invitation?.hero_line1 || "우리, 마주서다.").length && (
            <span className={`ml-1 ${showCursor ? "opacity-100" : "opacity-0"}`}>|</span>
          )}
        </h1>
        <p className="text-xl md:text-3xl font-serif font-semibold tracking-wide">
          {invitation?.hero_line2 || "2026년 12월 5일, 우리가 마주보는 시간"}
        </p>
        <div className="pt-8 flex justify-center">
          <FlipClock targetDate={weddingDate} />
        </div>
      </div>

      <HeroEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSave}
      />
    </section>
  );
};

export default HeroSection;

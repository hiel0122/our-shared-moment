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
  const [backgroundVideo, setBackgroundVideo] = useState("");

  const { data: invitation } = useQuery({
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

  const weddingDate = new Date(invitation?.wedding_at || "2026-12-05T00:00:00+09:00");

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20"
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
          className="absolute top-4 right-4 z-10"
          size="sm"
        >
          <Edit className="w-4 h-4 mr-2" />
          편집
        </Button>
      )}

      <div className="text-center space-y-8 max-w-2xl relative z-10">
        <h1 className="text-4xl md:text-6xl font-light tracking-wide font-serif">
          {invitation?.hero_line1 || "우리, 마주서다."}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          {invitation?.hero_line2 || "2026년 12월 5일, 우리가 마주보는 시간"}
        </p>
        <div className="pt-8 flex justify-center">
          <FlipClock targetDate={weddingDate} />
        </div>
      </div>

      <HeroEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={setBackgroundVideo}
      />
    </section>
  );
};

export default HeroSection;

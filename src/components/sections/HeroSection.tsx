import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FlipClock } from "@/components/FlipClock";

const HeroSection = () => {
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

  const weddingDate = new Date(invitation?.wedding_at || "2026-12-05T00:00:00+09:00");

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center space-y-8 max-w-2xl">
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
    </section>
  );
};

export default HeroSection;

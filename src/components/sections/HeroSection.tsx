import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const [timeLeft, setTimeLeft] = useState("");

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
    const weddingDate = new Date(invitation?.wedding_at || "2026-12-05T14:00:00+09:00");
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        const year = weddingDate.getFullYear();
        const month = String(weddingDate.getMonth() + 1).padStart(2, "0");
        const day = String(weddingDate.getDate()).padStart(2, "0");
        
        setTimeLeft(
          `${year}-${month}-${day} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );
      } else {
        setTimeLeft("오늘입니다!");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [invitation]);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-light tracking-wide">
          {invitation?.hero_line1 || "우리, 마주서다."}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          {invitation?.hero_line2 || "2026년 12월 5일, 우리가 마주보는 시간"}
        </p>
        <div className="text-2xl md:text-3xl font-mono tracking-wider pt-8">
          {timeLeft}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

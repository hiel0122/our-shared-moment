import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

const LocationSection = () => {
  const { data: venue } = useQuery({
    queryKey: ["venue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venue")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-20 px-4 bg-muted">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-12 font-serif">
          우리, 마주서는 곳
        </h2>
        <div className="bg-background rounded-lg p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6 mt-1 flex-shrink-0 text-primary" />
            <div>
              <h3 className="text-xl font-medium mb-2">
                {venue?.name || "스카이뷰 관광호텔&웨딩"}
              </h3>
              <p className="text-muted-foreground">
                {venue?.address || "경남 창원시 마산합포구 해안대로 317 스카이뷰관광호텔"}
              </p>
            </div>
          </div>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border">
            <iframe
              src="https://naver.me/FYqM2ci0"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="웨딩홀 위치"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;

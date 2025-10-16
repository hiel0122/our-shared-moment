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
    <section className="py-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 font-serif">
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3260.223520187968!2d128.57263261200765!3d35.20090097263242!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x356f2de6dcbeb74f%3A0x38c8a521bb676bab!2z7Iqk7Lm07J2067ew7Zi47YWUIOybqOuUqe2ZgA!5e0!3m2!1sko!2skr!4v1760432121042!5m2!1sko!2skr"
              style={{ border: 0, width: '100%', height: '100%' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="웨딩홀 위치"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;

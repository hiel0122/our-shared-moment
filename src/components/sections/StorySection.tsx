import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StorySection = () => {
  const { data: stories } = useQuery({
    queryKey: ["media_assets", "text"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("type", "text")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-12 font-serif">
          우리, 마주보기 전엔...
        </h2>
        <div className="space-y-6">
          {stories && stories.length > 0 ? (
            stories.map((story) => (
              <div
                key={story.id}
                className="bg-card rounded-lg p-6 md:p-8 shadow-sm border border-border"
              >
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {story.content || "우리의 이야기를 적어주세요..."}
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border border-border">
                <p className="text-muted-foreground leading-relaxed">
                  우리의 이야기를 적어주세요...
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border border-border">
                <p className="text-muted-foreground leading-relaxed">
                  함께해 주셔서 고맙습니다...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default StorySection;

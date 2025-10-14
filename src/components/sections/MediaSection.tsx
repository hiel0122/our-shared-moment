import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MediaSection = () => {
  const { data: mediaAssets } = useQuery({
    queryKey: ["media-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-12">
          우리, 마주보기 전엔...
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mediaAssets && mediaAssets.length > 0 ? (
            mediaAssets.map((asset) => (
              <div key={asset.id} className="aspect-square bg-muted rounded flex items-center justify-center">
                {asset.type === "text" ? (
                  <p className="p-6 text-center">{asset.content}</p>
                ) : asset.type === "image" && asset.url ? (
                  <img
                    src={asset.url}
                    alt="Wedding memory"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-muted-foreground">미디어 자리</div>
                )}
              </div>
            ))
          ) : (
            <>
              <div className="aspect-square bg-muted rounded flex items-center justify-center">
                <div className="text-muted-foreground">사진 자리</div>
              </div>
              <div className="aspect-square bg-muted rounded flex items-center justify-center">
                <div className="text-muted-foreground">사진 자리</div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MediaSection;

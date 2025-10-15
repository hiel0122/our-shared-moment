import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeroEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (videoUrl: string) => void;
}

const HeroEditModal = ({ open, onOpenChange, onSave }: HeroEditModalProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [heroLine2, setHeroLine2] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadCurrentData();
    }
  }, [open]);

  const loadCurrentData = async () => {
    const { data } = await supabase
      .from("invitation")
      .select("hero_video_url, hero_line2")
      .single();
    
    if (data) {
      setYoutubeUrl(data.hero_video_url || "");
      setHeroLine2(data.hero_line2 || "");
    }
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let embedUrl = "";
      
      if (youtubeUrl) {
        const videoId = extractYoutubeId(youtubeUrl);
        if (!videoId) {
          toast.error("올바른 YouTube URL을 입력해주세요.");
          setLoading(false);
          return;
        }
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}`;
      }

      const { error } = await supabase
        .from("invitation")
        .update({
          hero_video_url: embedUrl,
          hero_line2: heroLine2,
        })
        .eq("id", (await supabase.from("invitation").select("id").single()).data?.id);

      if (error) throw error;

      onSave(embedUrl);
      onOpenChange(false);
      toast.success("변경사항이 저장되었습니다.");
    } catch (error) {
      toast.error("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hero 섹션 편집</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              YouTube URL
            </label>
            <Input
              placeholder="YouTube URL을 입력하세요"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              하단 텍스트
            </label>
            <Input
              placeholder="예: 2026년 12월 5일, 우리가 마주보는 시간"
              value={heroLine2}
              onChange={(e) => setHeroLine2(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HeroEditModal;

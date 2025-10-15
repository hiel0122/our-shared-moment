import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeroEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (videoUrl: string) => void;
}

const HeroEditModal = ({ open, onOpenChange, onSave }: HeroEditModalProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const handleYoutubeSave = () => {
    const videoId = extractYoutubeId(youtubeUrl);
    if (!videoId) {
      toast.error("올바른 YouTube URL을 입력해주세요.");
      return;
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}`;
    onSave(embedUrl);
    onOpenChange(false);
    toast.success("배경 영상이 설정되었습니다.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("동영상 파일만 업로드 가능합니다.");
      return;
    }

    setUploading(true);
    try {
      // Note: Storage bucket creation would be needed
      toast.error("스토리지 버킷이 필요합니다. YouTube 링크를 사용해주세요.");
    } catch (error) {
      toast.error("업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hero 배경 영상 편집</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="youtube" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="youtube">YouTube 링크</TabsTrigger>
            <TabsTrigger value="upload">파일 업로드</TabsTrigger>
          </TabsList>
          <TabsContent value="youtube" className="space-y-4">
            <Input
              placeholder="YouTube URL을 입력하세요"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <Button onClick={handleYoutubeSave} className="w-full">
              저장
            </Button>
          </TabsContent>
          <TabsContent value="upload" className="space-y-4">
            <Input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <p className="text-sm text-muted-foreground">
              {uploading ? "업로드 중..." : "동영상 파일을 선택하세요"}
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default HeroEditModal;

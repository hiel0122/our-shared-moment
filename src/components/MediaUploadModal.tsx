import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface MediaUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MediaUploadModal = ({ open, onOpenChange, onSuccess }: MediaUploadModalProps) => {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !authorName || !content) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // Upload image to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage.from("media").upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(fileName);

      // Insert media asset
      const { error: insertError } = await supabase.from("media_assets").insert([
        {
          url: publicUrl,
          author_name: authorName,
          content: content,
          type: "image",
          author_role: "bride",
          sort_order: 0,
        },
      ]);

      if (insertError) throw insertError;

      toast.success("게시물이 등록되었습니다.");
      onSuccess();
      onOpenChange(false);
      setAuthorName("");
      setContent("");
      setFile(null);
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>게시물 추가</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="file">이미지</Label>
            <Input id="file" type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div>
            <Label htmlFor="author">작성자</Label>
            <Input id="author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="작성자명을 입력하세요" />
          </div>

          <div>
            <Label htmlFor="content">내용</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" className="min-h-[100px]" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "업로드 중..." : "등록"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUploadModal;

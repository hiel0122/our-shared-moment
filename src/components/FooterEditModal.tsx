import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FooterEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const FooterEditModal = ({ open, onOpenChange, onSave }: FooterEditModalProps) => {
  const [footerText, setFooterText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchFooterText = async () => {
        const { data, error } = await supabase
          .from("invitation")
          .select("hero_line3")
          .single();
        if (error) {
          console.error("Error fetching footer text:", error);
          return;
        }
        setFooterText(data?.hero_line3 || "");
      };
      fetchFooterText();
    }
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("invitation")
        .update({ hero_line3: footerText })
        .eq("id", (await supabase.from("invitation").select("id").single()).data?.id);

      if (error) throw error;

      toast.success("푸터 문구가 저장되었습니다.");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating footer text:", error);
      toast.error("푸터 문구 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">푸터 문구 편집</h2>
          <div className="space-y-2">
            <Label htmlFor="footerText">푸터 상단 문구</Label>
            <Input
              id="footerText"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="예: 6년의 만남, 그리고 새로운 시작"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              푸터 상단 중앙에 표시될 문구를 입력하세요.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FooterEditModal;

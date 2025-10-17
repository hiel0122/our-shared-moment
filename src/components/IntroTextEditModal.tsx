import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Link as LinkIcon } from "lucide-react";

interface IntroTextEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const IntroTextEditModal = ({ open, onOpenChange, onSave }: IntroTextEditModalProps) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadCurrentData();
    }
  }, [open]);

  const loadCurrentData = async () => {
    const { data } = await supabase.from("invitation").select("intro_text").single();
    if (data) {
      setText(data.intro_text || "");
    }
  };

  const applyFormat = (format: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    let formattedText = "";
    switch (format) {
      case "bold":
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case "italic":
        formattedText = `<em>${selectedText}</em>`;
        break;
      case "underline":
        formattedText = `<u>${selectedText}</u>`;
        break;
      case "left":
        formattedText = `<div style="text-align: left">${selectedText}</div>`;
        break;
      case "center":
        formattedText = `<div style="text-align: center">${selectedText}</div>`;
        break;
      case "right":
        formattedText = `<div style="text-align: right">${selectedText}</div>`;
        break;
      case "list":
        formattedText = `<ul><li>${selectedText}</li></ul>`;
        break;
      case "link":
        const url = prompt("URL을 입력하세요:");
        if (url) formattedText = `<a href="${url}" target="_blank" rel="noopener">${selectedText}</a>`;
        break;
      default:
        formattedText = selectedText;
    }

    const newText = text.substring(0, start) + formattedText + text.substring(end);
    setText(newText);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("invitation").update({ intro_text: text }).eq("id", (await supabase.from("invitation").select("id").single()).data?.id);

      if (error) throw error;

      toast.success("텍스트가 저장되었습니다.");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving text:", error);
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>인트로 텍스트 편집</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("bold")}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("italic")}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("underline")}>
              <Underline className="w-4 h-4" />
            </Button>
            <div className="w-px bg-border" />
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("left")}>
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("center")}>
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("right")}>
              <AlignRight className="w-4 h-4" />
            </Button>
            <div className="w-px bg-border" />
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("list")}>
              <List className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("link")}>
              <LinkIcon className="w-4 h-4" />
            </Button>
          </div>

          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="텍스트를 입력하세요..." className="min-h-[200px]" />

          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">미리보기:</p>
            <div dangerouslySetInnerHTML={{ __html: text }} className="font-serif" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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

export default IntroTextEditModal;

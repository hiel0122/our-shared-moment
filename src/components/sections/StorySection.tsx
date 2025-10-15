import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import bcrypt from "bcryptjs";

const StorySection = () => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState({ writer: "", password: "", content: "" });
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  const { data: mediaAssets } = useQuery({
    queryKey: ["media_assets", "image"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("type", "image")
        .order("sort_order")
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  // Placeholder images if no media assets
  const placeholders = Array(8).fill(null).map((_, i) => ({
    id: `placeholder-${i}`,
    url: `/placeholder.svg`,
    type: "image" as const,
  }));

  const displayItems = mediaAssets && mediaAssets.length > 0 ? mediaAssets : placeholders;

  const handleLike = (mediaId: string) => {
    const storageKey = `like_${mediaId}`;
    const hasLiked = localStorage.getItem(storageKey);
    
    if (hasLiked) {
      localStorage.removeItem(storageKey);
      setLikes(prev => ({ ...prev, [mediaId]: false }));
    } else {
      localStorage.setItem(storageKey, "true");
      setLikes(prev => ({ ...prev, [mediaId]: true }));
    }
  };

  const handleComment = (mediaId: string) => {
    setSelectedMedia(mediaId);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("링크가 복사되었습니다.");
  };

  const submitComment = async () => {
    if (!selectedMedia || !commentForm.writer || !commentForm.password || !commentForm.content) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    try {
      const passwordHash = await bcrypt.hash(commentForm.password, 10);
      
      const { error } = await supabase
        .from("comments")
        .insert({
          media_id: selectedMedia,
          writer: commentForm.writer,
          password_hash: passwordHash,
          content: commentForm.content,
        });

      if (error) throw error;

      toast.success("댓글이 등록되었습니다.");
      setSelectedMedia(null);
      setCommentForm({ writer: "", password: "", content: "" });
    } catch (error) {
      toast.error("댓글 등록에 실패했습니다.");
    }
  };

  return (
    <>
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-12 font-serif">
            우리, 마주보기 전엔...
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayItems.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-lg overflow-hidden border border-border bg-muted group relative"
              >
                <img
                  src={item.url || "/placeholder.svg"}
                  alt="우리의 이야기"
                  className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex gap-3">
                  <button
                    onClick={() => handleLike(item.id)}
                    className="text-white hover:scale-110 transition-transform"
                    aria-label="좋아요"
                  >
                    <Heart
                      size={20}
                      className={likes[item.id] || localStorage.getItem(`like_${item.id}`) ? "fill-red-500 text-red-500" : ""}
                    />
                  </button>
                  <button
                    onClick={() => handleComment(item.id)}
                    className="text-white hover:scale-110 transition-transform"
                    aria-label="댓글 달기"
                  >
                    <MessageCircle size={20} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="text-white hover:scale-110 transition-transform"
                    aria-label="링크 복사"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 작성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="이름"
              value={commentForm.writer}
              onChange={(e) => setCommentForm({ ...commentForm, writer: e.target.value })}
            />
            <Input
              type="password"
              placeholder="비밀번호(수정용)"
              value={commentForm.password}
              onChange={(e) => setCommentForm({ ...commentForm, password: e.target.value })}
            />
            <Textarea
              placeholder="메시지 내용을 입력하세요"
              value={commentForm.content}
              onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
              rows={4}
            />
            <Button onClick={submitComment} className="w-full">
              댓글 보내기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StorySection;

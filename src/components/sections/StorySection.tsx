import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Send, Edit, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StorySection = () => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState({ writer: "", password: "", content: "" });
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingMedia, setEditingMedia] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: mediaAssets, refetch } = useQuery({
    queryKey: ["media_assets", "image"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("type", "image")
        .order("sort_order")
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    };

    checkAdmin();
  }, []);

  // Placeholder images if no media assets
  const placeholders = Array(6).fill(null).map((_, i) => ({
    id: `placeholder-${i}`,
    url: `/placeholder.svg`,
    type: "image" as const,
    author_name: "신랑♥신부",
    content: "",
    title: "",
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

  const handleImageUpload = async (mediaId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${mediaId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("media_assets")
        .update({ url: publicUrl })
        .eq("id", mediaId);

      if (updateError) throw updateError;

      toast.success("이미지가 업로드되었습니다.");
      refetch();
    } catch (error) {
      toast.error("이미지 업로드에 실패했습니다.");
    } finally {
      setUploadingImage(false);
      setEditingMedia(null);
    }
  };

  return (
    <>
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-serif">
            우리, 마주보기 전엔...
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-lg overflow-hidden shadow-sm transition-all duration-200 hover:brightness-105"
                onMouseEnter={() => isAdmin && setEditingMedia(item.id)}
                onMouseLeave={() => setEditingMedia(null)}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>💑</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">{item.author_name || "신랑♥신부"}</span>
                  </div>
                  <MoreVertical size={18} className="text-muted-foreground" />
                </div>

                {/* Image */}
                <div className="relative aspect-square">
                  <img
                    src={item.url || "/placeholder.svg"}
                    alt="우리의 이야기"
                    className="w-full h-full object-cover"
                  />
                  {isAdmin && editingMedia === item.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <label className="cursor-pointer">
                        <Button size="sm" asChild>
                          <span>
                            <Edit className="w-4 h-4 mr-2" />
                            이미지 변경
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(item.id, file);
                          }}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-3 space-y-2">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleLike(item.id)}
                      className="hover:scale-110 transition-transform"
                      aria-label="좋아요"
                    >
                      <Heart
                        size={24}
                        className={likes[item.id] || localStorage.getItem(`like_${item.id}`) ? "fill-red-500 text-red-500" : ""}
                      />
                    </button>
                    <button
                      onClick={() => handleComment(item.id)}
                      className="hover:scale-110 transition-transform"
                      aria-label="댓글 달기"
                    >
                      <MessageCircle size={24} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="hover:scale-110 transition-transform"
                      aria-label="링크 복사"
                    >
                      <Send size={24} />
                    </button>
                  </div>

                  {/* Content */}
                  {item.content && (
                    <div className="text-sm">
                      <span className="font-semibold">{item.author_name || "신랑♥신부"}</span>{" "}
                      <span>{item.content}</span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }).replace(/\./g, ".").replace(/ /g, "")}
                  </div>
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
              placeholder="댓글 내용을 입력하세요"
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

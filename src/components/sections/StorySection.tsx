import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Send, Edit, MoreVertical, Plus, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: string;
  media_id: string;
  writer: string;
  content: string;
  created_at: string;
  password_hash: string;
}

const StorySection = () => {
  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [commentForm, setCommentForm] = useState({ writer: "", password: "", content: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingMedia, setEditingMedia] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAddPost, setShowAddPost] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPost, setEditingPost] = useState<{ id: string; title: string; content: string } | null>(null);
  const itemsPerPage = 6;

  const { data: mediaAssets } = useQuery({
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

  const { data: comments } = useQuery({
    queryKey: ["comments", selectedMedia?.id],
    queryFn: async () => {
      if (!selectedMedia?.id) return [];
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("media_id", selectedMedia.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!selectedMedia?.id,
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
  const totalPages = Math.ceil(displayItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = displayItems.slice(startIndex, startIndex + itemsPerPage);

  const toggleLike = useMutation({
    mutationFn: async (mediaId: string) => {
      const item = mediaAssets?.find(m => m.id === mediaId);
      if (!item) return;

      const storageKey = `like_${mediaId}`;
      const hasLiked = localStorage.getItem(storageKey);
      const newCount = hasLiked ? (item.likes_count || 0) - 1 : (item.likes_count || 0) + 1;

      const { error } = await supabase
        .from("media_assets")
        .update({ likes_count: Math.max(0, newCount) })
        .eq("id", mediaId);

      if (error) throw error;

      if (hasLiked) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, "true");
      }

      return { mediaId, hasLiked: !hasLiked };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media_assets", "image"] });
    },
    onError: () => {
      toast.error("좋아요 처리에 실패했습니다.");
    },
  });

  const handleComment = (item: any) => {
    setSelectedMedia(item);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("링크가 복사되었습니다.");
  };

  const submitComment = async () => {
    if (!selectedMedia?.id || !commentForm.writer || !commentForm.password || !commentForm.content) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    try {
      const passwordHash = await bcrypt.hash(commentForm.password, 10);
      
      const { error } = await supabase
        .from("comments")
        .insert({
          media_id: selectedMedia.id,
          writer: commentForm.writer,
          password_hash: passwordHash,
          content: commentForm.content,
        });

      if (error) throw error;

      toast.success("댓글이 등록되었습니다.");
      setCommentForm({ writer: "", password: "", content: "" });
      queryClient.invalidateQueries({ queryKey: ["comments", selectedMedia.id] });
    } catch (error) {
      toast.error("댓글 등록에 실패했습니다.");
    }
  };

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("댓글이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["comments", selectedMedia?.id] });
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다.");
    },
  });

  const addNewPost = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `posts/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("media_assets")
        .insert({
          url: publicUrl,
          type: "image",
          author_name: "신랑♥신부",
          sort_order: 0,
          likes_count: 0,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success("게시물이 추가되었습니다.");
      setShowAddPost(false);
      queryClient.invalidateQueries({ queryKey: ["media_assets", "image"] });
    },
    onError: () => {
      toast.error("게시물 추가에 실패했습니다.");
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const { error } = await supabase
        .from("media_assets")
        .update({ title, content })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("게시물이 수정되었습니다.");
      setEditingPost(null);
      queryClient.invalidateQueries({ queryKey: ["media_assets", "image"] });
    },
    onError: () => {
      toast.error("게시물 수정에 실패했습니다.");
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("media_assets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("게시물이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["media_assets", "image"] });
    },
    onError: () => {
      toast.error("게시물 삭제에 실패했습니다.");
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["media_assets", "image"] });
    } catch (error) {
      toast.error("이미지 업로드에 실패했습니다.");
    } finally {
      setUploadingImage(false);
      setEditingMedia(null);
    }
  };

  return (
    <>
      <section className="py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-center mb-6">
              우리, 마주보기 전엔...
            </h2>
            {isAdmin && (
              <Button 
                onClick={() => setShowAddPost(true)}
                size="sm"
                className="gap-2"
              >
                <Plus size={16} />
                게시물 추가
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedItems.map((item) => (
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
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{item.author_name || "신랑♥신부"}</span>
                      {item.title && <span className="text-xs text-muted-foreground">{item.title}</span>}
                    </div>
                  </div>
                  {isAdmin && !item.id.startsWith("placeholder") && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPost({ id: item.id, title: item.title || "", content: item.content || "" });
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("정말 삭제하시겠습니까?")) {
                            deletePost.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Image */}
                <div 
                  className="relative aspect-square cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
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
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => !item.id.startsWith("placeholder") && toggleLike.mutate(item.id)}
                      className="hover:scale-110 transition-transform"
                      aria-label="좋아요"
                      disabled={item.id.startsWith("placeholder")}
                    >
                      <Heart
                        size={24}
                        className={localStorage.getItem(`like_${item.id}`) ? "fill-red-500 text-red-500" : ""}
                      />
                    </button>
                    {!item.id.startsWith("placeholder") && (
                      <span className="text-sm font-semibold">{item.likes_count || 0}개</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComment(item);
                      }}
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Instagram-style Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-5xl w-full h-[80vh] p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Left: Image */}
            <div className="bg-black flex items-center justify-center">
              <img
                src={selectedMedia?.url || "/placeholder.svg"}
                alt="게시물"
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Right: Comments */}
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>💑</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold">{selectedMedia?.author_name || "신랑♥신부"}</span>
                    {selectedMedia?.title && <span className="text-xs text-muted-foreground">{selectedMedia.title}</span>}
                  </div>
                </div>
              </div>

              {/* Content */}
              {selectedMedia?.content && (
                <div className="p-4 border-b">
                  <p className="text-sm">
                    <span className="font-semibold mr-2">{selectedMedia?.author_name || "신랑♥신부"}</span>
                    {selectedMedia.content}
                  </p>
                </div>
              )}

              {/* Comments List */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 group">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {comment.writer[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-sm mr-2">{comment.writer}</span>
                              <span className="text-sm break-words">{comment.content}</span>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                onClick={() => deleteComment.mutate(comment.id)}
                              >
                                <Trash2 size={14} className="text-destructive" />
                              </Button>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      첫 댓글을 남겨보세요!
                    </p>
                  )}
                </div>
              </ScrollArea>

              {/* Like Count */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Heart
                    size={24}
                    className={localStorage.getItem(`like_${selectedMedia?.id}`) ? "fill-red-500 text-red-500" : ""}
                  />
                  <span className="font-semibold text-sm">좋아요 {selectedMedia?.likes_count || 0}개</span>
                </div>
              </div>

              {/* Comment Form */}
              <div className="border-t p-4 space-y-2">
                <Input
                  placeholder="이름"
                  value={commentForm.writer}
                  onChange={(e) => setCommentForm({ ...commentForm, writer: e.target.value })}
                />
                <Input
                  type="password"
                  placeholder="비밀번호"
                  value={commentForm.password}
                  onChange={(e) => setCommentForm({ ...commentForm, password: e.target.value })}
                />
                <div className="flex gap-2">
                  <Textarea
                    placeholder="댓글을 입력하세요..."
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                    rows={2}
                    className="resize-none"
                  />
                  <Button onClick={submitComment} size="sm" className="self-end">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Post Dialog */}
      <Dialog open={showAddPost} onOpenChange={setShowAddPost}>
        <DialogContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">새 게시물 추가</h3>
            <label className="cursor-pointer">
              <Button asChild className="w-full">
                <span>
                  <Plus className="w-4 h-4 mr-2" />
                  사진 선택
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addNewPost.mutate(file);
                }}
                disabled={addNewPost.isPending}
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">게시물 수정</h3>
            <Input
              placeholder="타이틀"
              value={editingPost?.title || ""}
              onChange={(e) => setEditingPost(editingPost ? { ...editingPost, title: e.target.value } : null)}
            />
            <Textarea
              placeholder="내용"
              value={editingPost?.content || ""}
              onChange={(e) => setEditingPost(editingPost ? { ...editingPost, content: e.target.value } : null)}
              rows={4}
            />
            <Button
              onClick={() => {
                if (editingPost) {
                  updatePost.mutate(editingPost);
                }
              }}
              disabled={updatePost.isPending}
              className="w-full"
            >
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StorySection;

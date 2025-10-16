import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Heart, MessageCircle, Edit2, Send, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const StorySection = () => {
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [commenterId, setCommenterId] = useState<string>("");
  const [actorId, setActorId] = useState<string>("");
  const itemsPerPage = 6;

  useEffect(() => {
    // Generate or retrieve IDs for anonymous users
    let commentId = localStorage.getItem('commenterId');
    if (!commentId) {
      commentId = crypto.randomUUID();
      localStorage.setItem('commenterId', commentId);
    }
    setCommenterId(commentId);

    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('visitorId', visitorId);
    }
    setActorId(visitorId);

    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setAdminEmail("");
        return;
      }

      const isAdminUser = user.email === 'admin@admin.com';
      setIsAdmin(isAdminUser);
      setAdminEmail(user.email || "");
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setAdminEmail("");
      } else {
        checkAdmin();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: mediaAssets } = useQuery({
    queryKey: ["mediaAssets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("type", "image")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: commentsData } = useQuery({
    queryKey: ["allComments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      const groupedComments: Record<string, any[]> = {};
      data?.forEach((comment) => {
        if (!groupedComments[comment.media_id || '']) {
          groupedComments[comment.media_id || ''] = [];
        }
        groupedComments[comment.media_id || ''].push(comment);
      });
      
      return groupedComments;
    },
  });

  const { data: likesData } = useQuery({
    queryKey: ["allLikes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_likes")
        .select("*");
      if (error) throw error;
      
      const groupedLikes: Record<string, any[]> = {};
      data?.forEach((like) => {
        if (!groupedLikes[like.media_id || '']) {
          groupedLikes[like.media_id || ''] = [];
        }
        groupedLikes[like.media_id || ''].push(like);
      });
      
      return groupedLikes;
    },
  });

  // Realtime subscription for likes
  useEffect(() => {
    const channel = supabase
      .channel('media-likes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_likes'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["allLikes"] });
          queryClient.invalidateQueries({ queryKey: ["mediaAssets"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: comments } = useQuery({
    queryKey: ["comments", selectedMedia?.id],
    queryFn: async () => {
      if (!selectedMedia?.id) return [];
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("media_id", selectedMedia.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMedia?.id,
  });

  const addNewPost = useMutation({
    mutationFn: async (newPost: { title: string; content: string; imageUrl: string }) => {
      // Determine author_role based on admin email
      const authorRole = adminEmail === 'sinrang@sinrang.com' ? 'groom' : 'bride';
      const authorName = authorRole === 'groom' ? '김철수' : '이영희';

      const { error } = await supabase.from("media_assets").insert({
        title: newPost.title,
        content: newPost.content,
        url: newPost.imageUrl,
        type: "image",
        sort_order: 0,
        author_role: authorRole,
        author_name: authorName,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaAssets"] });
      toast.success("게시물이 추가되었습니다.");
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
      queryClient.invalidateQueries({ queryKey: ["mediaAssets"] });
      setEditDialogOpen(false);
      setEditingPost(null);
      toast.success("게시물이 수정되었습니다.");
    },
    onError: () => {
      toast.error("게시물 수정에 실패했습니다.");
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("media_assets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaAssets"] });
      toast.success("게시물이 삭제되었습니다.");
    },
    onError: () => {
      toast.error("게시물 삭제에 실패했습니다.");
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (mediaId: string) => {
      if (!actorId) {
        throw new Error("Actor ID not initialized");
      }

      // Check if already liked
      const existingLikes = likesData?.[mediaId] || [];
      const hasLiked = existingLikes.some(like => like.actor_id === actorId);

      if (hasLiked) {
        // Unlike: delete the like record
        const { error } = await supabase
          .from("media_likes")
          .delete()
          .eq("media_id", mediaId)
          .eq("actor_id", actorId);
        
        if (error) throw error;
      } else {
        // Like: insert a new like record
        const { error } = await supabase
          .from("media_likes")
          .insert({
            media_id: mediaId,
            actor_id: actorId
          });
        
        if (error) throw error;
      }
    },
    onMutate: async (mediaId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["allLikes"] });
      
      // Snapshot previous value
      const previousLikes = queryClient.getQueryData(["allLikes"]);
      
      // Optimistically update
      queryClient.setQueryData(["allLikes"], (old: any) => {
        const newLikes = { ...old };
        const existingLikes = newLikes[mediaId] || [];
        const hasLiked = existingLikes.some((like: any) => like.actor_id === actorId);
        
        if (hasLiked) {
          newLikes[mediaId] = existingLikes.filter((like: any) => like.actor_id !== actorId);
        } else {
          newLikes[mediaId] = [...existingLikes, { media_id: mediaId, actor_id: actorId }];
        }
        
        return newLikes;
      });
      
      return { previousLikes };
    },
    onError: (err, mediaId, context) => {
      // Rollback on error
      queryClient.setQueryData(["allLikes"], context?.previousLikes);
      toast.error("좋아요 처리에 실패했습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allLikes"] });
    },
  });

  const addComment = useMutation({
    mutationFn: async (newComment: { writer: string; content: string }) => {
      const { error } = await supabase.from("comments").insert({
        writer: newComment.writer,
        content: newComment.content,
        commenter_id: commenterId,
        media_id: selectedMedia.id,
        password_hash: null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", selectedMedia?.id] });
      queryClient.invalidateQueries({ queryKey: ["allComments"] });
      toast.success("댓글이 추가되었습니다.");
    },
    onError: () => {
      toast.error("댓글 추가에 실패했습니다.");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", selectedMedia?.id] });
      queryClient.invalidateQueries({ queryKey: ["allComments"] });
      toast.success("댓글이 삭제되었습니다.");
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다.");
    },
  });

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const writer = formData.get("writer") as string;
    const content = formData.get("content") as string;

    if (!writer || !content) {
      toast.error("작성자와 댓글 내용을 입력해주세요.");
      return;
    }

    addComment.mutate({ writer, content });
    e.currentTarget.reset();
  };

  const handleMediaClick = (media: any) => {
    setSelectedMedia(media);
    setModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const section = document.getElementById('story-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil((mediaAssets?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMediaAssets = mediaAssets?.slice(startIndex, endIndex) || [];

  const getAuthorName = (authorRole: string) => {
    return authorRole === 'groom' ? '김철수' : '이영희';
  };

  const getAuthorEmoji = (authorRole: string) => {
    return authorRole === 'groom' ? '🤵' : '👰';
  };

  return (
    <section id="story-section" className="py-16 px-4">
      <h2 className="text-4xl font-bold mb-6 text-center">우리, 마주보기 전엔…</h2>

      {isAdmin && (
        <div className="flex justify-center mb-6">
          <Button onClick={() => { /* Add post logic */ }}>
            <Plus className="mr-2 h-4 w-4" />
            게시물 추가
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {currentMediaAssets.map((media: any) => {
          const mediaLikes = likesData?.[media.id] || [];
          const likesCount = mediaLikes.length;
          const hasLiked = mediaLikes.some(like => like.actor_id === actorId);
          
          return (
            <Card 
              key={media.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow relative"
            >
              {/* Header - White bar with profile */}
              <div className="h-14 bg-background border-b flex items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-lg">
                      {getAuthorEmoji(media.author_role)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">
                    {getAuthorName(media.author_role)}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingPost(media);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deletePost.mutate(media.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Image - Full width */}
              <div 
                className="cursor-pointer"
                onClick={() => handleMediaClick(media)}
              >
                {media.type === "image" && media.url && (
                  <img
                    src={media.url}
                    alt={media.title || "Memory"}
                    className="w-full aspect-square object-cover"
                  />
                )}
              </div>

              {/* Action Bar - Black strip */}
              <div className="h-12 bg-black flex items-center gap-4 px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 text-white hover:text-white/80 hover:bg-transparent"
                  onClick={() => toggleLike.mutate(media.id)}
                >
                  <Heart className={`h-6 w-6 transition-all ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 text-white hover:text-white/80 hover:bg-transparent"
                  onClick={() => handleMediaClick(media)}
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 text-white hover:text-white/80 hover:bg-transparent"
                >
                  <Send className="h-6 w-6" />
                </Button>
              </div>

              {/* Meta/Caption Area */}
              <div className="p-4 space-y-1">
                <p className="text-sm font-bold">
                  좋아요 {likesCount} 회
                </p>
                
                {media.title && (
                  <p className="text-sm">
                    <span className="font-semibold">{getAuthorName(media.author_role)}</span>{' '}
                    {media.title}
                  </p>
                )}
                
                {media.content && (
                  <p className="text-sm text-muted-foreground">{media.content}</p>
                )}
                
                <button
                  onClick={() => handleMediaClick(media)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  댓글 {commentsData?.[media.id]?.length || 0} 개 보기
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={() => setModalOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="grid md:grid-cols-2 h-full">
            <div className="bg-black flex items-center justify-center p-4">
              <img
                src={selectedMedia?.url}
                alt={selectedMedia?.title}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>

            <div className="flex flex-col h-full max-h-[90vh]">
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-xl">
                    {getAuthorEmoji(selectedMedia?.author_role)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">
                  {getAuthorName(selectedMedia?.author_role)}
                </span>
              </div>

              <ScrollArea className="flex-1 p-4">
                {(selectedMedia?.title || selectedMedia?.content) && (
                  <div className="mb-4 pb-4 border-b">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-lg">
                          {getAuthorEmoji(selectedMedia?.author_role)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold">{getAuthorName(selectedMedia?.author_role)}</span>{' '}
                          {selectedMedia?.title}
                        </p>
                        {selectedMedia?.content && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedMedia?.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {comments?.map((comment: any) => (
                  <div key={comment.id} className="mb-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{comment.writer}</span>{' '}
                          {comment.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      {(isAdmin || comment.commenter_id === commenterId) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => deleteComment.mutate(comment.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>

              <div className="border-t">
                <div className="p-4 pb-2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleLike.mutate(selectedMedia?.id)}
                  >
                    <Heart className={`h-6 w-6 ${likesData?.[selectedMedia?.id]?.some(like => like.actor_id === actorId) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
                <p className="px-4 pb-2 text-sm font-semibold">
                  좋아요 {likesData?.[selectedMedia?.id]?.length || 0} 회
                </p>
                
                <form onSubmit={handleCommentSubmit} className="px-4 pb-4 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      name="writer"
                      placeholder="작성자"
                      required
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      name="content"
                      placeholder="댓글 달기..."
                      required
                      className="flex-1 min-h-[60px] resize-none"
                    />
                    <Button type="submit" size="sm" className="self-end">
                      게시
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <div className="space-y-4 pt-6">
            <h2 className="text-lg font-semibold">게시물 수정</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updatePost.mutate({
                  id: editingPost?.id,
                  title: formData.get("title") as string,
                  content: formData.get("content") as string,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingPost?.title}
                />
              </div>
              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingPost?.content}
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">저장</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default StorySection;

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import bcrypt from "bcryptjs";

type MessageTarget = "groom" | "bride";

const MessageSection = () => {
  const [target, setTarget] = useState<MessageTarget>("groom");
  const [page, setPage] = useState(1);
  const [writer, setWriter] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const messagesPerPage = 5;

  const { data: messages } = useQuery({
    queryKey: ["messages", target, page],
    queryFn: async () => {
      const from = (page - 1) * messagesPerPage;
      const to = from + messagesPerPage - 1;
      
      const { data, error, count } = await supabase
        .from("messages")
        .select("*", { count: "exact" })
        .eq("target", target)
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      return { data, count };
    },
  });

  const createMessage = useMutation({
    mutationFn: async (newMessage: { target: MessageTarget; writer: string; password: string; content: string }) => {
      const hashedPassword = await bcrypt.hash(newMessage.password, 10);
      const { error } = await supabase.from("messages").insert({
        target: newMessage.target,
        writer: newMessage.writer,
        password_hash: hashedPassword,
        content: newMessage.content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setWriter("");
      setPassword("");
      setContent("");
      toast.success("메시지가 등록되었습니다");
    },
    onError: () => {
      toast.error("메시지 등록에 실패했습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writer.trim() || !password.trim() || !content.trim()) {
      toast.error("모든 항목을 입력해주세요");
      return;
    }
    createMessage.mutate({ target, writer, password, content });
  };

  const totalPages = Math.ceil((messages?.count || 0) / messagesPerPage);

  return (
    <section className="py-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 font-serif">
          바람에 맡긴 당신의 한마디
        </h2>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={target === "groom" ? "default" : "outline"}
            onClick={() => {
              setTarget("groom");
              setPage(1);
            }}
            className={target === "groom" ? "font-bold underline" : ""}
          >
            신랑
          </Button>
          <Button
            variant={target === "bride" ? "default" : "outline"}
            onClick={() => {
              setTarget("bride");
              setPage(1);
            }}
            className={target === "bride" ? "font-bold underline" : ""}
          >
            신부
          </Button>
        </div>

        <div className="space-y-6 mb-8">
          {messages?.data && messages.data.length > 0 ? (
            messages.data.map((message) => (
              <div key={message.id} className="bg-muted p-6 rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{message.writer}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">{message.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-12">
              아직 메시지가 없습니다
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                onClick={() => setPage(pageNum)}
                size="sm"
              >
                {pageNum}
              </Button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-muted p-6 rounded">
          <Input
            placeholder="이름"
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
          />
          <Input
            type="password"
            placeholder="비밀번호(수정용)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Textarea
            placeholder="메시지 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <Button type="submit" className="w-full">
            메시지 보내기
          </Button>
        </form>
      </div>
    </section>
  );
};

export default MessageSection;

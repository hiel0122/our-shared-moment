import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import IntroTextEditModal from "@/components/IntroTextEditModal";

const IntroTextSection = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: invitation, refetch } = useQuery({
    queryKey: ["invitation"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invitation").select("*").single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

      setIsAdmin(profile?.role === "admin");
    };

    checkAdmin();
  }, []);

  return (
    <section
      className="relative py-16 px-4"
      onMouseEnter={() => isAdmin && setShowEdit(true)}
      onMouseLeave={() => setShowEdit(false)}
    >
      {isAdmin && showEdit && (
        <Button onClick={() => setEditModalOpen(true)} className="absolute top-4 right-4 z-10" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          편집
        </Button>
      )}

      <div className="max-w-3xl mx-auto text-center">
        <div
          className="text-lg md:text-xl font-serif leading-relaxed"
          dangerouslySetInnerHTML={{ __html: invitation?.intro_text || "서로의 삶이 하나로 이어지는 날, 함께 축하해주세요." }}
        />
      </div>

      <IntroTextEditModal open={editModalOpen} onOpenChange={setEditModalOpen} onSave={() => refetch()} />
    </section>
  );
};

export default IntroTextSection;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MouseEvent, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import FooterEditModal from "@/components/FooterEditModal";

const FooterSection = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleGroomClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    navigate("/editor");
  };
  
  const { data: invitation, refetch } = useQuery({
    queryKey: ["invitation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitation")
        .select("*")
        .single();
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

  return (
    <footer 
      className="relative py-20 px-4 bg-muted"
      onMouseEnter={() => isAdmin && setShowEdit(true)}
      onMouseLeave={() => setShowEdit(false)}
    >
      {isAdmin && showEdit && (
        <Button
          onClick={() => setEditModalOpen(true)}
          className="absolute top-4 right-4 z-10"
          size="sm"
        >
          <Edit className="w-4 h-4 mr-2" />
          편집
        </Button>
      )}
      
      <div className="max-w-4xl mx-auto">
        {/* Footer top text - centered and larger */}
        <div className="text-center mb-12">
          <p className="text-xl md:text-2xl font-serif text-foreground/90 italic">
            "{invitation?.hero_line3 || "6년의 만남, 그리고 새로운 시작"}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-3">
            <div className="flex flex-col gap-1" style={{ fontSize: '0.9em' }}>
              <p className="text-foreground/90">
                <span 
                  onClick={handleGroomClick}
                  className="cursor-pointer"
                  style={{ 
                    textDecoration: 'none',
                  }}
                >
                  {invitation?.groom_father || "이양규"}, {invitation?.groom_mother || "한나미"}
                </span>
                {" "}의 장남
              </p>
              <p className="text-foreground font-medium">
                <span 
                  onClick={handleGroomClick}
                  className="cursor-pointer"
                >
                  신랑 {invitation?.couple_groom || "이학인"}
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-1" style={{ fontSize: '0.9em' }}>
              <p className="text-foreground/90">
                {invitation?.bride_father || "고범석"}, {invitation?.bride_mother || "장은경"} 의 장녀
              </p>
              <p className="text-foreground font-medium">
                신부 {invitation?.couple_bride || "고다희"}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              연락처 및 축의금 안내
            </p>
            <p className="text-sm text-muted-foreground">
              신랑측: 010-0000-0000
            </p>
            <p className="text-sm text-muted-foreground">
              신부측: 010-0000-0000
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              계좌번호
            </p>
            <p className="text-sm text-muted-foreground">
              신랑: 우리은행 1234-567-890123
            </p>
            <p className="text-sm text-muted-foreground">
              신부: 국민은행 987-65-4321098
            </p>
          </div>
        </div>
      </div>

      <FooterEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={() => refetch()}
      />
    </footer>
  );
};

export default FooterSection;

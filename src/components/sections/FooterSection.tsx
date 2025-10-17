import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MouseEvent } from "react";

const FooterSection = () => {
  const navigate = useNavigate();

  const handleGroomClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    navigate("/editor");
  };
  
  const { data: invitation } = useQuery({
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

  return (
    <footer className="py-20 px-4 bg-muted">
      <div className="max-w-4xl mx-auto">
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
            <p className="text-sm text-center text-muted-foreground mt-4 italic" style={{ fontSize: '0.85em' }}>
              "{invitation?.hero_line3 || "6년의 만남, 그리고 새로운 시작을 응원해주세요"}"
            </p>
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
    </footer>
  );
};

export default FooterSection;

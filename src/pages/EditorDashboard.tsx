import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const EditorDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/editor");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      navigate("/editor");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("로그아웃 되었습니다");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light">관리자 대시보드</h1>
          <Button onClick={handleLogout} variant="outline">로그아웃</Button>
        </div>
        <div className="text-center py-20 text-muted-foreground">
          편집 기능은 추가 개발 중입니다
        </div>
      </div>
    </div>
  );
};

export default EditorDashboard;

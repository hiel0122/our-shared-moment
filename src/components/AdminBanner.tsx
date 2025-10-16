import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AdminBanner = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Check if user is one of the admin emails
      const adminEmails = ['sinrang@sinrang.com', 'sinboo@sinboo.com'];
      const isAdminUser = adminEmails.includes(user.email || '');
      setIsAdmin(isAdminUser);
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      } else {
        checkAdmin();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsAdmin(false); // Immediately hide banner
    await supabase.auth.signOut();
    toast.success("관리자 모드로부터 로그아웃 되었습니다.");
    navigate("/");
  };

  if (!isAdmin) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 px-4 text-sm font-medium z-50 flex items-center justify-between">
      <span className="flex-1">관리자 모드로 접속 중 입니다.</span>
      <Button
        onClick={handleLogout}
        variant="ghost"
        size="sm"
        className="text-white hover:text-white hover:bg-red-700"
      >
        로그아웃
      </Button>
    </div>
  );
};

export default AdminBanner;

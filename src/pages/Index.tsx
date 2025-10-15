import HeroSection from "@/components/sections/HeroSection";
import StorySection from "@/components/sections/StorySection";
import LocationSection from "@/components/sections/LocationSection";
import MessageSection from "@/components/sections/MessageSection";
import FooterSection from "@/components/sections/FooterSection";
import AdminBanner from "@/components/AdminBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminBanner />
      <HeroSection />
      <StorySection />
      <LocationSection />
      <MessageSection />
      <FooterSection />
    </div>
  );
};

export default Index;

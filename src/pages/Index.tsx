import HeroSection from "@/components/sections/HeroSection";
import StorySection from "@/components/sections/StorySection";
import LocationSection from "@/components/sections/LocationSection";
import MessageSection from "@/components/sections/MessageSection";
import FooterSection from "@/components/sections/FooterSection";
import AdminBanner from "@/components/AdminBanner";

const Index = () => {
  return (
    <div className="min-h-screen">
      <AdminBanner />
      <div className="pt-0">
        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 space-y-8 py-8">
          <div className="section-block p-6 md:p-8">
            <StorySection />
          </div>
          <div className="section-block p-6 md:p-8">
            <LocationSection />
          </div>
          <div className="section-block p-6 md:p-8">
            <MessageSection />
          </div>
        </div>
        <FooterSection />
      </div>
    </div>
  );
};

export default Index;

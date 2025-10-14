import HeroSection from "@/components/sections/HeroSection";
import MediaSection from "@/components/sections/MediaSection";
import LocationSection from "@/components/sections/LocationSection";
import MessageSection from "@/components/sections/MessageSection";
import FooterSection from "@/components/sections/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <MediaSection />
      <LocationSection />
      <MessageSection />
      <FooterSection />
    </div>
  );
};

export default Index;

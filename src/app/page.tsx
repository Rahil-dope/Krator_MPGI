import HeroSection from "@/components/home/HeroSection";
import CountdownTimer from "@/components/home/CountdownTimer";
import AboutSection from "@/components/home/AboutSection";
import EventsPreview from "@/components/home/EventsPreview";
import TeamSection from "@/components/home/TeamSection";
import ContactSection from "@/components/home/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CountdownTimer />
      <AboutSection />
      <EventsPreview />
      <TeamSection />
      <ContactSection />
    </>
  );
}

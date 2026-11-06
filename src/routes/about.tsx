import { createFileRoute, Link } from '@tanstack/react-router';
import { studioHead } from '@/lib/studio-head';
import camera from '@/assets/launch-studio.jpg';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/about')({ head: () => studioHead('About', 'Meet Vincent, founder of NIXORA STUDIOS LTD - CR 9950450, and our vision for a global ten-engine creative studio.', false), staticData: { sitemap: true }, component: About });
function About() {
  return <main className="launch-theme min-h-screen bg-background text-foreground"><div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
    <Button asChild variant="outline"><Link to="/">← Back to Home</Link></Button>
    <p className="text-sm text-primary">NIXORA STUDIOS LTD - CR 9950450</p><h1 className="text-4xl font-bold">About NIXORA STUDIOS</h1>
    <img src={camera} alt="NIXORA studio camera with orange fabric" className="aspect-video w-full rounded-lg object-cover" />
    <section className="space-y-3"><h2 className="text-2xl font-bold">Our founder</h2><p className="text-muted-foreground">Founded by Anago Vincent Nnalue, NIXORA STUDIOS brings a creator's ambition to a global creative workspace.</p></section>
    <section className="space-y-3"><h2 className="text-2xl font-bold">Our vision</h2><p className="text-muted-foreground">Ten engines, one studio: image, video, animation, sound, voice, music, lipsync, editing and code. Our vision is a connected workflow where an idea can move between creative disciplines.</p></section>
    <section className="space-y-3"><h2 className="text-2xl font-bold">Our mission</h2><p className="text-muted-foreground">Help creators, filmmakers and businesses turn ideas into thoughtful visual stories and useful digital projects. We are developing the studio step by step, with clear access, private project ownership and honest availability information.</p></section>
    <Button asChild><Link to="/contact">Contact NIXORA</Link></Button>
  </div></main>;
}
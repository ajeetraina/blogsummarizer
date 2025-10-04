import { Button } from '@/components/ui/button';
import { Linkedin, Twitter } from 'lucide-react';

interface SocialShareButtonsProps {
  takeaways: string[];
  blogUrl: string;
}

export const SocialShareButtons = ({ takeaways, blogUrl }: SocialShareButtonsProps) => {
  const formatTakeaways = () => {
    return takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n\n');
  };

  const handleLinkedInShare = () => {
    const text = `Key Takeaways from ${blogUrl}\n\n${formatTakeaways()}\n\n#BlogSummary #KeyTakeaways`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleTwitterShare = () => {
    const text = `Key Takeaways:\n\n${formatTakeaways()}\n\nRead more: ${blogUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=600');
  };

  const handleBlueskyShare = () => {
    const text = `Key Takeaways from ${blogUrl}\n\n${formatTakeaways()}`;
    const blueskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
    window.open(blueskyUrl, '_blank', 'width=600,height=600');
  };

  return (
    <div className="pt-6 border-t">
      <h3 className="text-lg font-semibold mb-4">Share to Social Media</h3>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleLinkedInShare}
          className="gap-2 bg-[#0A66C2] hover:bg-[#084d91] text-white"
        >
          <Linkedin className="w-5 h-5" />
          Share on LinkedIn
        </Button>
        <Button
          onClick={handleTwitterShare}
          className="gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
        >
          <Twitter className="w-5 h-5" />
          Share on Twitter
        </Button>
        <Button
          onClick={handleBlueskyShare}
          className="gap-2 bg-[#0085ff] hover:bg-[#0070d9] text-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.5c-1.92 0-3.64.49-5 1.32C5.64 2.99 3.92 2.5 2 2.5v1.59c1.44 0 2.73.4 3.75 1.07C7.48 6.22 9.1 7.5 12 7.5s4.52-1.28 6.25-2.34C19.27 4.49 20.56 4.09 22 4.09V2.5c-1.92 0-3.64.49-5 1.32-1.36-.83-3.08-1.32-5-1.32zm0 7c-3.32 0-5.36 1.64-7 3.5 1.64 1.86 3.68 3.5 7 3.5s5.36-1.64 7-3.5c-1.64-1.86-3.68-3.5-7-3.5zm0 5.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 1.5c2.75 0 5.2-1.34 7-3.5-.45 3.5-2.91 6.5-7 6.5s-6.55-3-7-6.5c1.8 2.16 4.25 3.5 7 3.5z"/>
          </svg>
          Share on Bluesky
        </Button>
      </div>
    </div>
  );
};

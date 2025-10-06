import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Copy, CheckCheck } from 'lucide-react';
import { SocialShareButtons } from './SocialShareButtons';

interface BlogSummarizerProps {
  initialUrl?: string;
}

export const BlogSummarizer = ({ initialUrl = '' }: BlogSummarizerProps) => {
  const [url, setUrl] = useState(initialUrl);
  const [takeaways, setTakeaways] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Auto-summarize when initialUrl is provided
  useEffect(() => {
    if (initialUrl && url) {
      handleSummarize();
    }
  }, [initialUrl]);

  const handleSummarize = async () => {
    if (!url.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a blog URL to summarize',
        variant: 'destructive',
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL starting with http:// or https://',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setTakeaways([]);

    try {
      const { data, error } = await supabase.functions.invoke('summarize-blog', {
        body: { url },
      });

      if (error) {
        console.error('Error:', error);
        toast({
          title: 'Summarization Failed',
          description: error.message || 'Failed to summarize the blog. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.takeaways && Array.isArray(data.takeaways)) {
        setTakeaways(data.takeaways);
        toast({
          title: 'Success!',
          description: 'Blog summarized into 5 key takeaways',
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    const text = takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Takeaways copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          AI-Powered Summarization
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Key Takeaways
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform lengthy blog posts into shareable key takeaways instantly
        </p>
      </div>

      <Card className="p-8 shadow-glow border-2 backdrop-blur-sm bg-card/50">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="url"
              placeholder="https://example.com/blog-post"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSummarize()}
              className="flex-1 h-12 text-lg"
              disabled={isLoading}
            />
            <Button
              onClick={handleSummarize}
              disabled={isLoading}
              size="lg"
              className="h-12 px-8 bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Summarize
                </>
              )}
            </Button>
          </div>

          {takeaways.length > 0 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Key Takeaways</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy All
                    </>
                  )}
                </Button>
              </div>

              <div className="grid gap-4">
                {takeaways.map((takeaway, index) => (
                  <div
                    key={index}
                    className="group relative p-6 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                        {index + 1}
                      </div>
                      <p className="text-foreground leading-relaxed flex-1">
                        {takeaway}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <SocialShareButtons takeaways={takeaways} blogUrl={url} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

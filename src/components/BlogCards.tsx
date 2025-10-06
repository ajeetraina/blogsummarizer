import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Calendar } from 'lucide-react';

interface BlogPost {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

interface BlogCardsProps {
  onSelectBlog: (url: string) => void;
}

export const BlogCards = ({ onSelectBlog }: BlogCardsProps) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-blogs');
      
      if (error) {
        console.error('Error fetching blogs:', error);
        toast({
          title: 'Failed to load blogs',
          description: 'Could not fetch latest blog posts',
          variant: 'destructive',
        });
        return;
      }

      if (data?.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'Ajeet Raina':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Docker Blog':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const groupedPosts = posts.reduce((acc, post) => {
    if (!acc[post.source]) {
      acc[post.source] = [];
    }
    acc[post.source].push(post);
    return acc;
  }, {} as Record<string, BlogPost[]>);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-muted rounded w-full mb-2"></div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Latest Docker & Container Blogs</h2>
        <p className="text-muted-foreground">
          Click any blog to generate key takeaways instantly
        </p>
      </div>

      {Object.entries(groupedPosts).map(([source, sourcePosts]) => (
        <div key={source} className="space-y-6">
          <h3 className="text-2xl font-semibold border-b border-border pb-2">
            {source}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sourcePosts.map((post, index) => (
              <Card
                key={index}
                className="group p-6 hover:shadow-glow transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm"
                onClick={() => onSelectBlog(post.link)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getSourceColor(post.source)}`}>
                      {post.source}
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.pubDate)}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBlog(post.link);
                    }}
                  >
                    Get Key Takeaways
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
import { useState, useRef } from 'react';
import { BlogSummarizer } from '@/components/BlogSummarizer';
import { BlogCards } from '@/components/BlogCards';

const Index = () => {
  const [selectedUrl, setSelectedUrl] = useState('');
  const summarizerRef = useRef<HTMLDivElement>(null);

  const handleBlogSelect = (url: string) => {
    setSelectedUrl(url);
    // Scroll to summarizer
    setTimeout(() => {
      summarizerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/10">
      <div ref={summarizerRef}>
        <BlogSummarizer key={selectedUrl} initialUrl={selectedUrl} />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <BlogCards onSelectBlog={handleBlogSelect} />
      </div>
    </div>
  );
};

export default Index;

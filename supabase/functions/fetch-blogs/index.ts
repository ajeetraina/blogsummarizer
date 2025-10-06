import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching blog posts from multiple sources');

    const blogSources = [
      { url: 'https://ajeetraina.com/feed/', source: 'Ajeet Raina' },
      { url: 'https://www.docker.com/blog/feed/', source: 'Docker Blog' },
      { url: 'https://collabnix.com/feed/', source: 'Collabnix' }
    ];

    const allPosts: BlogPost[] = [];

    for (const { url, source } of blogSources) {
      try {
        console.log(`Fetching from ${source}: ${url}`);
        const response = await fetch(url);
        const xmlText = await response.text();
        
        // Parse RSS feed
        const posts = parseRSSFeed(xmlText, source);
        allPosts.push(...posts);
      } catch (error) {
        console.error(`Error fetching ${source}:`, error);
      }
    }

    // Sort by date and limit to 9 posts
    const sortedPosts = allPosts
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 9);

    console.log(`Successfully fetched ${sortedPosts.length} posts`);

    return new Response(JSON.stringify({ posts: sortedPosts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-blogs function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseRSSFeed(xmlText: string, source: string): BlogPost[] {
  const posts: BlogPost[] = [];
  
  // Simple regex-based XML parsing for RSS
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
  const linkRegex = /<link>(.*?)<\/link>/;
  const descriptionRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
  const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
  const categoryRegex = /<category><!\[CDATA\[(.*?)\]\]><\/category>|<category>(.*?)<\/category>/g;
  
  let itemMatch;
  while ((itemMatch = itemRegex.exec(xmlText)) !== null) {
    const itemContent = itemMatch[1];
    
    const titleMatch = itemContent.match(titleRegex);
    const linkMatch = itemContent.match(linkRegex);
    const descriptionMatch = itemContent.match(descriptionRegex);
    const pubDateMatch = itemContent.match(pubDateRegex);
    
    // Extract categories for Collabnix
    const categories: string[] = [];
    let categoryMatch;
    while ((categoryMatch = categoryRegex.exec(itemContent)) !== null) {
      const category = categoryMatch[1] || categoryMatch[2];
      if (category) categories.push(category.toLowerCase());
    }
    
    // Filter Collabnix posts to only include Docker and Kubernetes related content
    if (source === 'Collabnix') {
      const hasRelevantCategory = categories.some(cat => 
        cat.includes('docker') || cat.includes('container') || cat.includes('kubernetes')
      );
      if (!hasRelevantCategory) continue;
    }
    
    if (titleMatch && linkMatch) {
      const title = titleMatch[1] || titleMatch[2] || '';
      const link = linkMatch[1] || '';
      const description = descriptionMatch ? (descriptionMatch[1] || descriptionMatch[2] || '') : '';
      const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();
      
      // Strip HTML tags from description
      const cleanDescription = description.replace(/<[^>]*>/g, '').slice(0, 150);
      
      posts.push({
        title: title.trim(),
        link: link.trim(),
        description: cleanDescription.trim(),
        pubDate: pubDate.trim(),
        source
      });
    }
  }
  
  return posts;
}
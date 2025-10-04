import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Summarizing blog URL:', url);

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the website content
    console.log('Fetching website content...');
    const fetchResponse = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!fetchResponse.ok) {
      console.error('Failed to fetch website:', fetchResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch the website content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const websiteData = await fetchResponse.json();
    const content = websiteData.data?.content || websiteData.content || '';
    
    if (!content) {
      console.error('No content found in website');
      return new Response(
        JSON.stringify({ error: 'Could not extract content from the website' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Content fetched, summarizing with AI...');

    // Summarize with AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content summarizer. Extract exactly 5 key takeaways from blog posts. Each takeaway should be concise, actionable, and capture the essence of the content. Return ONLY a JSON array of 5 strings, nothing else.'
          },
          {
            role: 'user',
            content: `Summarize this blog post into exactly 5 key takeaways:\n\n${content.slice(0, 15000)}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to generate summary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const summaryText = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', summaryText);

    // Parse the JSON array from the response
    let takeaways: string[];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = summaryText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        takeaways = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines and filter
        takeaways = summaryText
          .split('\n')
          .map((line: string) => line.replace(/^[\d\-\*\.]\s*/, '').trim())
          .filter((line: string) => line.length > 10)
          .slice(0, 5);
      }

      // Ensure we have exactly 5 takeaways
      if (takeaways.length < 5) {
        takeaways = [
          ...takeaways,
          ...Array(5 - takeaways.length).fill('Key insight extracted from the content.')
        ];
      }
      takeaways = takeaways.slice(0, 5);
    } catch (e) {
      console.error('Failed to parse takeaways:', e);
      takeaways = [
        'Unable to extract key takeaways.',
        'Please try with a different blog URL.',
        'The content may not be accessible.',
        'Try again with a different article.',
        'Check if the URL is correct.'
      ];
    }

    console.log('Successfully generated takeaways');
    return new Response(
      JSON.stringify({ takeaways }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in summarize-blog function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// /supabase/functions/estoque-critico/index.ts

import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verificar API key
  const apiKey = req.headers.get('x-api-key');
  const expectedKey = Deno.env.get('API_KEY');

  if (!apiKey || apiKey !== expectedKey) {
    return new Response(
      JSON.stringify({
        error: 'Invalid API key'
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { data, error } = await supabaseClient
      .from('estoque')
      .select('*')
      .lt('quantidade_atual', 'estoque_minimo');

    if (error) throw error;

    return new Response(
      JSON.stringify({
        items: data
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
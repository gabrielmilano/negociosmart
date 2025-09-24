// /supabase/functions/auth/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Request } from 'https://deno.land/std@0.168.0/http/server.ts';

interface AuthResponse {
  authenticated: boolean;
  message?: string;
}

serve(async (req: Request) => {
  try {
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = Deno.env.get('API_KEY');

    if (!apiKey || apiKey !== expectedKey) {
      return new Response(
        JSON.stringify({
          authenticated: false,
          message: 'Invalid API key'
        } as AuthResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        authenticated: true
      } as AuthResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        message: 'Internal server error'
      } as AuthResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
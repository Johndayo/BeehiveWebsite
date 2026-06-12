declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

declare module "https://deno.land/std@0.208.0/http/server.ts" {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>
  ): void;
}

declare module "npm:@supabase/supabase-js@2.57.4" {
  export { createClient } from "@supabase/supabase-js";
}

import { createClient } from "@supabase/supabase-js";
const supabaseUrl = import.meta.env.VITE_BASE_URL;
const supabaseKey = import.meta.env.VITE_PRIVATE_KEY;
export const supabaseClient = createClient(supabaseUrl, supabaseKey);
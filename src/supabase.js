import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zldduhgpbnsxiqfljrkj.supabase.co";
const supabaseKey = "sb_publishable_H1S132RIxq_yFfIMdo-TqA_k_F-ZNP7";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
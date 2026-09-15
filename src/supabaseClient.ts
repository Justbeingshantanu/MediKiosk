import { createClient } from "@supabase/supabase-js"
import { projectId, publicAnonKey } from "../utils/supabase/info"

// Single shared instance — prevents "Multiple GoTrueClient instances" warning
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

export default supabase

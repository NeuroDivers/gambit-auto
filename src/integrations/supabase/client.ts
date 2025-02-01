import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yxssuhzzmxwtnaodgpoq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4c3N1aHp6bXh3dG5hb2RncG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNjA1NTksImV4cCI6MjA1MzgzNjU1OX0.Jpv5MxUz69_ZVrm2vMt0sBudwb-NsuBBRUx5U02K1ew'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
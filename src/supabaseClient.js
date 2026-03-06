import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qpnamhpggsczzdibxdkd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbmFtaHBnZ3NjenpkaWJ4ZGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzU1MDAsImV4cCI6MjA4ODMxMTUwMH0.0tSrSkSEPrbBc99zqKHJ0Bl3JBT3le4gfoL0hObLBUU' 

// Note a palavra 'export' antes de 'const' - ela é obrigatória!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
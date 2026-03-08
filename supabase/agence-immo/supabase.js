import { createClient } from '@supabase/supabase-js'

// URL de ton projet Supabase (trouvé dans Settings → API → Project URL)
const supabaseUrl = "https://abcd1234.supabase.co"  

// Clé publique (Publishable Key)
const supabaseKey = "sb_publishable_q7QhDVsfPwy1woYGDIUi7A_Pdsy-BT-"  

export const supabase = createClient(supabaseUrl, supabaseKey)
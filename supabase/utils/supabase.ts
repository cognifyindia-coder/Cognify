import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://emdmuzhgzgapxzfrezzs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZG11emhnemdhcHh6ZnJlenpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjE1NzAsImV4cCI6MjA1OTUzNzU3MH0.7F-1Hn5tIKri5pCOpIFXDADqiLN-YNUsgYK9iD1_Eh0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
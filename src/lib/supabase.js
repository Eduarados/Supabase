import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://llripbybijsfogdkwaje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscmlwYnliaWpzZm9nZGt3YWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTgxNjYsImV4cCI6MjEwMDgzNDE2Nn0.eHM33Ke1nUT1BJlFQVBz952JXQOCFtMeVnNvePzqV1o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

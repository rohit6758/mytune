import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptklrwcenlmgwzzhtlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a2xyd2NlbmxtZ3d6enpodGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDg2NDgsImV4cCI6MjEwMjAyNDY0OH0.OB0UeAs4f5XxJBr9687hvZUA9EYdndRYAeOHh8I2_J0';

export const supabase = createClient(supabaseUrl, supabaseKey);

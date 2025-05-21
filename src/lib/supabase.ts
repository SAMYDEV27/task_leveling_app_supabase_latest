import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uejcocecmrqlkzgqhsql.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlamNvY2VjbXJxbGt6Z3Foc3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjU0NTcsImV4cCI6MjA2MzQ0MTQ1N30.BT6FDdx3jHmIv7JJUHxZtvcC9QIbElUoNUn3GEWSAow';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tcrgmeajhxkysnniknse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcmdtZWFqaHhreXNubmlrbnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NzYzNjYsImV4cCI6MjA4MzM1MjM2Nn0.QtZaobhjpKLtzYy1-pbH8EsUvgRzI2pY_gpUb4PjDO0';

export const supabase = createClient(supabaseUrl, supabaseKey);

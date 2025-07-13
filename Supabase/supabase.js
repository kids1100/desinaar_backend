const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ewppyeqhqylgauppwvjd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3cHB5ZXFocXlsZ2F1cHB3dmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4OTU4NTgsImV4cCI6MjA1MTQ3MTg1OH0.trrtW5SekNvHJeeINdSPwk9Xc6nc5MlpFYhawFzoWBM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;

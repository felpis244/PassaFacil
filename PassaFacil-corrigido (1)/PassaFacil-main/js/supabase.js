import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://tplregdwpeoidqguvcmy.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbHJlZ2R3cGVvaWRxZ3V2Y215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDc0MDEsImV4cCI6MjA5MDEyMzQwMX0.htBXxrTuKA725Ji0gOIyP14SZaMZxn-5bnH0Cs1ckTM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)


//Importando nosso banco de dados para a conexão com nosso site 
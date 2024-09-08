import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
// const supabaseUrl = 'https://vfxqlimpalwlebgektea.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHFsaW1wYWx3bGViZ2VrdGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk2ODI4MzAsImV4cCI6MjAzNTI1ODgzMH0.6RS4amlEpD95eusLwT5yZScJ6cT6iT9L6qoJpnui1gw'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;
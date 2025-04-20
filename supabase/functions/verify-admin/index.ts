
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { ethers } from "https://esm.sh/ethers@6.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { signature, message, walletAddress } = await req.json()
    
    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log("Verifying signature for wallet:", walletAddress)
    console.log("Message to verify:", message)
    
    try {
      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature)
      console.log("Recovered address:", recoveredAddress)
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        console.log("Signature verification failed")
        return new Response(
          JSON.stringify({ success: false, error: "Signature verification failed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        )
      }
      
      // Check if wallet is in admin list
      const { data: adminData, error: adminError } = await adminSupabase
        .from('admin_wallets')
        .select('wallet_address')
        .ilike('wallet_address', walletAddress)
        .single()
      
      if (adminError || !adminData) {
        console.log("Not authorized as admin:", adminError)
        return new Response(
          JSON.stringify({ success: false, error: "Not authorized as admin" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        )
      }
      
      // Sign in the admin user to get session tokens
      const { data: signInData, error: signInError } = await adminSupabase.auth.signInWithPassword({
        email: 'huy23121994@gmail.com',
        password: 'Uc.:7ZBTSgK:35s'
      })

      if (signInError || !signInData.session) {
        console.error("Error signing in admin:", signInError)
        return new Response(
          JSON.stringify({ success: false, error: "Failed to sign in admin" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        )
      }

      console.log("Admin signed in successfully")
      
      return new Response(
        JSON.stringify({ 
          success: true,
          session: {
            access_token: signInData.session.access_token,
            refresh_token: signInData.session.refresh_token,
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
      
    } catch (error) {
      console.error("Signature verification error:", error)
      return new Response(
        JSON.stringify({ success: false, error: "Invalid signature" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})

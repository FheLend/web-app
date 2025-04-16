
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { ethers } from "https://esm.sh/ethers@6.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { signature, message, walletAddress } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Verify the signature
    let recoveredAddress: string
    try {
      // Recover the address from the signature
      recoveredAddress = ethers.verifyMessage(message, signature)
      
      // Check if addresses match (case insensitive)
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return new Response(
          JSON.stringify({ success: false, error: "Signature verification failed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        )
      }
      
      // Check if wallet is an admin
      const { data, error } = await supabase
        .from('admin_wallets')
        .select('wallet_address')
        .eq('wallet_address', walletAddress)
        .single()
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ success: false, error: "Not authorized as admin" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        )
      }
      
      // Generate a JWT with the wallet address claim
      const jwtResponse = await supabase.auth.admin.createToken({
        claims: {
          wallet_address: walletAddress
        }
      })
      
      if (jwtResponse.error) {
        return new Response(
          JSON.stringify({ success: false, error: jwtResponse.error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          token: jwtResponse.data.token,
          isAdmin: true 
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

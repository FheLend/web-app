
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log("Verifying signature for wallet:", walletAddress);
    console.log("Message to verify:", message);
    
    try {
      // Try verifying with ethers.js recoverAddress
      const recoveredAddress = ethers.verifyMessage(message, signature);
      console.log("Recovered address:", recoveredAddress);
      
      // Check if addresses match (case insensitive)
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        console.log("Signature verification failed. Addresses don't match:", {
          recovered: recoveredAddress.toLowerCase(),
          provided: walletAddress.toLowerCase()
        });
        
        return new Response(
          JSON.stringify({ success: false, error: "Signature verification failed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        )
      }
      
      // Check if wallet is an admin
      const { data, error } = await supabase
        .from('admin_wallets')
        .select('wallet_address')
        .ilike('wallet_address', walletAddress)
        .single()
      
      console.log("Found in admin table:", data);
      
      if (error || !data) {
        console.log("Not authorized as admin:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Not authorized as admin" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        )
      }
      
      try {
        // Generate a JWT with the wallet address claim using service role
        // We'll use the wallet address as the unique identifier instead of a fixed UUID
        // This creates a custom token without requiring an actual auth user
        const walletAddressClean = walletAddress.toLowerCase();
        const customUserId = crypto.randomUUID(); // Generate a unique UUID for this session
        
        console.log("Creating token with custom user ID:", customUserId);
        
        const jwtResponse = await adminSupabase.auth.admin.createToken({
          user_id: customUserId,
          user_metadata: {
            wallet_address: walletAddressClean
          }
        })
        
        if (jwtResponse.error) {
          console.log("JWT creation error:", jwtResponse.error);
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
      } catch (tokenError) {
        console.error("Token creation error:", tokenError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create authentication token" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        )
      }
      
    } catch (error) {
      console.error("Signature verification error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid signature" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})

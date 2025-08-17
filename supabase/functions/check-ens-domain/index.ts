import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Function to resolve ENS name from wallet address
async function resolveENSFromAddress(address: string): Promise<string | null> {
  try {
    // Use Ethereum mainnet RPC to resolve ENS
    const rpcUrl = 'https://eth-mainnet.g.alchemy.com/v2/demo'
    
    // Call reverse resolver to get ENS name
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', // ENS Reverse Registrar
            data: `0x55ea6c47000000000000000000000000${address.slice(2)}` // node(address)
          },
          'latest'
        ],
        id: 1
      })
    })

    const data = await response.json()
    
    if (data.result && data.result !== '0x') {
      // Decode the result to get ENS name
      const hex = data.result.slice(2)
      if (hex.length > 128) {
        const nameLength = parseInt(hex.slice(126, 128), 16) * 2
        const nameHex = hex.slice(128, 128 + nameLength)
        const ensName = Buffer.from(nameHex, 'hex').toString('utf8')
        
        if (ensName.endsWith('.eth')) {
          return ensName
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error resolving ENS:', error)
    return null
  }
}

// Function to verify ENS name resolves back to the wallet address
async function verifyENSResolution(ensName: string, expectedAddress: string): Promise<boolean> {
  try {
    const rpcUrl = 'https://eth-mainnet.g.alchemy.com/v2/demo'
    
    // Get the resolver for the ENS name
    const nameHash = await getNameHash(ensName)
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', // ENS Registry
            data: `0x0178b8bf${nameHash.slice(2)}` // resolver(bytes32)
          },
          'latest'
        ],
        id: 1
      })
    })

    const resolverData = await response.json()
    
    if (resolverData.result && resolverData.result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      const resolverAddress = '0x' + resolverData.result.slice(-40)
      
      // Get the address from the resolver
      const addrResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: resolverAddress,
              data: `0x3b3b57de${nameHash.slice(2)}` // addr(bytes32)
            },
            'latest'
          ],
          id: 1
        })
      })

      const addrData = await addrResponse.json()
      
      if (addrData.result && addrData.result !== '0x') {
        const resolvedAddress = '0x' + addrData.result.slice(-40)
        return resolvedAddress.toLowerCase() === expectedAddress.toLowerCase()
      }
    }
    
    return false
  } catch (error) {
    console.error('Error verifying ENS resolution:', error)
    return false
  }
}

// Simple name hash implementation
async function getNameHash(name: string): Promise<string> {
  const crypto = await import('https://deno.land/std@0.177.0/crypto/mod.ts')
  
  let nameHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
  
  if (name) {
    const labels = name.split('.')
    
    for (let i = labels.length - 1; i >= 0; i--) {
      const labelHash = await crypto.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(labels[i])
      )
      const labelHashHex = '0x' + Array.from(new Uint8Array(labelHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      const combined = nameHash + labelHashHex.slice(2)
      const combinedHash = await crypto.crypto.subtle.digest(
        'SHA-256',
        new Uint8Array(Buffer.from(combined.slice(2), 'hex'))
      )
      nameHash = '0x' + Array.from(new Uint8Array(combinedHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    }
  }
  
  return nameHash
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { walletAddress, userId } = await req.json()

    if (!walletAddress || !userId) {
      throw new Error('Missing required parameters')
    }

    console.log(`Checking ENS for wallet: ${walletAddress}`)

    // Resolve ENS name from wallet address
    const ensName = await resolveENSFromAddress(walletAddress)
    
    if (!ensName) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          ensDomain: null,
          message: 'No ENS domain found for this wallet address'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Verify ENS name resolves back to the wallet address
    const isValid = await verifyENSResolution(ensName, walletAddress)

    const ensDomain = {
      name: ensName,
      resolvedAddress: walletAddress,
      isValid
    }

    // Update user profile with ENS domain info
    if (isValid) {
      await supabase
        .from('profiles')
        .update({
          display_name: ensName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }

    console.log(`ENS check complete: ${ensName} (valid: ${isValid})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        ensDomain,
        message: isValid ? 'Valid ENS domain found' : 'ENS domain found but validation failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in check-ens-domain function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
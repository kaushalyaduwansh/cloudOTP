// Cloudflare Worker script for sending OTP via Fast2SMS

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    // Only allow POST requests
    if (request.method === "OPTIONS") {
      return handleOptions(request)
    }
    
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      })
    }
  
    // Check origin for CORS
    const allowedOrigins = [
      "http://localhost:3000",
      "https://dianalearningportal.com"
    ]
    
    const origin = request.headers.get("Origin")
    if (!allowedOrigins.includes(origin)) {
      return new Response(JSON.stringify({ error: "Not allowed" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json"
        }
      })
    }
  
    try {
      // Get request body
      const body = await request.json()
      const { phoneNumber, otp } = body
      
      // Validate the input
      if (!phoneNumber || !otp) {
        return new Response(JSON.stringify({ error: "Phone number and OTP are required" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        })
      }
      
      // Format the number (remove +91 if present)
      const formattedNumber = phoneNumber.replace('+91', '').replace(/\s/g, '')
      
      // API key (hardcoded as requested)
      const apiKey = "LXKEVHTPr3rtHiqO404kamKdan5SOjslr51j8EJmcGt3fHlc63yV10zplfMz"
      
      // Make the request to Fast2SMS
      const smsResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': apiKey
        },
        body: JSON.stringify({
          variables_values: otp,
          route: 'otp',
          numbers: formattedNumber
        })
      })
      
      const data = await smsResponse.json()
      
      // Return the response with CORS headers
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to send OTP" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      })
    }
  }
  
  // Handle OPTIONS requests for CORS preflight
  function handleOptions(request) {
    const origin = request.headers.get("Origin")
    const allowedOrigins = [
      "http://localhost:3000",
      "https://dianalearningportal.com"
    ]
    
    if (!allowedOrigins.includes(origin)) {
      return new Response(null, { status: 403 })
    }
    
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400"
      }
    })
  }
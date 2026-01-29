import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RedirectRule {
  geo_targeting?: { allow?: string[]; block?: string[] };
  device_targeting?: { mobile?: string; desktop?: string; tablet?: string };
}

// Get user's country from IP (using external API)
async function getCountryFromIP(ip: string): Promise<string> {
  try {
    // Skip for local addresses
    if (ip === '127.0.0.1' || ip === 'localhost') return 'IN';

    // Use ipapi.co (free tier: 1000/day, no key required for basic)
    // Alternatively use a Supabase Edge Function secret if we have a paid key
    // For robustness, consider adding a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

    const response = await fetch(`https://ipapi.co/${ip}/country/`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const country = await response.text();
      return country.trim().toUpperCase();
    }
  } catch (e) {
    // console.error('Geo lookup failed:', e);
  }
  return 'IN'; // Fallback
}

// Detect device type from user agent
function getDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
  const ua = userAgent.toLowerCase();

  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

// Apply targeting rules to determine redirect URL
function applyTargetingRules(
  baseUrl: string,
  rules: RedirectRule,
  country: string,
  deviceType: string
): string | null {
  // Check geo targeting
  if (rules.geo_targeting) {
    const { allow, block } = rules.geo_targeting;

    if (block && block.includes(country)) {
      return null; // Blocked country
    }

    if (allow && allow.length > 0 && !allow.includes(country)) {
      return null; // Not in allowed list
    }
  }

  // Check device targeting - return device-specific URL if available
  if (rules.device_targeting) {
    const deviceUrl = rules.device_targeting[deviceType as keyof typeof rules.device_targeting];
    if (deviceUrl) return deviceUrl;
  }

  return baseUrl;
}

// Cloak affiliate URL by removing tracking parameters
function cloakUrl(url: string, preserveParams: string[] = []): string {
  try {
    const urlObj = new URL(url);
    const paramsToRemove = ['tag', 'ref', 'affiliate', 'aff', 'utm_source', 'utm_medium', 'utm_campaign'];

    paramsToRemove.forEach(param => {
      if (!preserveParams.includes(param)) {
        urlObj.searchParams.delete(param);
      }
    });

    return urlObj.toString();
  } catch {
    return url;
  }
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const shortCode = url.pathname.slice(1);

    if (!shortCode) {
      return new Response('Invalid short code', { status: 404 });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get short link
    const { data: shortLink, error } = await supabaseClient
      .from('short_links')
      .select('*')
      .eq('short_code', shortCode)
      .single();

    if (error || !shortLink) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Not Found</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
              .container { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #dc2626; }
              p { color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔗 Link Not Found</h1>
              <p>This short link does not exist or has been removed.</p>
            </div>
          </body>
        </html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Check if active
    if (!shortLink.is_active) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Deactivated</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
              .container { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #f59e0b; }
              p { color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ Link Deactivated</h1>
              <p>This link has been temporarily deactivated by its owner.</p>
            </div>
          </body>
        </html>
      `, {
        status: 410,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Check if expired
    if (shortLink.expires_at && new Date(shortLink.expires_at) < new Date()) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Expired</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
              .container { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #dc2626; }
              p { color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⏰ Link Expired</h1>
              <p>This link expired on ${new Date(shortLink.expires_at).toLocaleDateString()}.</p>
            </div>
          </body>
        </html>
      `, {
        status: 410,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Check password protection
    const password = url.searchParams.get('password');
    if (shortLink.password && shortLink.password !== password) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Password Required</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
              .container { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; }
              h1 { color: #2563eb; margin-bottom: 1rem; }
              input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; width: 100%; margin: 1rem 0; }
              button { background: #2563eb; color: white; padding: 0.75rem 2rem; border: none; border-radius: 0.5rem; cursor: pointer; }
              button:hover { background: #1d4ed8; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔒 Password Protected</h1>
              <p>This link requires a password to access.</p>
              <form method="GET">
                <input type="password" name="password" placeholder="Enter password" required />
                <button type="submit">Access Link</button>
              </form>
            </div>
          </body>
        </html>
      `, {
        status: 401,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Get user data
    const userAgent = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';

    // Detect device and country
    const deviceType = getDeviceType(userAgent);
    const country = await getCountryFromIP(ip);

    // Parse browser & OS
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Apply targeting rules
    const targetingRules: RedirectRule = {
      geo_targeting: shortLink.geo_targeting,
      device_targeting: shortLink.device_targeting,
    };

    let redirectUrl = applyTargetingRules(
      shortLink.original_url,
      targetingRules,
      country,
      deviceType
    );

    // Check if user has enabled link cloaking (stripping parameters)
    if (redirectUrl) {
      const { data: userSettings } = await supabaseClient
        .from('user_settings')
        .select('notification_preferences')
        .eq('user_id', shortLink.user_id)
        .single();

      const prefs = userSettings?.notification_preferences as any;
      if (prefs?.cloaking === true) {
        redirectUrl = cloakUrl(redirectUrl);
      }
    }

    // If blocked or no match, show error
    if (!redirectUrl) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Not Available</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
              .container { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #dc2626; }
              p { color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🌍 Not Available in Your Region</h1>
              <p>This link is not available in your location (${country}).</p>
            </div>
          </body>
        </html>
      `, {
        status: 403,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Track click event (fire and forget)
    supabaseClient
      .from('click_events')
      .insert({
        user_id: shortLink.user_id,
        short_link_id: shortLink.id,
        ip_address: ip,
        user_agent: userAgent,
        country,
        device_type: deviceType,
        browser,
        os,
        referrer: referer,
        referrer_domain: referer ? new URL(referer).hostname : null,
      })
      .then(() => {
        // Update click count
        return supabaseClient
          .from('short_links')
          .update({
            click_count: (shortLink.click_count || 0) + 1,
            last_clicked_at: new Date().toISOString(),
          })
          .eq('id', shortLink.id);
      })
      .catch((err) => console.error('Error tracking click:', err));

    // Redirect with proper headers
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow', // SEO: Don't index redirect pages
      },
    });

  } catch (error: any) {
    console.error('Redirect error:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; }
            p { color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error</h1>
            <p>An error occurred while processing this link.</p>
          </div>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
});

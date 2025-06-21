# Instagram API Setup Guide

## Instagram Posting Requirements

Instagram posting via API requires specific setup that differs from other social platforms. This guide explains the complete process.

## Prerequisites

### 1. Instagram Business Account
- **Personal Instagram accounts CANNOT post via API**
- Convert your Instagram to Business account:
  1. Go to Instagram app → Settings → Account
  2. Select "Switch to Professional Account"
  3. Choose "Business"

### 2. Facebook Page Connection
- Instagram Business must be connected to a Facebook Page
- In Instagram app → Settings → Business → Linked Accounts → Facebook
- Connect to your Facebook Page

### 3. Facebook Developer App
- Create app at https://developers.facebook.com/
- Add "Instagram Basic Display" product
- Add "Instagram API" product (for Business accounts)

## Getting Access Token

### Method 1: Facebook Graph API Explorer (Recommended)

1. **Go to Graph API Explorer**
   - Visit https://developers.facebook.com/tools/explorer/

2. **Select Your App**
   - Choose your Facebook app from dropdown

3. **Get User Access Token**
   - Click "Get Token" → "Get User Access Token"
   - Select permissions:
     - `instagram_basic`
     - `pages_show_list`
     - `pages_read_engagement`
     - `instagram_content_publish`

4. **Generate Token**
   - Click "Generate Access Token"
   - Authorize the app
   - Copy the generated token

### Method 2: Facebook Login Flow (Advanced)

```javascript
// Example for web applications
const params = new URLSearchParams({
  client_id: 'YOUR_APP_ID',
  redirect_uri: 'YOUR_REDIRECT_URI',
  scope: 'instagram_basic,pages_show_list,instagram_content_publish',
  response_type: 'code'
});

const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
// Redirect user to authUrl, then exchange code for token
```

## Token Types and Expiration

### Short-lived Tokens (Default)
- **Duration**: 1 hour
- **Use**: Testing and development
- **Renewal**: Must be exchanged for long-lived token

### Long-lived Tokens
- **Duration**: 60 days
- **Use**: Production applications
- **Renewal**: Can be refreshed before expiration

### Page Access Tokens
- **Duration**: Never expire (if app approved)
- **Use**: Instagram Business posting
- **Requirement**: Business verification

## Extending Token Lifetime

```bash
# Exchange short-lived for long-lived token
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=SHORT_LIVED_TOKEN"
```

## Required Permissions

### For Instagram Business Posting
- `instagram_basic` - Basic profile access
- `instagram_content_publish` - Posting content
- `pages_show_list` - Access connected pages
- `pages_read_engagement` - Read page insights

### For Instagram Personal (Read-only)
- `instagram_basic` - Basic profile access
- Note: Personal accounts cannot post via API

## Testing Your Token

### Test with Graph API Explorer
1. Go to https://developers.facebook.com/tools/explorer/
2. Enter your token
3. Try this query: `me?fields=id,name`
4. For Instagram: `me/accounts?fields=instagram_business_account{id,username}`

### Test with curl
```bash
# Test Facebook token
curl "https://graph.facebook.com/me?access_token=YOUR_TOKEN"

# Test Instagram connection
curl "https://graph.facebook.com/me/accounts?fields=instagram_business_account{id,username}&access_token=YOUR_TOKEN"
```

## Common Issues and Solutions

### "Invalid OAuth access token"
- **Cause**: Token format incorrect or expired
- **Solution**: Generate new token with correct permissions

### "Cannot parse access token"
- **Cause**: Token contains invalid characters or format
- **Solution**: Copy token carefully, avoid extra spaces

### "This endpoint requires the 'pages_show_list' permission"
- **Cause**: Missing required permission
- **Solution**: Re-generate token with `pages_show_list`

### "No Instagram Business Account Found"
- **Cause**: Instagram not connected to Facebook Page
- **Solution**: Link Instagram Business to Facebook Page

### "Personal accounts cannot post via API"
- **Cause**: Using personal Instagram account
- **Solution**: Convert to Business account

## Token Security

### Best Practices
- Never expose tokens in client-side code
- Store tokens securely (encrypted database)
- Use environment variables for sensitive data
- Implement token refresh logic
- Monitor token expiration

### Token Validation
```javascript
// Validate token before use
const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
if (!response.ok) {
  // Token invalid, request new one
  throw new Error('Token expired or invalid');
}
```

## Instagram Posting Flow

### 1. Create Media Container
```javascript
const containerData = {
  image_url: 'https://example.com/image.jpg',
  caption: 'Your post caption #hashtags',
  access_token: 'YOUR_TOKEN'
};

const response = await fetch(`https://graph.facebook.com/v18.0/${instagram_account_id}/media`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(containerData)
});
```

### 2. Publish Container
```javascript
const publishData = {
  creation_id: container_id,
  access_token: 'YOUR_TOKEN'
};

const response = await fetch(`https://graph.facebook.com/v18.0/${instagram_account_id}/media_publish`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(publishData)
});
```

## Troubleshooting Checklist

- [ ] Instagram account converted to Business
- [ ] Instagram connected to Facebook Page
- [ ] Facebook Developer App created
- [ ] Instagram products added to app
- [ ] Correct permissions requested
- [ ] Token generated with Graph API Explorer
- [ ] Token tested with Graph API Explorer
- [ ] No extra spaces in token when copying

## Support Resources

- **Facebook Developer Docs**: https://developers.facebook.com/docs/instagram-api/
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **Instagram Business API**: https://developers.facebook.com/docs/instagram-api/getting-started
- **Permission Reference**: https://developers.facebook.com/docs/permissions/reference
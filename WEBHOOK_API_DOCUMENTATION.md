# Image Generation Webhook API Documentation

## Overview
The image generation webhook allows external services to generate images for the SEO AI Writer system. When a user requests image generation, the system sends a POST request to the configured webhook URL and expects a specific response format.

## Webhook Request Format

### HTTP Method
```
POST
```

### Headers
```
Content-Type: application/json
User-Agent: SEO-AI-Writer/1.0
X-Request-ID: {unique_request_id}
```

### Request Payload
```json
{
  "requestId": "1749524042273sfydpuhpv",
  "title": "Con mèo",
  "prompt": "con mèo cam đi trên cỏ",
  "sourceText": "Optional text content related to the image",
  "userId": 1,
  "articleId": 123,
  "timestamp": "2025-06-10T02:54:02.273Z",
  "creditsUsed": 1
}
```

### Field Descriptions
- `requestId`: Unique identifier for tracking the request
- `title`: Title of the image to be generated
- `prompt`: Detailed description/prompt for image generation
- `sourceText`: Optional related text content
- `userId`: ID of the user requesting the image
- `articleId`: Optional ID of related article (null if standalone)
- `timestamp`: ISO timestamp of the request
- `creditsUsed`: Number of credits that will be deducted

## Expected Response Format

The system supports multiple response formats for flexibility:

### Format 1: Standard Success Response
```json
{
  "success": true,
  "imageUrl": "https://your-cdn.com/generated-image.jpg",
  "message": "Image generated successfully"
}
```

### Format 2: Array with fileName (Supported)
```json
[
  {
    "fileName": "con-ca-map-20250610_032536.jpg"
  }
]
```

### Format 3: Single Object with fileName
```json
{
  "fileName": "generated-image-20250610_032536.jpg"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Response Field Requirements
- **Standard format**: `success` boolean and `imageUrl` string required
- **fileName format**: `fileName` string will be converted to full URL automatically
- **Error format**: `success: false` and `error` message required

### URL Construction for fileName Format
When webhook returns fileName format, the system constructs the full image URL using:
1. `imageCdnUrl` setting (if configured in admin settings)
2. Webhook domain + `/images/` path (fallback)

Example: `fileName: "image.jpg"` becomes `https://your-webhook-domain.com/images/image.jpg`

## HTTP Status Codes
- `200 OK`: Image generated successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error during generation

## Timeout
- The webhook has a 60-second timeout
- Ensure your service responds within this timeframe

## Example Implementation (Node.js/Express)

```javascript
app.post('/your-webhook-endpoint', async (req, res) => {
  try {
    const { title, prompt, requestId } = req.body;
    
    // Validate required fields
    if (!title || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Title and prompt are required'
      });
    }
    
    // Generate image using your AI service
    const imageUrl = await generateImage(prompt);
    
    // Return success response
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Image generated successfully'
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate image'
    });
  }
});
```

## Testing Your Webhook

1. Use the webhook test function in Admin Settings
2. Or test manually with curl:

```bash
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -H "User-Agent: SEO-AI-Writer/1.0" \
  -d '{
    "requestId": "test_123",
    "title": "Test Image",
    "prompt": "A beautiful sunset over mountains",
    "userId": 1,
    "timestamp": "2025-06-10T10:00:00.000Z",
    "creditsUsed": 1,
    "test": true
  }'
```

## Common Issues

### 404 Not Found
- Webhook URL is incorrect
- Endpoint not configured for POST requests
- Service not running

### Connection Refused/Timeout
- Service is down or unreachable
- Network connectivity issues
- Firewall blocking requests

### 400 Bad Request
- Missing required fields (title, prompt)
- Invalid JSON format
- Unexpected request structure

## Security Considerations

1. Validate all input data
2. Implement rate limiting
3. Use HTTPS for webhook URLs
4. Consider adding webhook signature verification
5. Handle timeouts gracefully
6. Log requests for debugging

## Integration Steps

1. Develop your webhook endpoint following this specification
2. Deploy and test your webhook service
3. Configure the webhook URL in Admin Settings > Webhook
4. Use the test function to verify connectivity
5. Enable image generation in settings
6. Test end-to-end image generation from the dashboard
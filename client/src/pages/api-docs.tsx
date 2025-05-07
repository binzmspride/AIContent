import React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function ApiDocsPage() {
  const { t } = useLanguage();

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-6">API Documentation</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Use our API to integrate SEO AI Writer with your own applications.
      </p>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>
                Our API allows you to access and integrate with SEO AI Writer functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-3">Base URL</h3>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  https://seoaiwriter.com/api
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">API Versions</h3>
                <p className="mb-4">The current API version is v1. All API requests should be made to:</p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  https://seoaiwriter.com/api/v1/...
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Rate Limits</h3>
                <p>
                  API requests are limited to 60 per minute per API key. Rate limit information is included in the response headers.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Learn how to authenticate your API requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-3">API Key Authentication</h3>
                <p className="mb-4">
                  All API requests require authentication using an API key. You can generate API keys from your dashboard.
                </p>
                <p className="mb-4">
                  To authenticate an API request, include your API key in the headers:
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                  X-API-Key: your_api_key_here
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Scopes</h3>
                <p className="mb-4">
                  API keys are granted specific scopes that determine what actions they can perform. Common scopes include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><Badge>user:read</Badge> - Read user information</li>
                  <li><Badge>articles:read</Badge> - Access article list</li>
                  <li><Badge>credits:read</Badge> - Check credit balance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Available endpoints and their functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">GET</Badge>
                  <h3 className="text-xl font-medium">/api/info</h3>
                </div>
                <p className="mb-2">Returns basic information about the API and service.</p>
                <p className="text-sm text-muted-foreground mb-4">No authentication required</p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                  GET /api/info
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">GET</Badge>
                  <h3 className="text-xl font-medium">/api/status</h3>
                </div>
                <p className="mb-2">Returns the current system status.</p>
                <p className="text-sm text-muted-foreground mb-4">No authentication required</p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                  GET /api/status
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900">GET</Badge>
                  <h3 className="text-xl font-medium">/api/user</h3>
                </div>
                <p className="mb-2">Returns information about the authenticated user.</p>
                <p className="text-sm text-muted-foreground mb-4">Requires authentication with <Badge>user:read</Badge> scope</p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                  GET /api/user
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900">GET</Badge>
                  <h3 className="text-xl font-medium">/api/articles</h3>
                </div>
                <p className="mb-2">Returns a list of articles belonging to the authenticated user.</p>
                <p className="text-sm text-muted-foreground mb-4">Requires authentication with <Badge>articles:read</Badge> scope</p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                  GET /api/articles?page=1&limit=10
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900">GET</Badge>
                  <h3 className="text-xl font-medium">/api/credits</h3>
                </div>
                <p className="mb-2">Returns the current credit balance for the authenticated user.</p>
                <p className="text-sm text-muted-foreground mb-4">Requires authentication with <Badge>credits:read</Badge> scope</p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                  GET /api/credits
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Examples</CardTitle>
              <CardDescription>
                Code examples showing how to use the API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-3">JavaScript Example</h3>
                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre">
{`const apiKey = 'your_api_key_here';

// Get user information
fetch('https://seoaiwriter.com/api/user', {
  method: 'GET',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Python Example</h3>
                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre">
{`import requests

api_key = 'your_api_key_here'
headers = {
    'X-API-Key': api_key,
    'Content-Type': 'application/json'
}

# Get user's articles
response = requests.get('https://seoaiwriter.com/api/articles', headers=headers)
data = response.json()
print(data)`}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">cURL Example</h3>
                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre">
{`curl -X GET https://seoaiwriter.com/api/credits \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json"`}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
              <CardDescription>
                Understanding API error responses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-3">Error Format</h3>
                <p className="mb-4">
                  All API errors return a JSON response with an error field:
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
{`{
  "success": false,
  "error": "Error message details"
}`}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Common Error Codes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Status Code</th>
                        <th className="text-left py-2 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4">400</td>
                        <td className="py-2 px-4">Bad Request - Invalid parameters</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">401</td>
                        <td className="py-2 px-4">Unauthorized - Missing or invalid API key</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">403</td>
                        <td className="py-2 px-4">Forbidden - API key doesn't have required scope</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">404</td>
                        <td className="py-2 px-4">Not Found - Resource doesn't exist</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">429</td>
                        <td className="py-2 px-4">Too Many Requests - Rate limit exceeded</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4">500</td>
                        <td className="py-2 px-4">Internal Server Error - Something went wrong</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React from 'react';
import {
  Tile,
  TabPanel,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  CodeSnippet,
  Button,
  Link,
  Tag,
  AccordionItem,
  Accordion,
  ClickableTile,
  ExpandableTile,
  Grid,
  Column
} from '@carbon/react';
import { Application, Security, Api, Code, IbmWatsonxCodeAssistantForZRefactor, IbmCloudKeyProtect, IbmApiConnect, IbmWatsonxCodeAssistant, IbmKnowledgeCatalogPremium, FaceActivated, Password, Subflow } from '@carbon/icons-react';

function ForDevelopers() {
  return (
    <div className="bx--grid bx--grid--full-width">
      {/* Hero Section */}
      <div className="bx--row" style={{ margin: '2rem 0' }}>
        <div className="bx--col-lg-16">
          <h1>Expert_Guide Developer Documentation</h1>
          <h2 style={{ color: '#666', marginTop: '1rem', fontSize: '1.25rem' }}>
            Secure Face Recognition Authentication for Modern Applications
          </h2>
          <p className="landing-page__p" style={{ margin: '1rem 0', fontSize: '1.1rem', lineHeight: '1.5' }}>
            Welcome to Expert_Guide's developer documentation. Our powerful face recognition system 
            provides enterprise-grade security for verifying real human users and preventing automated attacks. 
            With support for both simple face verification and enhanced face password sequences, 
            Expert_Guide offers flexible authentication options for your applications.
          </p>
          <p className="landing-page__p" style={{ margin: '1rem 0', lineHeight: '1.5' }}>
            Whether you're building a web application, mobile app, or enterprise system, 
            our comprehensive API suite makes it easy to implement secure human verification.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Button href="/register-developer" renderIcon={Application} size="lg" style={{ marginRight: '1rem' }}>
              Get Started
            </Button>
            <Button href="#api-reference" kind="tertiary" renderIcon={Api}>
              View API Reference
            </Button>
          </div>
        </div>
      </div>

      {/* Why Expert_Guide? Section */}
      <div className="bx--row" style={{ margin: '3rem 0' }}>
        <div className="bx--col-lg-16">
          <h2 style={{ marginBottom: '1.5rem' }}>Why Choose Expert_Guide?</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.5', marginBottom: '2rem' }}>
            Expert_Guide combines cutting-edge face recognition technology with enterprise-grade security 
            to provide a reliable solution for human verification. Our platform is designed for 
            developers who need robust authentication while maintaining user privacy.
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bx--row" style={{ margin: '2rem 0' }}>
        <div className="bx--col-md-4 bx--col-lg-4">
          <ClickableTile>
            <Security style={{ marginBottom: '1rem' }} />
            <h4>Enterprise Security</h4>
            <p style={{ lineHeight: '1.5' }}>
              Built with a security-first approach:
              <ul style={{ marginTop: '0.5rem' }}>
                <li>Enterprise-grade encryption</li>
                <li>GDPR compliance</li>
                <li>Regular security audits</li>
                <li>Secure data handling</li>
              </ul>
            </p>
          </ClickableTile>
        </div>
        <div className="bx--col-md-4 bx--col-lg-4">
          <ClickableTile>
            <Api style={{ marginBottom: '1rem' }} />
            <h4>Simple Integration</h4>
            <p>
              RESTful APIs with comprehensive documentation. Integrate face verification in your app within minutes
              using our SDK and ready-to-use components.
            </p>
          </ClickableTile>
        </div>
        <div className="bx--col-md-4 bx--col-lg-4">
          <ClickableTile>
            <IbmCloudKeyProtect style={{ marginBottom: '1rem' }} />
            <h4>Privacy First</h4>
            <p>
              We prioritize user privacy. Face data is processed in real-time and never stored permanently.
              Full compliance with privacy regulations.
            </p>
          </ClickableTile>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div style={{ margin: '3rem 0 1rem' }}>
        <h2>Getting Started Guide</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.5', margin: '1rem 0' }}>
          Follow these steps to integrate Expert_Guide into your application. Our straightforward 
          setup process will have you up and running in minutes.
        </p>
                                                                                                                                                                                                 
        {/* Integration Steps Overview */}
        <Grid style={{ margin: '2rem 0' }}>
          <Column sm={4} md={4} lg={4}>
            <ClickableTile>
              <IbmApiConnect style={{ marginBottom: '1rem' }} />
              <h4>1. Registration</h4>
              <p>Create a developer account and get your API credentials</p>
            </ClickableTile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <ClickableTile>
              <Code style={{ marginBottom: '1rem' }} />
              <h4>2. Installation</h4>
              <p>Install the Expert_Guide SDK in your project</p>
            </ClickableTile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <ClickableTile>
              <FaceActivated style={{ marginBottom: '1rem' }} />
              <h4>3. Implementation</h4>
              <p>Integrate face verification into your app</p>
            </ClickableTile>
          </Column>
        </Grid>
      
        
      
        {/* Add Key Management Section */}
        <div style={{ margin: '2rem 0' }}>
          <h3 style={{ marginBottom: '1rem' }}>API Key Management</h3>
          <Grid>
            <Column sm={4} md={4} lg={8}>
              <h4>Best Practices</h4>
              <ul style={{ lineHeight: '1.5' }}>
                <li>Store API keys in environment variables</li>
                <li>Never commit API keys to version control</li>
                <li>Rotate keys periodically for security</li>
                <li>Use different keys for development and production</li>
              </ul>
            </Column>
            <Column sm={4} md={4} lg={8}>
              <h4>Security Measures</h4>
              <ul style={{ lineHeight: '1.5' }}>
                <li>Keep your API key confidential</li>
                <li>Monitor API usage regularly</li>
                <li>Implement rate limiting</li>
                <li>Set up key rotation schedules</li>
              </ul>
            </Column>
          </Grid>
        </div>
      
       
      
        {/* Detailed Integration Steps */}
        <Accordion>
          <AccordionItem 
            title="1. Register and Get API Keys"
            style={{ marginBottom: '1rem' }}
          >
            <h4 style={{ marginBottom: '1rem' }}>Create Your Developer Account</h4>
            <p>Start by registering for a Expert_Guide developer account:</p>
            <ol style={{ margin: '1rem 0', lineHeight: '1.5' }}>
              <li>Visit the <Link href="/register-developer">Developer Registration page</Link></li>
              <li>Complete the registration form</li>
              <li>Verify your email address</li>
              <li>Access your developer dashboard</li>
            </ol>
      
            <h4 style={{ margin: '1.5rem 0 1rem' }}>API Credentials</h4>
            <p>You'll need these credentials for authentication:</p>
            <ul style={{ margin: '1rem 0', lineHeight: '1.5' }}>
              <li><strong>API Key</strong> - Your unique identifier for API requests</li>
              <li><strong>Client Secret</strong> - Secure key for authentication</li>
              <li><strong>Client ID</strong> - Your application identifier</li>
            </ul>
      
            <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: '#f4f4f4', borderLeft: '4px solid #0f62fe' }}>
              <h5 style={{ marginBottom: '0.5rem' }}>Security Best Practices</h5>
              <ul style={{ lineHeight: '1.5' }}>
                <li>Never expose credentials in client-side code</li>
                <li>Use environment variables for sensitive data</li>
                <li>Rotate credentials periodically</li>
                <li>Use different keys for development and production</li>
              </ul>
            </div>
          </AccordionItem>
      
          <AccordionItem 
            title="2. Set Up Environment"
            style={{ marginBottom: '1rem' }}
          >
            <h4 style={{ marginBottom: '1rem' }}>Installation Options</h4>
            
            <h5>NPM Installation</h5>
            <CodeSnippet type="multi">
  {`npm install @Expert_Guide/sdk
  
  # Additional dependencies for React applications
  npm install @Expert_Guide/react`}
            </CodeSnippet>
      
            <h5 style={{ marginTop: '1.5rem' }}>Yarn Installation</h5>
            <CodeSnippet type="multi">
  {`yarn add @Expert_Guide/sdk
  yarn add @Expert_Guide/react`}
            </CodeSnippet>
      
            <h4 style={{ margin: '1.5rem 0 1rem' }}>Environment Configuration</h4>
            <p>Create a .env file in your project root:</p>
            <CodeSnippet type="multi">
  {`REACT_APP_Expert_Guide_API_KEY=your_api_key
  REACT_APP_Expert_Guide_CLIENT_ID=your_client_id
  REACT_APP_Expert_Guide_CLIENT_SECRET=your_client_secret
  REACT_APP_Expert_Guide_API_URL=https://api.Expert_Guide.com`}
            </CodeSnippet>
          </AccordionItem>
      
          <AccordionItem 
            title="3. Initialize SDK"
            style={{ marginBottom: '1rem' }}
          >
            <h4 style={{ marginBottom: '1rem' }}>Basic SDK Configuration</h4>
            <CodeSnippet type="multi">
  {`import { Expert_GuideClient } from '@Expert_Guide/sdk';
  
  const client = new Expert_GuideClient({
    apiKey: process.env.REACT_APP_Expert_Guide_API_KEY,
    clientId: process.env.REACT_APP_Expert_Guide_CLIENT_ID,
    clientSecret: process.env.REACT_APP_Expert_Guide_CLIENT_SECRET,
    apiUrl: process.env.REACT_APP_Expert_Guide_API_URL
  });`}
            </CodeSnippet>
      
            <h4 style={{ margin: '1.5rem 0 1rem' }}>Advanced Configuration</h4>
            <CodeSnippet type="multi">
  {`const client = new Expert_GuideClient({
    // Required configuration
    apiKey: process.env.REACT_APP_Expert_Guide_API_KEY,
    clientId: process.env.REACT_APP_Expert_Guide_CLIENT_ID,
    clientSecret: process.env.REACT_APP_Expert_Guide_CLIENT_SECRET,
    
    // Optional configuration
    timeout: 30000, // Request timeout in milliseconds
    retryAttempts: 3, // Number of retry attempts
    debug: process.env.NODE_ENV === 'development', // Enable debug logging
    onError: (error) => console.error('Expert_Guide Error:', error)
  });`}
            </CodeSnippet>
      
            <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: '#f4f4f4' }}>
              <h5 style={{ marginBottom: '0.5rem' }}>Quick Start Tips</h5>
              <ul style={{ lineHeight: '1.5' }}>
                <li>Initialize the client once and reuse the instance</li>
                <li>Handle errors appropriately in production</li>
                <li>Configure timeout values based on your needs</li>
                <li>Enable debug mode during development</li>
              </ul>
            </div>
          </AccordionItem>
      
          <AccordionItem 
            title="4. Next Steps"
            style={{ marginBottom: '1rem' }}
          >
            <h4 style={{ marginBottom: '1rem' }}>Additional Resources</h4>
            <ul style={{ lineHeight: '1.5' }}>
              <li>Review the <Link href="#api-reference">API Reference</Link> for detailed endpoint documentation</li>
              <li>Check out our <Link href="#code-examples">Code Examples</Link> for implementation guides</li>
              <li>Join our <Link href="#">Developer Community</Link> for support</li>
              <li>Subscribe to our <Link href="#">API Updates</Link> newsletter</li>
            </ul>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Main Content */}
      <div className="bx--row">
        <div className="bx--col-lg-16">
          <Tabs>
            <TabList aria-label="Developer Documentation Tabs">
              <Tab>Getting Started</Tab>
              <Tab>Authentication</Tab>
              <Tab>API Reference</Tab>
              <Tab>Code Examples</Tab>
              <Tab>Testing with cURL</Tab>
            </TabList>

            <TabPanels>
              {/* Getting Started Panel */}
              <TabPanel>
                <Tile style={{ margin: '1rem 0' }}>
                  <h3>Integration Steps</h3>
                  <Accordion>
                    <AccordionItem title="1. Register and Get API Keys">
                      <p>Create a developer account and obtain your API credentials:</p>
                      <ul>
                        <li>API Key - Your unique identifier for API requests</li>
                        <li>Client Secret - Secure key for authentication</li>
                        <li>Client ID - Your application identifier</li>
                      </ul>
                      <p style={{ marginTop: '1rem' }}>
                        Keep your credentials secure and never expose them in client-side code.
                        We recommend using environment variables for storing sensitive information.
                      </p>
                      <p style={{ marginTop: '1rem' }}>
                        API keys are environment-specific. Use different keys for development and production.
                      </p>
                    </AccordionItem>
                    <AccordionItem title="2. Set Up Environment">
                      <p>Configure your development environment with the required dependencies:</p>
                      <CodeSnippet type="multi">
{`npm install @Expert_Guide/sdk
# or
yarn add @Expert_Guide/sdk`}
                      </CodeSnippet>
                    </AccordionItem>
                    <AccordionItem title="3. Initialize SDK">
                      <CodeSnippet type="multi">
{`import { Expert_GuideClient } from '@Expert_Guide/sdk';

const client = new Expert_GuideClient({
  apiKey: 'YOUR_API_KEY',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET'
});`}
                      </CodeSnippet>
                    </AccordionItem>
                  </Accordion>
                </Tile>
              </TabPanel>

              {/* Authentication Panel */}
              <TabPanel>
                <Tile style={{ margin: '1rem 0' }}>
                  <h3>Authentication</h3>
                  <p>Expert_Guide uses API key authentication for all API requests.</p>
                  <CodeSnippet type="multi">
{`// Example HTTP Request Header
{
  "X-API-Key": "YOUR_API_KEY",
  "X-Client-ID": "YOUR_CLIENT_ID",
  "X-Client-Secret": "YOUR_CLIENT_SECRET",
  "Content-Type": "application/json"
}`}
                  </CodeSnippet>
                </Tile>
              </TabPanel>

              {/* API Reference Panel */}
              <TabPanel>
                <Tile style={{ margin: '1rem 0' }}>
                  <h3>API Endpoints</h3>
                  
                  {/* Face Verification API */}
                  <ExpandableTile style={{ margin: '1rem 0' }}>
                    <h4>
                      <FaceActivated style={{ marginRight: '1rem', verticalAlign: 'middle' }} />
                      Face Verification
                    </h4>
                    <Tag type="blue">POST</Tag> <code>/api/client/verify-face</code>
                    
                    <div style={{ margin: '1rem 0' }}>
                      <p>Verifies a user's identity using facial recognition.</p>
                      
                      <h5>Request Headers</h5>
                      <CodeSnippet type="multi">
{`{
  "X-API-Key": "YOUR_API_KEY",
  "Content-Type": "application/json"
}`}
                      </CodeSnippet>

                      <h5>Request Body</h5>
                      <CodeSnippet type="multi">
{`{
  "userId": "string",     // Unique identifier for the user
  "faceData": "string",  // Base64 encoded image data
  "options": {
    "threshold": 0.8,    // Optional: matching threshold (0-1)
    "liveness": true     // Optional: enable liveness detection
  }
}`}
                      </CodeSnippet>

                      <h5>Response</h5>
                      <CodeSnippet type="multi">
{`{
  "success": true,
  "message": "Verification successful",
  "data": {
    "matchScore": 98.7,
    "verificationId": "ver_123456",
    "timestamp": "2024-02-07T10:30:00Z"
  }
}`}
                      </CodeSnippet>

                      <h5>Error Responses</h5>
                      <CodeSnippet type="multi">
{`// 400 Bad Request
{
  "success": false,
  "message": "Invalid image format",
  "error": "BAD_REQUEST"
}

// 401 Unauthorized
{
  "success": false,
  "message": "Invalid API key",
  "error": "UNAUTHORIZED"
}`}
                      </CodeSnippet>
                    </div>
                  </ExpandableTile>

                  {/* Face Password API */}
                  <ExpandableTile style={{ margin: '1rem 0' }}>
                    <h4>
                      <Password style={{ marginRight: '1rem', verticalAlign: 'middle' }} />
                      Face Password Verification
                    </h4>
                    <Tag type="blue">POST</Tag> <code>/api/client/verify-face-password</code>
                    
                    <div style={{ margin: '1rem 0' }}>
                      <p>Verifies a user's facial password sequence for enhanced security.</p>
                      
                      <h5>Request Body</h5>
                      <CodeSnippet type="multi">
{`{
  "userId": "string",
  "faceSequence": [
    {
      "faceData": "string",  // Base64 encoded image
      "sequenceId": number   // Position in sequence (1-5)
    }
  ],
  "options": {
    "maxAttempts": 3,
    "timeoutSeconds": 30
  }
}`}
                      </CodeSnippet>

                      <h5>Response</h5>
                      <CodeSnippet type="multi">
{`{
  "success": true,
  "message": "Face password verified",
  "data": {
    "sessionToken": "jwt_token_here",
    "expiresIn": 3600
  }
}`}
                      </CodeSnippet>
                    </div>
                  </ExpandableTile>
                </Tile>
              </TabPanel>

              {/* Code Examples Panel */}
              <TabPanel>
                <Tile style={{ margin: '1rem 0' }}>
                  <h3>Implementation Examples</h3>
                  <Tabs nested>
                    <TabList aria-label="Programming Languages">
                      <Tab>JavaScript</Tab>
                      <Tab>Python</Tab>
                      <Tab>React</Tab>
                    </TabList>
                    <TabPanels>
                      {/* JavaScript Example */}
                      <TabPanel>
                        <CodeSnippet type="multi">
{`// JavaScript Example using async/await
const Expert_Guide = {
  async verifyFace(userId, imageFile) {
    // Convert image to base64
    const base64Image = await this.fileToBase64(imageFile);
    
    const response = await fetch('https://api.Expert_Guide.com/api/client/verify-face', {
      method: 'POST',
      headers: {
        'X-API-Key': 'YOUR_API_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        faceData: base64Image
      })
    });
    
    return await response.json();
  },

  async verifyFacePassword(userId, faceSequence) {
    const sequence = await Promise.all(
      faceSequence.map(async (file, index) => ({
        faceData: await this.fileToBase64(file),
        sequenceId: index + 1
      }))
    );

    const response = await fetch('https://api.Expert_Guide.com/api/client/verify-face-password', {
      method: 'POST',
      headers: {
        'X-API-Key': 'YOUR_API_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        faceSequence: sequence
      })
    });

    return await response.json();
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }
};`}
                        </CodeSnippet>
                      </TabPanel>

                      {/* Python Example */}
                      <TabPanel>
                        <CodeSnippet type="multi">
{`# Python Example using requests
import requests
import base64

class Expert_GuideClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.Expert_Guide.com/api/client'
        
    def verify_face(self, user_id, image_path):
        # Read and encode image
        with open(image_path, 'rb') as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
        
        response = requests.post(
            f'{self.base_url}/verify-face',
            headers={
                'X-API-Key': self.api_key,
                'Content-Type': 'application/json'
            },
            json={
                'userId': user_id,
                'faceData': encoded_image
            }
        )
        
        return response.json()

# Usage Example
client = Expert_GuideClient('YOUR_API_KEY')
result = client.verify_face('user123', 'path/to/image.jpg')
print(result)`}
                        </CodeSnippet>
                      </TabPanel>

                      {/* React Example */}
                      <TabPanel>
                        <CodeSnippet type="multi">
{`// React Component Example
import React, { useState } from 'react';
import { Button, Loading } from '@carbon/react';

function FaceVerification() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const base64Image = await fileToBase64(file);
      const response = await fetch('https://api.Expert_Guide.com/api/client/verify-face', {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.REACT_APP_Expert_Guide_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123',
          faceData: base64Image
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Verification failed:', error);
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        id="face-upload"
      />
      <Button as="label" htmlFor="face-upload">
        Upload Face Image
      </Button>
      
      {loading && <Loading description="Verifying..." small />}
      
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h4>{result.success ? 'Success!' : 'Failed'}</h4>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}`}
                        </CodeSnippet>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Tile>
              </TabPanel>

              {/* Testing with cURL */}
              <TabPanel>
                <Tile style={{ margin: '1rem 0' }}>
                  <h3>Testing API with cURL</h3>
                  <p>Use the following cURL command to test the face verification API:</p>
                  <CodeSnippet type="multi">
{`curl -X POST https://api.Expert_Guide.com/api/client/verify-face \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "example_user",
    "faceData": "base64_encoded_image"
  }'`}
                  </CodeSnippet>
                </Tile>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>

      {/* Implementation Tips */}
      <div style={{ margin: '3rem 0' }}>
        <h3 style={{ marginBottom: '1rem' }}>Implementation Best Practices</h3>
        <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
          Follow these guidelines to ensure optimal integration and performance of Expert_Guide in your application:
        </p>
        <Grid>
          <Column sm={4} md={4} lg={8}>
            <h4 style={{ marginBottom: '0.5rem' }}>Error Handling</h4>
            <ul style={{ marginBottom: '1rem' }}>
              <li>Implement comprehensive error handling for all API responses</li>
              <li>Use try-catch blocks around API calls</li>
              <li>Provide meaningful error messages to users</li>
              <li>Log errors for debugging and monitoring</li>
            </ul>
          </Column>
          <Column sm={4} md={4} lg={8}>
            <h4 style={{ marginBottom: '0.5rem' }}>Security</h4>
            <ul style={{ marginBottom: '1rem' }}>
              <li>Store API keys securely using environment variables</li>
              <li>Implement rate limiting to prevent abuse</li>
              <li>Use HTTPS for all API communications</li>
              <li>Regular security audits of your implementation</li>
            </ul>
          </Column>
        </Grid>
      </div>

      {/* Performance Considerations */}
      <div style={{ margin: '3rem 0' }}>
        <h3>Performance Optimization Guide</h3>
        <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
          Optimize your Expert_Guide integration for the best possible performance and user experience:
        </p>
        <Grid>
          <Column sm={4} md={4} lg={8}>
            <h4>Image Optimization</h4>
            <ul>
              <li>Maximum file size: 1MB</li>
              <li>Recommended formats: JPEG, PNG</li>
              <li>Optimal resolution: 640x480 pixels</li>
              <li>Compression quality: 80%</li>
            </ul>
          </Column>
          <Column sm={4} md={4} lg={8}>
            <h4>API Performance</h4>
            <ul>
              <li>Implement request caching where appropriate</li>
              <li>Use connection pooling for multiple requests</li>
              <li>Set appropriate timeout values</li>
              <li>Monitor API response times</li>
            </ul>
          </Column>
        </Grid>
      </div>

      {/* Support Section */}
      <div className="bx--row" style={{ margin: '2rem 0' }}>
        <div className="bx--col-lg-16">
          <Tile>
            <h3>Need Help?</h3>
            <p style={{ margin: '1rem 0' }}>
              Get support from our developer community and team. We offer multiple channels
              to help you integrate and optimize Expert_Guide in your applications.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Button kind="primary" href="#" renderIcon={IbmWatsonxCodeAssistant} style={{ marginRight: '1rem' }}>
                View Documentation
              </Button>
              <Button kind="secondary" href="#" renderIcon={IbmKnowledgeCatalogPremium} style={{ marginRight: '1rem' }}>
                API Reference
              </Button>
              <Button kind="ghost" href="#">
                Join Discord
              </Button>
            </div>
            <p style={{ marginTop: '1rem' }}>
              For enterprise support and custom integration assistance, contact our support team
              at support@Expert_Guide.com
            </p>
          </Tile>
        </div>
      </div>
    </div>
  );
}

export default ForDevelopers;
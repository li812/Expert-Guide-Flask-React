import React, { useState } from 'react';
import {
  Grid,
  Column,
  Tile,
  Button,
  InlineNotification,
  TextInput,
  FileUploader,
  Form,
  Stack,
  ProgressIndicator,
  ProgressStep,
  Tooltip,
  Tag,
  CodeSnippet
} from '@carbon/react';
import {
  Add,
  Download,
  Information,
  ArrowRight,
  Reset
} from '@carbon/icons-react';

const DeveloperGenerateAPI = ({ username }) => {
  const [step, setStep] = useState(1);
  const [newApi, setNewApi] = useState({ 
    apiName: '', 
    websiteApp: '', 
    logo: null 
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [generatedApi, setGeneratedApi] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewApi(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        setError('File size should be less than 500KB');
        return;
      }
      setNewApi(prev => ({ ...prev, logo: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setNewApi({ apiName: '', websiteApp: '', logo: null });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    setGeneratedApi(null);
    setStep(1);
  };

  const validateForm = () => {
    if (!newApi.apiName.trim()) {
      setError('API Name is required');
      return false;
    }
    if (!newApi.websiteApp.trim()) {
      setError('Website/App Name is required');
      return false;
    }
    if (!newApi.logo) {
      setError('Logo is required');
      return false;
    }
    return true;
  };

  const handleGenerateApi = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('apiName', newApi.apiName);
      formData.append('websiteApp', newApi.websiteApp);
      formData.append('logo', newApi.logo);

      const response = await fetch('http://localhost:5001/api/developer/generate-api', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedApi(data);
      setSuccess('API generated successfully!');
      setStep(3);
    } catch (error) {
      console.error('Error generating API:', error);
      setError('Error generating API. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCredentials = () => {
    if (!generatedApi) return;
    
    const credentials = {
      api_key: generatedApi.api_key,
      api_name: generatedApi.api_name,
      website_app: generatedApi.website_app,
      created_at: generatedApi.created_at
    };

    const blob = new Blob([JSON.stringify(credentials, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api_credentials_${credentials.api_name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Grid className="dashboard">
      {/* Progress Steps */}
      <Column lg={16} md={8} sm={4}>
        <ProgressIndicator currentIndex={step - 1}>
          <ProgressStep
            label="Enter Details"
            description="API and website information"
          />
          <ProgressStep
            label="Review"
            description="Verify your information"
          />
          <ProgressStep
            label="Complete"
            description="Get your API credentials"
          />
        </ProgressIndicator>

        <Tile className="generate-api-tile">
          {/* Step 1: Enter Details */}
          {step === 1 && (
            <>
              <h2>Create New API</h2>
              <p className="subtitle">Enter the details for your new API integration</p>
              
              <Form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <Stack gap={7}>
                  <TextInput
                    id="apiName"
                    name="apiName"
                    labelText="API Name"
                    helperText="A unique name for your API integration"
                    value={newApi.apiName}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <TextInput
                    id="websiteApp"
                    name="websiteApp"
                    labelText="Website/App Name"
                    helperText="The name of your website or application"
                    value={newApi.websiteApp}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <FileUploader
                    accept={['.jpg', '.png', '.jpeg']}
                    buttonKind="primary"
                    filenameStatus="edit"
                    iconDescription="Clear file"
                    labelDescription="Only .jpg and .png files. 500kb max file size."
                    labelTitle="Upload Logo"
                    onChange={handleFileChange}
                    required
                  />
                  
                  {previewUrl && (
                    <div className="logo-preview">
                      <p>Logo Preview:</p>
                      <img 
                        src={previewUrl} 
                        alt="Logo preview" 
                        className="preview-image"
                      />
                    </div>
                  )}

                  <div className="button-group">
                    <Button 
                      kind="primary" 
                      type="submit"
                      renderIcon={ArrowRight}
                      disabled={!newApi.apiName || !newApi.websiteApp || !newApi.logo}
                    >
                      Review Details
                    </Button>
                    <Button 
                      kind="ghost" 
                      onClick={handleReset}
                      renderIcon={Reset}
                    >
                      Reset Form
                    </Button>
                  </div>
                </Stack>
              </Form>
            </>
          )}

          {/* Step 2: Review Details */}
          {step === 2 && (
            <>
              <h2>Review Details</h2>
              <p className="subtitle">Please verify your information before generating the API</p>
              
              <div className="review-details">
                <Stack gap={5}>
                  <div className="review-item">
                    <h4>API Name</h4>
                    <p>{newApi.apiName}</p>
                  </div>
                  
                  <div className="review-item">
                    <h4>Website/App Name</h4>
                    <p>{newApi.websiteApp}</p>
                  </div>
                  
                  <div className="review-item">
                    <h4>Logo</h4>
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Logo preview" 
                        className="preview-image"
                      />
                    )}
                  </div>

                  <div className="button-group">
                    <Button 
                      kind="primary" 
                      onClick={handleGenerateApi}
                      renderIcon={Add}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Generating...' : 'Generate API'}
                    </Button>
                    <Button 
                      kind="secondary" 
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      Back to Edit
                    </Button>
                  </div>
                </Stack>
              </div>
            </>
          )}

          {/* Step 3: Complete */}
          {step === 3 && generatedApi && (
            <>
              <h2>API Generated Successfully!</h2>
              <p className="subtitle">Your API has been created. Keep your API credentials safe.</p>
              
              <div className="api-credentials">
                <Stack gap={7}>
                  <div className="credential-item">
                    <h4>API Key</h4>
                    <CodeSnippet type="single" feedback="Copied to clipboard">
                      {generatedApi.api_key}
                    </CodeSnippet>
                  </div>

                  <div className="credential-item">
                    <h4>Status</h4>
                    <Tag type="green">Active</Tag>
                  </div>

                  <div className="button-group">
                    <Tooltip align="top" label="Download API credentials">
                      <Button 
                        kind="primary" 
                        renderIcon={Download}
                        onClick={handleDownloadCredentials}
                      >
                        Download Credentials
                      </Button>
                    </Tooltip>
                    <Button 
                      kind="ghost" 
                      renderIcon={Add}
                      onClick={handleReset}
                    >
                      Generate Another API
                    </Button>
                  </div>
                </Stack>
              </div>
            </>
          )}
        </Tile>

        {/* Notifications */}
        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            onCloseButtonClick={() => setError(null)}
          />
        )}
        
        {success && (
          <InlineNotification
            kind="success"
            title="Success"
            subtitle={success}
            onCloseButtonClick={() => setSuccess(null)}
          />
        )}
      </Column>
    </Grid>
  );
};

export default DeveloperGenerateAPI;
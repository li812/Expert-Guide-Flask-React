import React, { useState } from 'react';
import { 
  Grid, 
  Column, 
  Tile, 
  TextInput, 
  TextArea, 
  Button, 
  InlineNotification, 
  Form, 
  Stack,
  ProgressIndicator,
  ProgressStep,
  Tag,
  CodeSnippet 
} from '@carbon/react';
import { Email, ArrowRight, Reset, Send } from '@carbon/icons-react';

const UserSendComplaints = () => {
  const [step, setStep] = useState(1);
  const [complaint, setComplaint] = useState({ subject: '', message: '' });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setComplaint(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setComplaint({ subject: '', message: '' });
    setError(null);
    setSuccessMessage(null);
    setStep(1);
  };

  const validateForm = () => {
    if (!complaint.subject.trim()) {
      setError('Subject is required');
      return false;
    }
    if (!complaint.message.trim()) {
      setError('Message is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/user/complaints', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaint),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setSubmittedComplaint(data.complaint);
      setSuccessMessage('Complaint sent successfully!');
      setStep(3);
    } catch (error) {
      console.error('Error sending complaint:', error);
      setError('Error sending complaint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid className="dashboard">
      <Column lg={16} md={8} sm={4}>
        <ProgressIndicator currentIndex={step - 1}>
          <ProgressStep
            label="Write Complaint"
            description="Enter complaint details"
          />
          <ProgressStep
            label="Review"
            description="Verify your complaint"
          />
          <ProgressStep
            label="Complete"
            description="Complaint submitted"
          />
        </ProgressIndicator>

        <Tile className="generate-api-tile">
          {/* Step 1: Write Complaint */}
          {step === 1 && (
            <>
              <h2>Send a Complaint</h2>
              <p className="subtitle">Please provide the details of your complaint</p>
              
              <Form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <Stack gap={7}>
                  <TextInput
                    id="subject"
                    name="subject"
                    labelText="Subject"
                    helperText="Brief description of the issue"
                    value={complaint.subject}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <TextArea
                    id="message"
                    name="message"
                    labelText="Message"
                    helperText="Detailed explanation of your complaint"
                    value={complaint.message}
                    onChange={handleInputChange}
                    required
                  />

                  <div className="button-group">
                    <Button 
                      kind="primary" 
                      type="submit"
                      renderIcon={ArrowRight}
                      disabled={!complaint.subject || !complaint.message}
                    >
                      Review Complaint
                    </Button>
                    <Button 
                      kind="ghost" 
                      onClick={handleReset}
                      renderIcon={Reset}
                    >
                      Clear Form
                    </Button>
                  </div>
                </Stack>
              </Form>
            </>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <>
              <h2>Review Complaint</h2>
              <p className="subtitle">Please review your complaint before submitting</p>
              
              <div className="review-details">
                <Stack gap={5}>
                  <div className="review-item">
                    <h4>Subject</h4>
                    <p>{complaint.subject}</p>
                  </div>
                  
                  <div className="review-item">
                    <h4>Message</h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{complaint.message}</p>
                  </div>

                  <div className="button-group">
                    <Button 
                      kind="primary" 
                      onClick={handleSubmit}
                      renderIcon={Send}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Submit Complaint'}
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
          {step === 3 && submittedComplaint && (
            <>
              <h2>Complaint Submitted Successfully!</h2>
              <p className="subtitle">Your complaint has been sent. We'll review it shortly.</p>
              
              <div className="complaint-details">
                <Stack gap={7}>
                  <div className="credential-item">
                    <h4>Complaint ID</h4>
                    <CodeSnippet type="single">
                      {submittedComplaint.id}
                    </CodeSnippet>
                  </div>

                  <div className="credential-item">
                    <h4>Status</h4>
                    <Tag type="blue">Pending Review</Tag>
                  </div>

                  <div className="button-group">
                    <Button 
                      kind="ghost" 
                      renderIcon={Email}
                      onClick={handleReset}
                    >
                      Send Another Complaint
                    </Button>
                  </div>
                </Stack>
              </div>
            </>
          )}
        </Tile>

        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            onCloseButtonClick={() => setError(null)}
          />
        )}
        
        {successMessage && (
          <InlineNotification
            kind="success"
            title="Success"
            subtitle={successMessage}
            onCloseButtonClick={() => setSuccessMessage(null)}
          />
        )}
      </Column>
    </Grid>
  );
};

export default UserSendComplaints;
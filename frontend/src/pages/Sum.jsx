import React, { useState } from 'react';
import { TextInput, Button, Stack, InlineLoading, Form, Grid, Column, InlineNotification } from '@carbon/react';

function Sum() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateSum = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/calculate-sum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ num1: parseFloat(num1), num2: parseFloat(num2) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to calculate sum');
      setResult(data.result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid className="bx--grid--full-width">
      <Column lg={8} md={4} sm={2}>
        <h1>Sum Calculator</h1>
        <Form onSubmit={calculateSum}>
          <Stack gap={7}>
            <TextInput
              id="num1"
              type="number"
              labelText="1st Number"
              value={num1}
              onChange={(e) => setNum1(e.target.value)}
              required
            />
            <TextInput
              id="num2"
              type="number"
              labelText="2nd Number"
              value={num2}
              onChange={(e) => setNum2(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              Calculate Sum
            </Button>
            {loading && <InlineLoading description="Calculating..." />}
            {error && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                onCloseButtonClick={() => setError('')}
              />
            )}
            {result !== null && !loading && !error && (
              <InlineNotification
                kind="success"
                title="Result"
                subtitle={`The sum is: ${result}`}
                onCloseButtonClick={() => setResult(null)}
              />
            )}
          </Stack>
        </Form>
      </Column>
    </Grid>
  );
}

export default Sum;
import React, { useState, useEffect } from 'react';
import {
    Grid,
    Column,
    Tile,
    ProgressIndicator,
    ProgressStep,
    RadioButtonGroup,
    RadioButton,
    Button,
    Loading,
    InlineNotification
} from '@carbon/react';
import { ArrowRight, ArrowLeft, Send } from '@carbon/icons-react';

const UserCareerAssessment = () => {
    const [step, setStep] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/assessment/questions', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch questions');
            const data = await response.json();
            setQuestions(data.questions);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleAnswer = (value) => {
        setAnswers({
            ...answers,
            [questions[currentQuestion].id]: {
                text: questions[currentQuestion].text,
                answer: value
            }
        });
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:5001/api/assessment/submit', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answers })
            });

            if (!response.ok) throw new Error('Failed to submit assessment');
            
            const data = await response.json();
            setResult(data.career);
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 1: // Introduction
                return (
                    <div className="intro-section">
                        <h2>Career Assessment</h2>
                        <p>Answer {questions.length} questions to discover your ideal career path.</p>
                        <Button onClick={() => setStep(2)}>Start Assessment</Button>
                    </div>
                );
                
            case 2: // Questions
                return (
                    <div className="question-section">
                        <ProgressIndicator currentIndex={currentQuestion}>
                            {questions.map((_, index) => (
                                <ProgressStep 
                                    key={index}
                                    label={`Question ${index + 1}`}
                                    description={`${Math.round(((index + 1) / questions.length) * 100)}%`}
                                    secondaryLabel={index === currentQuestion ? "Current" : ""}
                                />
                            ))}
                        </ProgressIndicator>
                        
                        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                            <h3>Question {currentQuestion + 1}</h3>
                            <p>{questions[currentQuestion]?.text}</p>
                        </div>
                        
                        <RadioButtonGroup
                            legendText="Your Answer"
                            name={`question-${currentQuestion}`}
                            valueSelected={answers[questions[currentQuestion]?.id]?.answer}
                            onChange={handleAnswer}
                        >
                            <RadioButton labelText="High" value="High" id="high" />
                            <RadioButton labelText="Yes" value="Yes" id="yes" />
                            <RadioButton labelText="Low" value="Low" id="low" />
                            <RadioButton labelText="No" value="No" id="no" />
                        </RadioButtonGroup>
                        
                        <div className="button-group" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <Button
                                kind="secondary"
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                renderIcon={ArrowLeft}
                            >
                                Previous
                            </Button>
                            
                            {currentQuestion === questions.length - 1 ? (
                                <Button 
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    renderIcon={Send}
                                >
                                    {submitting ? 'Processing...' : 'Submit'}
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleNext}
                                    disabled={!answers[questions[currentQuestion]?.id]}
                                    renderIcon={ArrowRight}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                );
                
            case 3: // Results
                return (
                    <div className="result-section">
                        <h2>Your Recommended Career Path</h2>
                        <h3>{result}</h3>
                        <div style={{ marginTop: '2rem' }}>
                            <Button onClick={() => window.location.reload()}>
                                Take Assessment Again
                            </Button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) return <Loading />;
    if (error) return <InlineNotification kind="error" title="Error" subtitle={error} />;

    return (
        <Grid>
            <Column lg={16} md={8} sm={4}>
                <Tile>{renderContent()}</Tile>
            </Column>
        </Grid>
    );
};

export default UserCareerAssessment;
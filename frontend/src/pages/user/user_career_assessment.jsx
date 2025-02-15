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
    InlineNotification,
    Stack,
    Tag,
    AspectRatio
} from '@carbon/react';
import {
    ArrowRight,
    ArrowLeft,
    Send,
    ScisTransparentSupply,
    CheckmarkOutline,
    Development,
    Education,
    Result,
    Analytics,
    ResetAlt, ThumbsUpDouble, ThumbsUp, ThumbsDown, CloseOutline,AiGenerate
} from '@carbon/icons-react';
import {
    PredictiveAnalytics,
    ChartMultiType
} from '@carbon/pictograms-react';

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

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem',
        },
        header: {
            marginBottom: '2rem',
            textAlign: 'center',
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '400',
            // Using Carbon theme tokens for colors
            color: 'var(--cds-text-primary)',
            marginBottom: '1rem',
        },
        subtitle: {
            fontSize: '1.25rem',
            color: 'var(--cds-text-secondary)',
            maxWidth: '800px',
            margin: '0 auto',
        },
        introSection: {
            textAlign: 'center',
            padding: '3rem 0',
            backgroundColor: 'var(--cds-layer-01)',
            borderRadius: '8px',
        },
        introPictogram: {
            marginBottom: '2rem',
            color: 'var(--cds-icon-primary)', // Theme-aware icon color
        },
        stepTile: {
            height: '100%',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--cds-layer-02)',
            border: '1px solid var(--cds-border-subtle)',
            borderRadius: '8px',
            transition: 'transform 0.2s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 'var(--cds-shadow-hover)',
            }
        },
        questionSection: {
            padding: '2rem',
            position: 'relative',
            backgroundColor: 'var(--cds-layer-01)',
            borderRadius: '8px',
        },
        progressWrapper: {
            marginBottom: '3rem',
            padding: '1rem',
            backgroundColor: 'var(--cds-layer-02)',
            borderRadius: '8px',
        },
        questionCard: {
            padding: '2rem',
            backgroundColor: 'var(--cds-layer-02)',
            border: '1px solid var(--cds-border-subtle)',
            borderRadius: '8px',
            marginBottom: '2rem',
            boxShadow: 'var(--cds-shadow)',
        },
        resultSection: {
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'var(--cds-layer-01)',
            borderRadius: '8px',
        },
        resultCard: {
            padding: '3rem',
            backgroundColor: 'var(--cds-layer-02)',
            border: '1px solid var(--cds-border-subtle)',
            borderRadius: '8px',
            marginTop: '2rem',
            boxShadow: 'var(--cds-shadow)',
        },
        careerTitle: {
            fontSize: '2rem',
            color: 'var(--cds-text-primary)',
            marginBottom: '1rem',
        },
        questionText: {
            color: 'var(--cds-text-primary)',
            fontSize: '1.5rem',
            marginBottom: '2rem',
        },
        radioGroup: {
            backgroundColor: 'var(--cds-layer-03)',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--cds-border-subtle)',
        },
        buttonGroup: {
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between',
            marginTop: '2rem',
        },
        successIcon: {
            color: 'var(--cds-support-success)',
            marginBottom: '1rem',
        }
    };

    // Add this CSS to your user.css file
    const cssToAdd = `
        .assessment-tile {
            background-color: var(--cds-layer-01) !important;
            border: 1px solid var(--cds-border-subtle);
            transition: all 0.3s ease;
        }

        .assessment-tile:hover {
            transform: translateY(-4px);
            box-shadow: var(--cds-shadow-hover);
        }

        .radio-button-wrapper {
            margin: 1rem 0;
            padding: 1rem;
            border-radius: 4px;
            background-color: var(--cds-layer-02);
            border: 1px solid var(--cds-border-subtle);
            transition: all 0.2s ease;
        }

        .radio-button-wrapper:hover {
            background-color: var(--cds-layer-hover);
        }

        .progress-indicator-wrapper {
            padding: 1rem;
            background-color: var(--cds-layer-02);
            border-radius: 8px;
            margin-bottom: 2rem;
        }
    `;

    // Update the render methods to use the new styles
    const renderIntroContent = () => (
        <div className="intro-section">
            <PredictiveAnalytics className="intro-pictogram" />

            <h1 className="title">Discover Your Ideal Career Path</h1>
            <br></br><br></br>
            <p className="subtitle">
                Our AI-powered assessment analyzes your responses to {questions.length} carefully crafted questions
                to provide personalized career recommendations.
            </p>

            <br></br><br></br>

            <Grid narrow className="landing-grid">
                <Column sm={6} md={4} lg={5}>
                    <Tile className="step-tile">
                        <Development size={32} />
                        <h3>Answer Questions</h3>
                        <p>Share your interests, skills, and preferences through our interactive assessment</p>
                    </Tile>
                </Column>
                <Column sm={6} md={4} lg={5}>
                    <Tile className="step-tile">
                        <Analytics size={32} />
                        <h3>AI Analysis</h3>
                        <p>Our advanced AI processes your responses using deep learning algorithms</p>
                    </Tile>
                </Column>
                <Column sm={6} md={4} lg={5}>
                    <Tile className="step-tile">
                        <ScisTransparentSupply size={32} />
                        <h3>Get Guidance</h3>
                        <p>Receive a tailored career recommendation aligned with your profile</p>
                    </Tile>
                </Column>
            </Grid>

            <Button

                className="start-button"
                onClick={() => setStep(2)}
                style={{ marginTop: '3rem' }}

                renderIcon={ArrowRight}
            >
                Begin Assessment
            </Button>
        </div>
    );

    const renderQuestionContent = () => (
        <div className="question-section">
            <div className="question-card">
                <Stack gap={7}>
                    <div>
                        <Tag type="blue" size="sm">Question {currentQuestion + 1} of {questions.length}</Tag>
                        <h2 className="question-text">
                            <br></br>
                            {questions[currentQuestion]?.text}
                        </h2>
                    </div>

                    <div className="answer-buttons">
                        <Grid>
                            {[
                                { value: 'High', label: 'High', icon: ThumbsUpDouble },
                                { value: 'Yes', label: 'Yes', icon: ThumbsUp },
                                { value: 'Low', label: 'Low', icon: ThumbsDown },
                                { value: 'No', label: 'No', icon: CloseOutline }
                            ].map((option) => (
                                <Column sm={10} md={3} lg={3} key={option.value}>
                                    <Button
                                        className={`answer-button ${answers[questions[currentQuestion]?.id]?.answer === option.value ? 'selected' : ''}`}
                                        onClick={() => handleAnswer(option.value)}
                                        kind={answers[questions[currentQuestion]?.id]?.answer === option.value ? 'primary' : 'tertiary'}
                                        size="lg"
                                        renderIcon={option.icon}
                                        style={{ width: '100%' }}
                                    >
                                        {option.label}
                                    </Button>
                                </Column>
                            ))}
                        </Grid>
                    </div>

                    <div className="button-group">
                        <Button
                            kind="secondary"
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            renderIcon={ArrowLeft}
                            size="lg"
                        >
                            Previous
                        </Button>

                        {currentQuestion === questions.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                renderIcon={Send}
                                size="lg"
                                kind="primary"
                            >
                                {submitting ? 'Analyzing Responses...' : 'Get Career Recommendation'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={!answers[questions[currentQuestion]?.id]}
                                renderIcon={ArrowRight}
                                size="lg"
                                kind="primary"
                            >
                                Next Question
                            </Button>
                        )}
                    </div>
                </Stack>
            </div>
        </div>
    );

    const renderResultContent = () => (
        <div className="result-section">
            <CheckmarkOutline size={64} className="success-icon" />
            <h1>Assessment Complete!</h1>

            <div className="result-card">
                <Result size={32} />
                <h2>Recommended Career Path</h2>
                
                {/* Updated grid container */}
                <Grid style={{ 
                    width: '100%',
                    maxWidth: '800px',
                    margin: '2rem auto'
                }}>
                    <Column sm={4} md={8} lg={16}>
                    
                        <Tile className="result-tile" style={{
                            padding: '2rem',
                            backgroundColor: 'var(--cds-layer-02)',
                            border: '1px solid var(--cds-border-subtle)',
                            borderRadius: '8px',
                            transition: 'transform 0.3s ease',
                        }}>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem'
                            }}>
                                
                                <h3 style={{
                                    fontSize: '1.75rem',
                                    color: 'var(--cds-text-primary)',
                                    margin: 0
                                }}>{result}</h3>
                            </div>
                        </Tile>
                    </Column>
                </Grid>

                <Button
                    size="lg"
                    onClick={() => window.location.reload()}
                    kind="primary"
                    renderIcon={ResetAlt}
                    style={{ marginTop: '2rem' }}
                >
                    Take Assessment Again
                </Button>
            </div>
        </div>
    );

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <Loading description="Loading assessment questions..." withOverlay={false} />
        </div>
    );

    if (error) return (
        <div style={{ padding: '2rem' }}>
            <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                hideCloseButton={false}
            />
        </div>
    );

    return (
        <div className="career-assessment">
            <Grid style={{ margin: '3rem 0' }}>  {/* Replace br tags with proper margin */}
                <Column lg={15} md={8} sm={4}>
                    <Tile style={{
                        borderRadius: '12px',
                        backgroundColor: 'var(--cds-layer-01)',
                        border: '1px solid var(--cds-border-subtle)',
                        padding: '2rem'
                    }}>
                        {step === 1 && renderIntroContent()}
                        {step === 2 && renderQuestionContent()}
                        {step === 3 && renderResultContent()}
                    </Tile>
                </Column>
            </Grid>
        </div>
    );
};

export default UserCareerAssessment;
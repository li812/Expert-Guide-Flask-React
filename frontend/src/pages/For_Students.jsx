import React, { useState, useEffect } from "react";
import {
  Grid,
  Column,
  Tile,
  AspectRatio,
  Button,
  Stack,
  Tag,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  ProgressBar,
} from "@carbon/react";
import {
  ArrowRight,
  CheckmarkFilled,
  Education,
  Report,
  Chat,
  Calendar,
  Certificate,
  ChartBubblePacked,
  FaceSatisfied,
} from "@carbon/icons-react";
import {
  Touch,
  DataBackup,
  MachineLearning_01,
  UserAnalytics,
} from "@carbon/pictograms-react";
import careerStudent from "../assets/student_career.png";
import "./For_Students.css";

function ForStudents() {
  const [metrics, setMetrics] = useState({
    students_guided: 0,
    career_paths: 0,
    success_rate: 0,
    daily_users: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/success-metrics');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(err.message);
      }
    };

    fetchMetrics();
  }, []);

  const features = [
    {
      icon: <MachineLearning_01 size={48} />,
      title: "AI-Powered Assessment",
      description:
        "Take our 30-question deep learning assessment powered by TensorFlow to uncover your ideal career path based on your unique strengths and interests.",
      benefits: ["Personalized insights", "Data-driven recommendations", "Detailed reports"],
      stats: { accuracy: 95, users: "50,000+" }
    },
    {
      icon: <Touch size={48} />,
      title: "24/7 AI Chat Support",
      description:
        "Get instant answers from our Gemma-powered AI chatbot, available around the clock for all your career queries and guidance needs.",
      benefits: ["Real-time guidance", "Comprehensive answers", "Always available"],
      stats: { satisfaction: 98, queries: "1M+" }
    },
    {
      icon: <DataBackup size={48} />,
      title: "Course Explorer",
      description:
        "Access our curated database of 1000+ colleges and 5000+ courses, perfectly aligned with your career aspirations and assessment results.",
      benefits: ["Verified institutions", "Detailed course info", "Admission guidance"],
      stats: { colleges: 1000, courses: 5000 }
    },
    {
      icon: <UserAnalytics size={48} />,
      title: "Career Tracking",
      description:
        "Monitor your progress with our AI-driven analytics dashboard and receive personalized recommendations for skill development.",
      benefits: ["Progress tracking", "Skill mapping", "Goal setting"],
      stats: { success: 92, improvement: "85%" }
    },
  ];

  const successMetrics = [
    { label: "Students Guided", value: metrics.students_guided, icon: <FaceSatisfied size={32} /> },
    { label: "Career Paths", value: metrics.career_paths, icon: <ChartBubblePacked size={32} /> },
    { label: "Success Rate", value: metrics.success_rate, icon: <Certificate size={32} /> },
    { label: "Daily Users", value: metrics.daily_users, icon: <Calendar size={32} /> },
  ];

  return (
    <div className="bx--grid bx--grid--full-width students-page">
      {/* Hero Section */}
      <div className="bx--row hero-section">
        <div className="bx--col-lg-8">
          <Stack gap={7}>
            <h1 style={{ fontSize: "4rem", color: "#0f62fe" }}>
              Your Career Journey Starts Here
            </h1>
            <p style={{ fontSize: "1.25rem", lineHeight: "1.5" }}>
              Expert Guide combines advanced AI technology with comprehensive career
              resources to help you make informed decisions about your future. Our dual-AI
              system provides personalized guidance through deep learning assessment and
              intelligent chat support.
            </p>
            <div className="cta-buttons">
              <Button
                size="lg"
                renderIcon={ArrowRight}
                onClick={() => window.location.href = "/register-user"}
              >
                Start Free Assessment
              </Button>

            </div>
          </Stack>
        </div>
        <div className="bx--col-lg-8">
          <AspectRatio ratio="16x9">
            <img src={careerStudent} alt="Students using Expert Guide" className="hero-image" />
          </AspectRatio>
        </div>
      </div>

      {/* Success Metrics Section */}
      <div className="metrics-section">
        <Grid>
          {successMetrics.map((metric, index) => (
            <Column key={index} lg={4} md={4} sm={4}>
              <Tile className="metric-tile">
                {metric.icon}
                <h3>{metric.value.toLocaleString()}{metric.label === "Success Rate" ? "%" : ""}</h3>
                <p>{metric.label}</p>
              </Tile>
            </Column>
          ))}
        </Grid>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>
          Advanced Features for Students
        </h2>
        </div>
        <Grid>
          {features.map((feature, index) => (
            <Column key={index} lg={4} md={4} sm={4}>
              <Tile className="feature-tile">
                <div className="feature-header">
                  {feature.icon}
                  <h3>{feature.title}</h3>
                </div>
                <p>{feature.description}</p>
                <div className="feature-stats">
                  {Object.entries(feature.stats).map(([key, value]) => (
                    <div key={key} className="stat-item">
                      <ProgressBar value={typeof value === 'number' ? value : 100} />
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</span>
                    </div>
                  ))}
                </div>
                <div className="benefits-tags">
                  {feature.benefits.map((benefit, i) => (
                    <Tag key={i} type="blue">
                      <CheckmarkFilled size={16} /> {benefit}
                    </Tag>
                  ))}
                </div>
              </Tile>
            </Column>
          ))}
        </Grid>
      

      {/* CTA Section */}
      <div className="cta-section">
        <Tile>
          <Stack gap={7}>
            <h2>Ready to Start Your Journey?</h2>
            <p>
              Join thousands of students who have found their ideal career path
              with Expert Guide's AI-powered guidance.
            </p>
            <Button
              size="lg"
              renderIcon={ArrowRight}
              onClick={() => window.location.href = "/register-user"}
            >
              Begin Free Assessment
            </Button>
          </Stack>
        </Tile>
      </div>

      {/* Footer Section */}
      <div id="Footer Section">
        <footer className="footer-section">
          <Grid>
            <Column lg={4} md={4} sm={4}>
              <h4>Company</h4>
              <ul className="footer-list">
                <li>
                  <a href="/about">About Us</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
                <li>
                  <a href="/careers">Careers</a>
                </li>
              </ul>
            </Column>
            <Column lg={4} md={4} sm={4}>
              <h4>Resources</h4>
              <ul className="footer-list">
                <li>
                  <a href="/documentation">Documentation</a>
                </li>
                <li>
                  <a href="/support">Support</a>
                </li>
                <li>
                  <a href="/blog">Blog</a>
                </li>
              </ul>
            </Column>
            <Column lg={4} md={4} sm={4}>
              <h4>Legal</h4>
              <ul className="footer-list">
                <li>
                  <a href="/terms">Terms of Service</a>
                </li>
                <li>
                  <a href="/privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="/security">Security</a>
                </li>
              </ul>
            </Column>
            <Column lg={4} md={4} sm={4}>
              <h4>Follow Us</h4>
              <ul className="footer-list">
                <li>
                  <a href="https://twitter.com">Twitter</a>
                </li>
                <li>
                  <a href="https://linkedin.com">LinkedIn</a>
                </li>
                <li>
                  <a href="https://facebook.com">Facebook</a>
                </li>
              </ul>
            </Column>
          </Grid>
          <div className="footer-bottom">
            <p>© 2025 Expert Guide. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ForStudents;
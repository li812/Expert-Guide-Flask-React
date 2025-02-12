import React, { useEffect, useState } from "react";

import {
  Button,
  Tile,
  Grid,
  Column,
  AspectRatio,
  Stack,
  Link,
} from "@carbon/react";

import {
  Security,
  DataBackup,
  Integration,
  Api,
  Cloud,
  Touch,
} from "@carbon/pictograms-react";

import { ArrowRight } from "@carbon/icons-react";

import "./Home.css";
import "../index.css";
import faceScanImage from "../assets/face_scan_img/face_scan1.png";
import howWorkImage from "../assets/face_scan_img/how_work.png";
import careerHome from "../assets/consulting.png";

function Home() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div
      className="bx--grid bx--grid--full-width home-page"
      data-theme={darkMode ? "dark" : "light"}
    >
      {/* Hero Section */}
      <div id="Hero Section">
        <div className="bx--row hero-section">
          <div className="bx--col-lg-8 hero-text">
            <Stack gap={7}>
              <h1
                className="animate__animated animate__fadeInDown"
                style={{ color: "#0f62fe", fontSize: "6rem" }}
              >
                Your Future, Simplified
              </h1>
              <p
                className="animate__animated animate__fadeInDown animate__delay-1s"
                style={{ fontSize: "1.5rem" }}
              >
                Expert Guide is the ultimate AI-powered career guidance platform for Indian students after 12. Discover your ideal career path with our deep learning assessment and interactive AI chat assistant.
              </p>
              <p
                className="animate__animated animate__fadeInDown animate__delay-1s"
                style={{ fontSize: "1.25rem", lineHeight: "1.6" }}
              >
                Our innovative system asks you 30 thought-provoking questions powered by TensorFlow deep learning to pinpoint your strengths and preferences. In addition, our state-of-the-art LLM chat bot, driven by Google’s Gemma open source model, is available 24/7 to answer your career queries instantly. With curated college and course explorations, Expert Guide empowers you to make informed decisions for a bright future.
              </p>
              <div className="animate__animated animate__fadeInDown animate__delay-2s">
                <Button
                  className="arrowright-button"
                  size="lg"
                  onClick={() => (window.location.href = "/register-user")}
                >
                  <span className="button-text">Discover Your Future</span>{" "}
                  <ArrowRight className="arrow-icon" />
                </Button>
              </div>
            </Stack>
          </div>
          <div className="bx--col-lg-10 hero-image">
            {/* Hero Image */}
            <AspectRatio>
              <img src={careerHome} alt="Career Guidance" style={{ width: '120%', height: '120%' }} />
            </AspectRatio>
          </div>
        </div>
        <br />
        <br />
      </div>

      <hr style={{ opacity: 0.5 }} />

      {/* Key Features Section */}
      <div id="Key Features Section">
        <br />
        <br />
        <div className="bx--col-lg-16">
          <h2
            className="animate__animated animate__fadeInUp"
            style={{ fontSize: "3.75rem", fontWeight: 300 }}
          >
            Key Features
          </h2>
          <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
            At Expert Guide, we combine cutting-edge AI technology with expert human insights to provide a holistic career guidance experience. Every feature is designed to help you uncover your true potential and navigate the complex world of career choices.
          </p>
          <br />
          <br />
        </div>
        <div className="bx--row features-section">
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-1s">
              <Security size={48} />
              <h3>Personalized Career Assessment</h3>
              <p>
                Answer 30 in-depth questions and receive tailored career recommendations powered by advanced deep learning using TensorFlow. Our assessment identifies your unique strengths and aligns them with future career opportunities.
              </p>
            </Tile>
          </div>
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-2s">
              <DataBackup size={48} />
              <h3>Unified Guidance Experience</h3>
              <p>
                Seamlessly integrate career assessments, real-time AI chat support, and a comprehensive college and course explorer—all in one platform.
              </p>
            </Tile>
          </div>
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-1s">
              <Integration size={48} />
              <h3>Instant Career Insights</h3>
              <p>
                Get immediate, actionable career insights that match your interests and skills, ensuring you are always one step ahead in planning your future.
              </p>
            </Tile>
          </div>
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-2s">
              <Touch size={48} />
              <h3>AI Chat Guidance</h3>
              <p>
                Chat with our intelligent LLM bot powered by Google's Gemma model. Receive personalized, real-time advice on career options, entrance exams, and application processes anytime you need.
              </p>
            </Tile>
          </div>
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-1s">
              <Api size={48} />
              <h3>Cutting-Edge Technology</h3>
              <p>
                Harness the power of AI with TensorFlow-driven assessments and advanced language models, ensuring you receive recommendations based on the latest industry trends.
              </p>
            </Tile>
          </div>
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-2s">
              <Cloud size={48} />
              <h3>Explore Colleges & Courses</h3>
              <p>
                Dive into a curated database of top colleges, online courses, and career programs tailored to your selected career path. Your journey to higher education starts here.
              </p>
            </Tile>
          </div>
        </div>
      </div>
      <br />
      <br />

      <hr style={{ opacity: 0.5 }} />

      {/* How It Works Section */}
      <br />
      <br />
      <div id="HowItWorkSection">
        <div className="bx--col-lg-16">
          <h2
            className="animate__animated animate__fadeInUp"
            style={{ fontSize: "3.75rem", fontWeight: 300 }}
          >
            How It Works
          </h2>
          <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
            Our process is designed to be simple, yet powerful. Whether you're just starting your career journey or looking for expert advice to pivot into a new field, our dual-AI system is here to support you at every step.
          </p>
          <br />
          <br />
        </div>
        <div className="bx--row how-it-works-section">
          <div className="bx--col-lg-8 how-it-works-image">
            <AspectRatio ratio="16x9">
              <img src={howWorkImage} alt="How It Works" />
            </AspectRatio>
          </div>
          <div className="bx--col-lg-8 how-it-works-steps">
            <Grid>
              <Column lg={8} md={4} sm={4}>
                <h3>Career Assessment</h3>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>1</span>
                  </div>
                  <div className="step-content">
                    <h4>Take the Assessment</h4>
                    <p>
                      Answer our 30 carefully crafted questions to uncover your interests, strengths, and career aspirations.
                    </p>
                  </div>
                </Tile>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>2</span>
                  </div>
                  <div className="step-content">
                    <h4>Receive Tailored Insights</h4>
                    <p>
                      Our advanced TensorFlow model processes your answers to generate personalized career recommendations that align with your future goals.
                    </p>
                  </div>
                </Tile>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>3</span>
                  </div>
                  <div className="step-content">
                    <h4>Explore Opportunities</h4>
                    <p>
                      Browse through curated college lists and online courses that match your recommended career paths.
                    </p>
                  </div>
                </Tile>
              </Column>
              
              <Column lg={8} md={4} sm={4}>
                <h3>AI Chat Guidance</h3>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>1</span>
                  </div>
                  <div className="step-content">
                    <h4>Start a Conversation</h4>
                    <p>
                      Initiate a chat with our AI bot powered by Google's Gemma model to ask any career-related questions.
                    </p>
                  </div>
                </Tile>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>2</span>
                  </div>
                  <div className="step-content">
                    <h4>Get Real-Time Advice</h4>
                    <p>
                      Receive instant, accurate responses on everything from course selection to future job prospects.
                    </p>
                  </div>
                </Tile>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>3</span>
                  </div>
                  <div className="step-content">
                    <h4>Plan Your Next Steps</h4>
                    <p>
                      Use our AI insights to set actionable goals and design a step-by-step plan for your academic and career journey.
                    </p>
                  </div>
                </Tile>
              </Column>
            </Grid>
          </div>
        </div>
      </div>
      <br />
      <br />

      <hr style={{ opacity: 0.5 }} />

      {/* Testimonials Section */}
      <br />
      <br />
      <div id="Testimonials Section">
        <div className="bx--col-lg-16">
          <h2
            className="animate__animated animate__fadeInUp"
            style={{ fontSize: "3.75rem", fontWeight: 300 }}
          >
            What Our Students Say
          </h2>
          <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
            Hear from students who have transformed uncertainty into clarity with Expert Guide. Our blend of AI-driven insights and personalized support has empowered countless young minds to pursue their dream careers.
          </p>
          <br />
          <br />
        </div>
        <div className="bx--row testimonials-section">
          <div className="bx--col-lg-16">
            <Grid>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-1s">
                  <p>
                    "Expert Guide not only helped me find my true calling but also provided me with a clear roadmap to achieve it. The AI insights were truly transformative!"
                  </p>
                  <p>- Ravi Kumar, Student</p>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-2s">
                  <p>
                    "The personalized career assessment made me realize my strengths, and the AI chat bot was like having a mentor available 24/7. Highly recommended!"
                  </p>
                  <p>- Ananya Singh, Student</p>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-3s">
                  <p>
                    "I was overwhelmed with options, but Expert Guide helped me narrow down the perfect career path with clear, actionable advice."
                  </p>
                  <p>- Vikram Patel, Student</p>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-4s">
                  <p>
                    "The in-depth assessment report and expert guidance have completely changed my outlook on my future. I feel confident and empowered."
                  </p>
                  <p>- Priya Sharma, Student</p>
                </Tile>
              </Column>
            </Grid>
          </div>
        </div>
      </div>
      <br />
      <br />



      <hr style={{ opacity: 0.5 }} />


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

export default Home;

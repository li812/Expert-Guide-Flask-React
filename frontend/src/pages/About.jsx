// About.jsx

import React from "react";
import {
  Grid,
  Row,
  Column,
  Tile,
  AspectRatio,
  Button,
  Stack,
  Accordion,
  AccordionItem,
} from "@carbon/react";
import {
  ArrowRight,
  UserAvatarFilledAlt,
  Code,
  Add,
  LogoReact,
  LogoPython,
  LogoLinkedin,
} from "@carbon/icons-react";
import {
  Touch,
  Api,
  Carbon,
  Cloud,
  Security,
  MachineLearning_01,
  Docker,
  Kubernetes,
  Database,
  Application,
  User,
} from "@carbon/pictograms-react";
import "./About.css";
import faceScanImage from "../assets/face_scan_img/face_scan2.png";
import teamImage from "../assets/face_scan_img/face_scan1.png";
import member1Image from "../assets/team/user_dp.jpg";
import member2Image from "../assets/team/user_dp.jpg";
import member3Image from "../assets/team/user_dp.jpg";
import member4Image from "../assets/team/user_dp.jpg";
import careerHome from "../assets/consulting.png";
import careerHome2 from "../assets/consulting1.png";

function About() {
  const iconSize = 75; // Define a consistent size for all icons and pictograms

  // Features for Students (dual-AI system and integrated exploration)
  const studentFeatures = [
    {
      icon: <UserAvatarFilledAlt size={iconSize} />,
      title: "30-Question AI Assessment",
      description:
        "Answer a comprehensive set of 30 questions powered by TensorFlow deep learning to uncover your strengths and receive tailored career recommendations.",
    },
    {
      icon: <Touch size={iconSize} />,
      title: "Conversational Guidance",
      description:
        "Chat in real time with our intelligent LLM chatbot—powered by Google's Gemma model—to get instant answers to any career-related query.",
    },
    {
      icon: <Api size={iconSize} />,
      title: "Instant Career Insights",
      description:
        "Leverage advanced AI analytics to receive personalized insights that guide you toward the career path best suited for you.",
    },
    {
      icon: <Cloud size={iconSize} />,
      title: "Explore Colleges & Courses",
      description:
        "Discover a curated database of top colleges and online courses aligned with your selected career, empowering you to plan your future education.",
    },

  ];

  return (
    <div className="bx--grid bx--grid--full-width about-page">
      {/* Hero Section */}
      <div id="Hero Section">
        <br />
        <br />
        <div className="bx--row hero-section">
          <div className="bx--col-lg-8 hero-image">
            <AspectRatio ratio="1x1">
              <img src={careerHome2} alt="Expert Guide Overview" style={{ width: '120%', height: '120%' }} />
            </AspectRatio>
          </div>
          <div className="bx--col-lg-8 hero-text">
            <Stack gap={7}>
              <h1
                className="animate__animated animate__fadeInDown"
                style={{ color: "#0f62fe", fontSize: "6rem" }}
              >
                About Expert Guide
              </h1>
              <p
                className="animate__animated animate__fadeInDown animate__delay-1s"
                style={{ fontSize: "1.5rem" }}
              >
                Expert Guide is a revolutionary AI-powered career guidance platform designed exclusively for Indian students after 12. Our dual-AI system helps you discover your ideal career path and plan your future education.
              </p>
            </Stack>
          </div>
        </div>
        <br />
        <br />
      </div>

      <hr style={{ opacity: 0.5 }} />

      {/* For Students Section */}
      <div id="For Students Section">
        <br />
        <br />
        <div>
          <h2
            className="animate__animated animate__fadeInUp"
            style={{ fontSize: "3.75rem", fontWeight: 300 }}
          >
            For Students
          </h2>
          <br />
          <br />
          <div className="bx--row features-section">
            {studentFeatures.map((feature, index) => (
              <div
                className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4"
                key={index}
              >
                <Tile
                  className={`animate__animated animate__fadeInUp animate__delay-${
                    index + 1
                  }s`}
                  style={{
                    height: "250px",
                    width: "650px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: "10px",
                    margin: "10px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ marginRight: "15px" }}>{feature.icon}</div>
                  <div>
                    <h3 style={{ margin: "0 0 5px 0" }}>{feature.title}</h3>
                    <p style={{ margin: 0 }}>{feature.description}</p>
                  </div>
                </Tile>
              </div>
            ))}
          </div>
        </div>
      </div>

      <br />
      <br />

      <hr style={{ opacity: 0.5 }} />

      {/* Additional Information using IBM Carbon Accordion */}
      <div id="More Information Section" style={{ padding: "2rem 0" }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2
              className="animate__animated animate__fadeInUp"
              style={{ fontSize: "3.75rem", fontWeight: 300, textAlign: "center" }}
            >
              More About Expert Guide
            </h2>
            <Accordion>
              <AccordionItem title="Our Story">
                <p style={{ fontSize: "1.15rem", margin: "1rem 0" }}>
                  Expert Guide was born out of the desire to revolutionize career guidance for Indian students. Recognizing the challenges of making informed career decisions after 12th, we combined state-of-the-art deep learning with an intelligent conversational assistant to create a platform that truly understands your potential.
                </p>
              </AccordionItem>
              <AccordionItem title="How Our AI Works">
                <p style={{ fontSize: "1.15rem", margin: "1rem 0" }}>
                  Our dual-AI system features a 30-question assessment powered by TensorFlow deep learning that accurately identifies your strengths and recommends the best career paths. Alongside, our LLM chatbot—powered by Google’s Gemma open source model—is available 24/7 to answer any career-related queries in real time, ensuring you get comprehensive support at every step.
                </p>
              </AccordionItem>
              <AccordionItem title="Explore Colleges & Courses">
                <p style={{ fontSize: "1.15rem", margin: "1rem 0" }}>
                  With a robust college and course explorer integrated into our platform, you can seamlessly browse through top institutions and online courses tailored to your selected career. This feature is designed to help you make well-informed decisions about your higher education journey.
                </p>
              </AccordionItem>
              <AccordionItem title="Frequently Asked Questions">
                <p style={{ fontSize: "1.15rem", margin: "1rem 0" }}>
                  Find answers to common queries about how Expert Guide works, our dual-AI system, and tips on how to maximize your career guidance experience. Whether you’re wondering about the assessment process or seeking advice on course selection, our FAQ section is here to help.
                </p>
              </AccordionItem>
            </Accordion>
          </Column>
        </Grid>
      </div>

      <br />
      <br />

      <hr style={{ opacity: 0.5 }} />

      {/* Technology Stack Section */}
      <div id="Technology Stack Section">
        <br />
        <br />
        <div className="bx--col-lg-16">
          <h2
            className="animate__animated animate__fadeInUp"
            style={{ fontSize: "3.75rem", fontWeight: 300 }}
          >
            Technology Stack
          </h2>
          <br />
          <br />
        </div>
        <div className="bx--row features-section">
          {/* Backend */}
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-1s">
              <LogoPython size={iconSize} />
              <h3>Backend (Flask & Python)</h3>
              <p>
                Our robust backend, built on Flask and Python, processes AI assessments and data analytics with high performance.
              </p>
            </Tile>
          </div>
          {/* Frontend */}
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-2s">
              <LogoReact size={iconSize} /> <Add size={iconSize} /> <Carbon size={iconSize} />
              <h3>Frontend (React + Vite & IBM Carbon UI)</h3>
              <p>
                Our modern frontend framework ensures an intuitive and responsive user experience for all your career guidance needs.
              </p>
            </Tile>
          </div>
          {/* Database */}
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-3s">
              <Database size={iconSize} />
              <h3>Database (MySQL)</h3>
              <p>
                Securely managing data with MySQL allows us to efficiently store and analyze your assessment results.
              </p>
            </Tile>
          </div>
          {/* AI Assessment Engine */}
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-4s">
              <MachineLearning_01 size={iconSize} />
              <h3>AI Assessment Engine</h3>
              <p>
                Leveraging TensorFlow and deep learning, our engine analyzes your responses to provide personalized career recommendations.
              </p>
            </Tile>
          </div>
          {/* Chatbot Engine */}
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-5s">
              <Application size={iconSize} />
              <h3>Chatbot Engine</h3>
              <p>
                Our intelligent LLM chatbot, powered by Google's Gemma model, delivers real-time, context-aware career guidance.
              </p>
            </Tile>
          </div>
          {/* Containerization */}
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-6s">
              <Docker size={iconSize} />
              <h3>Containerization (Docker)</h3>
              <p>
                We use Docker to maintain consistent environments and ensure seamless deployment across our platform.
              </p>
            </Tile>
          </div>
          {/* Orchestration */}
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-7s">
              <Kubernetes size={iconSize} />
              <h3>Orchestration (Kubernetes)</h3>
              <p>
                Kubernetes orchestrates our containerized deployments, providing scalable and reliable service delivery.
              </p>
            </Tile>
          </div>
          {/* Secure Data Analytics */}
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-8s">
              <Security size={iconSize} />
              <h3>Secure Data & Analytics</h3>
              <p>
                Our platform ensures that your data is analyzed securely, offering confidential insights to guide your career decisions.
              </p>
            </Tile>
          </div>
        </div>
      </div>
      <br />
      <br />

      <hr style={{ opacity: 0.5 }} />

      {/* Testimonials Section */}
      <div id="Testimonials Section">
        <br />
        <br />
        <div className="bx--col-lg-16">
          <h2
            className="animate__animated animate__fadeInUp"
            style={{ fontSize: "3.75rem", fontWeight: 300 }}
          >
            What Our Users Say
          </h2>
          <br />
          <br />
        </div>
        <div className="bx--row testimonials-section">
          <div className="bx--col-lg-16">
            <Grid>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-1s">
                  <p>
                    "Expert Guide transformed my career journey by providing clear, personalized guidance that aligned with my passions. The AI assessment was truly eye-opening!"
                  </p>
                  <p><br></br>- Ravi Kumar, Student</p>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-2s">
                  <p>
                    "The intelligent chatbot is like having a mentor available 24/7. It answered all my queries and helped me choose the right career path."
                  </p>
                  <p><br></br>- Ananya Singh, Student</p>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-3s">
                  <p>
                    "Integrating Expert Guide into our career planning has empowered me with data-driven insights and actionable next steps."
                  </p>
                  <p><br></br>- Mike Johnson, School Counselor</p>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-4s">
                  <p>
                    "The detailed career report gave me the confidence to pursue my dream college and course. I feel well-prepared for the future."
                  </p>
                  <p><br></br>- Sarah Lee, Student</p>
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

export default About;

import React from "react";
import {
  Grid,
  Row,
  Column,
  Tile,
  AspectRatio,
  Button,
  Stack,
} from "@carbon/react";
import {
  ArrowRight,
  UserAvatarFilledAlt,
  Code,
  Add,
  LogoReact,
  LogoPython,
  LogoLinkedin, // Add this import
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

function About() {
  const iconSize = 75; // Define a consistent size for all icons and pictograms

  return (
    <div className="bx--grid bx--grid--full-width about-page">
      {/* Hero Section */}
      <div id="Hero Section">
        <br></br>
        <br></br>
        <div className="bx--row hero-section">
          <div className="bx--col-lg-8 hero-image">
            <AspectRatio ratio="1x1">
              <img src={faceScanImage} alt="Face Scan" />
            </AspectRatio>
          </div>
          <div className="bx--col-lg-8 hero-text">
            <Stack gap={7}>
              <h1
                className="animate__animated animate__fadeInDown"
                style={{ color: "#0f62fe", fontSize: "6rem" }}
              >
                About HumanID
              </h1>
              <p
                className="animate__animated animate__fadeInDown animate__delay-1s"
                style={{ fontSize: "1.5rem" }}
              >
                HumanID offers a unified authentication platform that combines
                facial recognition with traditional security measures to provide
                secure, seamless access across all your applications.
              </p>
            </Stack>
          </div>
        </div>
        <br></br>
        <br></br>
      </div>

      <hr style={{ opacity: 0.5 }} />

      {/* For Users and For Developers Section */}
      <div id="For Users and Developers Section">
        <br></br>
        <br></br>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1px 1fr",
            gap: "20px",
            display: "flex",
            alignItems: "start",
          }}
        >
          {/* For Users Section */}
          <div>
            <h2
              className="animate__animated animate__fadeInUp"
              style={{ fontSize: "3.75rem", fontWeight: 300 }}
            >
              For Users
            </h2>
            <br></br>
            <br></br>
            <div className="bx--row features-section">
              {[
                {
                  icon: <UserAvatarFilledAlt size={iconSize} />,
                  title: "Secure Authentication",
                  description:
                    "Register with your essential credentials and set up facial recognition for secure and convenient authentication.",
                },
                {
                  icon: <Touch size={iconSize} />,
                  title: "Seamless Access",
                  description:
                    "Access any integrated platform using your HumanID, ensuring a seamless and secure experience.",
                },
                {
                  icon: <Cloud size={iconSize} />,
                  title: "Cloud-Based",
                  description:
                    "Leverage cloud-based infrastructure for scalability and reliability.",
                },
                {
                  icon: <Security size={iconSize} />,
                  title: "Privacy Protection",
                  description:
                    "Your data is protected with advanced privacy measures, ensuring your personal information remains secure.",
                },
              ].map((feature, index) => (
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
                      width: "350px",
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

          {/* Vertical Line */}
          <div
            style={{
              width: "1px",
              opacity: 0.5,
              backgroundColor: "#ccc",
              height: "100%",
              margin: "0 auto",
            }}
          ></div>

          {/* For Developers Section */}
          <div>
            <h2
              className="animate__animated animate__fadeInUp"
              style={{ fontSize: "3.75rem", fontWeight: 300 }}
            >
              For Developers
            </h2>
            <br></br>
            <br></br>
            <div className="bx--row features-section">
              {[
                {
                  icon: <Code size={iconSize} />,
                  title: "Easy Integration",
                  description:
                    "Integrate HumanID API into your application with comprehensive documentation and support.",
                },
                {
                  icon: <Api size={iconSize} />,
                  title: "Robust API",
                  description:
                    "Access a robust API for seamless integration and enhanced functionality, ensuring your application is secure and reliable.",
                },
                {
                  icon: <Security size={iconSize} />,
                  title: "Advanced Security",
                  description:
                    "Utilize advanced security measures to protect user data and ensure secure authentication.",
                },
                {
                  icon: <Cloud size={iconSize} />,
                  title: "Scalable Infrastructure",
                  description:
                    "Build on a scalable infrastructure that grows with your application needs.",
                },
              ].map((feature, index) => (
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
                      width: "350px",
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
      </div>

      <br></br>
      <br></br>

      <hr style={{ opacity: 0.5 }} />

      /* Technology Stack Section */}
        <div id="Technology Stack Section">
          <br></br>
          <br></br>
          <div className="bx--col-lg-16">
            <h2
          className="animate__animated animate__fadeInUp"
          style={{ fontSize: "3.75rem", fontWeight: 300 }}
            >
          Technology Stack
            </h2>
            <br></br>
            <br></br>
          </div>
          <div className="bx--row features-section">
            <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
          <Tile className="animate__animated animate__fadeInUp animate__delay-1s">
            <LogoPython size={iconSize} />
            <h3>Backend (Flask)</h3>
            <p>
              Our robust backend infrastructure is built with Flask to deliver high performance and ensure reliable service delivery.
            </p>
          </Tile>
            </div>
            <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
          <Tile className="animate__animated animate__fadeInUp animate__delay-2s">
            <LogoReact size={iconSize} /> <Add size={iconSize} />{" "}
            <Carbon size={iconSize} />
            <h3>Frontend (React + Vite using IBM Carbon UI)</h3>
            <p>
              Our modern frontend combines React and Vite with IBM Carbon UI to create an intuitive and responsive user experience.
            </p>
          </Tile>
            </div>
            <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
          <Tile className="animate__animated animate__fadeInUp animate__delay-3s">
            <Database size={iconSize} />
            <h3>Database (MySQL)</h3>
            <p>
              We implement MySQL database technology to provide secure and efficient data management across our entire platform.
            </p>
          </Tile>
            </div>
            <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
          <Tile className="animate__animated animate__fadeInUp animate__delay-4s">
            <MachineLearning_01 size={iconSize} />
            <h3>Face Recognition Stack</h3>
            <p>
              Our advanced recognition system integrates MTCNN, TensorFlow, and face_recognition libraries for precise identification.
            </p>
          </Tile>
            </div>
            <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
          <Tile className="animate__animated animate__fadeInUp animate__delay-5s">
            <MachineLearning_01 size={iconSize} />
            <h3>MTCNN Detection</h3>
            <p>
              We leverage MTCNN technology to provide accurate and reliable face detection capabilities across diverse conditions.
            </p>
          </Tile>
            </div>
            <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
          <Tile className="animate__animated animate__fadeInUp animate__delay-6s">
            <Docker size={iconSize} />
            <h3>Docker</h3>
            <p>
              Our containerized deployment uses Docker to maintain consistent environments across development and production stages.
            </p>
          </Tile>
            </div>
            <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
          <Tile className="animate__animated animate__fadeInUp animate__delay-7s">
            <Kubernetes size={iconSize} />
            <h3>Kubernetes</h3>
            <p>
              We employ Kubernetes orchestration to ensure scalable and reliable deployment across our distributed infrastructure.
            </p>
          </Tile>
            </div>
            <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
          <Tile className="animate__animated animate__fadeInUp animate__delay-8s">
            <Security size={iconSize} />
            <h3>Advanced Facial Recognition</h3>
            <p>
              Our sophisticated facial recognition platform delivers secure and efficient authentication for all system users.
            </p>
          </Tile>
            </div>
          </div>
        </div>
        <br></br>
        <br></br>

        <hr style={{ opacity: 0.5 }} />

        {/* Testimonials Section */}
      <div id="Testimonials Section">
        <br></br>
        <br></br>
        <div className="bx--col-lg-16">
          <h2
            className="animate__animated animate__fadeInUp"
            style={{ fontSize: "3.75rem", fontWeight: 300 }}
          >
            What Our Users Say
          </h2>
          <br></br>
          <br></br>
        </div>
        <div className="bx--row testimonials-section">
          <div className="bx--col-lg-16">
            <Grid>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-1s">
                  <p>
                    "HumanID has revolutionized the way we handle
                    authentication. It's secure and easy to use!"
                  </p>
                  <p>- John Doe, CEO of TechCorp</p>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-2s">
                  <p>
                    "The facial recognition feature is a game-changer. Our users
                    love the seamless login experience."
                  </p>
                  <p>- Jane Smith, CTO of Innovate Inc.</p>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-3s">
                  <p>
                    "Integrating HumanID into our platform was a breeze. The
                    documentation is excellent."
                  </p>
                  <p>- Mike Johnson, Developer at DevWorks</p>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile className="testimonial-tile animate__animated animate__fadeInUp animate__delay-4s">
                  <p>
                    "HumanID's support team is fantastic. They helped us every
                    step of the way."
                  </p>
                  <p>- Sarah Lee, Product Manager at SoftSolutions</p>
                </Tile>
              </Column>
            </Grid>
          </div>
        </div>
      </div>
      <br></br>
      <br></br>

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
            <p>© 2025 HumanID. All rights reserved.</p>
          </div>
        </footer>
      </div>


      
    </div>
  );
}

export default About;

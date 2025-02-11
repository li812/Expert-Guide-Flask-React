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
      {/* Hero Section  */}
      <div id="Hero Section">
        <br></br>
        <br></br>
        <div className="bx--row hero-section">
          <div className="bx--col-lg-8 hero-text">
            <Stack gap={7}>
              <h1
                className="animate__animated animate__fadeInDown"
                style={{ color: "#0f62fe", fontSize: "6rem" }}
              >
                Secure Authentication Made Simple
              </h1>
              <p
                className="animate__animated animate__fadeInDown animate__delay-1s"
                style={{ fontSize: "1.5rem" }}
              >
                HumanID offers a unified authentication platform that combines
                facial recognition with traditional security measures to provide
                secure, seamless access across all your applications.
              </p>
              <div className="animate__animated animate__fadeInDown animate__delay-2s">
                <Button
                  className="arrowright-button"
                  size="lg"
                  onClick={() => (window.location.href = "/register-user")}
                >
                  <span className="button-text">Sign-in to HumanID</span>{" "}
                  <ArrowRight className="arrow-icon" />
                </Button>

                <Button
                  className="arrowright-button"
                  style={{ marginLeft: "3rem" }}
                  size="lg"
                  onClick={() => (window.location.href = "/register-developer")}
                >
                  <span className="button-text">Sign-in as Developer</span>{" "}
                  <ArrowRight className="arrow-icon" />
                </Button>
              </div>
            </Stack>
          </div>
          <div className="bx--col-lg-8 hero-image">
            {/* Hero Image */}
            <AspectRatio ratio="1x1">
              <img src={faceScanImage} alt="Face Scan" />
            </AspectRatio>
          </div>
        </div>
        <br></br>
        <br></br>
      </div>

      <hr style={{ opacity: 0.5 }} />

      {/* Key Features Section */}
      <div id="Key Features Section">
      <br></br>
      <br></br>
        <div className="bx--col-lg-16">
          <h2
            className="animate__animated animate__fadeInUp"
            style={{ fontSize: "3.75rem", fontWeight: 300 }}
          >
            Key Features{" "}
          </h2>
          <br></br>
          <br></br>
        </div>
        <div className="bx--row features-section">
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-1s">
              <Security size={48} />
              <h3>Advanced Security</h3>
              <p>
                AES encryption for data protection and bcrypt hashing for
                passwords, ensuring maximum security.
              </p>
            </Tile>
          </div>
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-2s">
              <DataBackup size={48} />
              <h3>Single Account</h3>
              <p>
                Create one secure account with facial recognition for seamless
                access across multiple platforms.
              </p>
            </Tile>
          </div>
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-1s">
              <Integration size={48} />
              <h3>Easy Integration</h3>
              <p>
                Simple API integration for third-party applications with
                comprehensive documentation.
              </p>
            </Tile>
          </div>
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-2s">
              <Touch size={48} />
              <h3>Facial Recognition</h3>
              <p>
                Utilize advanced facial recognition technology for secure and
                convenient authentication.
              </p>
            </Tile>
          </div>
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-1s">
              <Api size={48} />
              <h3>Robust API</h3>
              <p>
                Access a robust API for seamless integration and enhanced
                functionality.
              </p>
            </Tile>
          </div>
          <div className="bx--col-lg-8 bx--col-md-4 bx--col-sm-4">
            <Tile className="animate__animated animate__fadeInUp animate__delay-2s">
              <Cloud size={48} />
              <h3>Cloud-Based</h3>
              <p>
                Leverage cloud-based infrastructure for scalability and
                reliability.
              </p>
            </Tile>
          </div>
        </div>
      </div>
      <br></br>
      <br></br>

      <hr style={{ opacity: 0.5 }} />

      {/* How It Works Section */}
      <br></br>
      <br></br>
      <div id="HowItWorkSection">
        <div className="bx--col-lg-16">
          <h2
            className="animate__animated animate__fadeInUp"
            style={{ fontSize: "3.75rem", fontWeight: 300 }}
          >
            How It Works{" "}
          </h2>
          <br></br>
          <br></br>
        </div>
        <div className="bx--row how-it-works-section">
          <div className="bx--col-lg-8 how-it-works-image">
            <AspectRatio ratio="16x9">
              <img
                src={howWorkImage}
                alt="How It Works"
              />
            </AspectRatio>
          </div>
          <div className="bx--col-lg-8 how-it-works-steps">
            <Grid>
              <Column lg={8} md={4} sm={4}>
                <h3>For Users</h3>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>1</span>
                  </div>
                  <div className="step-content">
                    <h4>Register</h4>
                    <p>
                      Register with your essential credentials and set up facial
                      recognition.
                    </p>
                  </div>
                </Tile>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>2</span>
                  </div>
                  <div className="step-content">
                    <h4>Access</h4>
                    <p>Access any integrated platform using your HumanID.</p>
                  </div>
                </Tile>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>3</span>
                  </div>
                  <div className="step-content">
                    <h4>Verify</h4>
                    <p>
                      Verify your identity quickly through facial recognition
                      for secure access.
                    </p>
                  </div>
                </Tile>
              </Column>
              
              <Column lg={8} md={4} sm={4}>
                <h3>For Developers</h3>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>1</span>
                  </div>
                  <div className="step-content">
                    <h4>Get API Key</h4>
                    <p>Register as a developer and get your API key.</p>
                  </div>
                </Tile>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>2</span>
                  </div>
                  <div className="step-content">
                    <h4>Integrate</h4>
                    <p>Integrate HumanID API into your application.</p>
                  </div>
                </Tile>
                <Tile className="step-tile">
                  <div className="step-icon">
                    <span>3</span>
                  </div>
                  <div className="step-content">
                    <h4>Deploy</h4>
                    <p>Deploy your application with HumanID authentication.</p>
                  </div>
                </Tile>
              </Column>
            </Grid>
          </div>
        </div>
      </div>
      <br></br>
      <br></br>

      <hr style={{ opacity: 0.5 }} />

      {/* Testimonials Section */}
      <br></br>
      <br></br>
      <div id="Testimonials Section">
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
      <br></br>
      <br></br>
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

export default Home;

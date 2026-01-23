import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Navbar,
  Nav,
  Card,
} from "react-bootstrap";
import "./Landingpage.css";
import logo from "../../assets/logo.jpg";
import RegisterModal from "../../components/RegisterModal/RegisterModal";
import LoginModal from "../../components/LoginModal/LoginModal";
import AdminUserManualModal from "../../components/AdminUserManualModal/AdminUserManualModal";
import StudentUserManualModal from "../../components/StudentUserManualModal/StudentsuserManualModal";

function Landingpage() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminManual, setShowAdminManual] = useState(false);
  const [showStudentManual, setShowStudentManual] = useState(false);

  const handleClose = () => setShowRegisterModal(false);
  const handleShow = () => setShowRegisterModal(true);

  useEffect(() => {
    const sections = document.querySelectorAll(".fade-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          } else {
            entry.target.classList.remove("show");
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -120px 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* ------------------- NAVBAR ------------------- */}
      <Navbar expand="lg" className="custom-navbar px-4">
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <img
            src={logo}
            alt="Logo"
            width="40"
            height="40"
            className="d-inline-block align-top rounded-circle me-2"
          />
          <span className="d-none d-md-inline">
            IoT Activity Record Attendance(ARA) System using Biometric
          </span>
          <span className="d-inline d-md-none">ARA System</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#about">About</Nav.Link>
            <Nav.Link href="#documentation">Documentation</Nav.Link>
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#contact">Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* ------------------- HERO SECTION ------------------- */}
      <div className="hero-section" id="hero">
        <Container>
          <Row className="justify-content-center align-items-center text-center">
            <Col xs={12} lg={10} xl={8} className="hero-content fade-section">
              <h1 className="hero-title fw-bold mb-4">
                IoT Activity Record Attendance (ARA) System using{" "}
                <span className="hero-primary">Biometric</span>
              </h1>

              <p className="lead mb-4 px-3">
                A simple and secure way to manage student attendance
                efficiently.
              </p>

              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
                <Button
                  className="btn-login"
                  size="lg"
                  onClick={() => setShowLogin(true)}>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </Button>

                <Button className="btn-register" size="lg" onClick={handleShow}>
                  <i className="bi bi-person-plus-fill me-2"></i> Register
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ------------------- ABOUT SECTION ------------------- */}
      <section id="about" className="py-5 bg-white fade-section">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <div className="mb-4">
                <i className="bi bi-info-circle-fill text-primary fs-1"></i>
              </div>
              <h2 className="fw-bold mb-3">About ARA System</h2>
              <p className="lead text-muted">
                Revolutionizing attendance management through cutting-edge
                biometric technology
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={6} lg={3} className="fade-up fade-delay-1">
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-fingerprint text-primary fs-1"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Biometric Security</h5>
                  <p className="text-muted small">
                    Advanced fingerprint recognition ensures accurate student
                    identification and prevents proxy attendance.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="fade-up fade-delay-2">
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-clock-history text-success fs-1"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Real-Time Tracking</h5>
                  <p className="text-muted small">
                    Monitor attendance instantly with real-time data
                    synchronization and automated reporting.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="fade-up fade-delay-3">
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-graph-up-arrow text-info fs-1"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Analytics Dashboard</h5>
                  <p className="text-muted small">
                    Comprehensive insights and visualizations to track
                    attendance patterns and trends.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="fade-up fade-delay-4">
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-shield-check text-warning fs-1"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Data Privacy</h5>
                  <p className="text-muted small">
                    Your data is encrypted and secure, complying with privacy
                    standards and regulations.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ------------------- FEATURES SECTION ------------------- */}
      <section id="features" className="py-5 bg-light fade-section">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <div className="mb-4">
                <i className="bi bi-stars text-primary fs-1"></i>
              </div>
              <h2 className="fw-bold mb-3">Key Features</h2>
              <p className="lead text-muted">
                Everything you need for seamless attendance management
              </p>
            </Col>
          </Row>
          <Row className="g-4 align-items-center">
            <Col lg={6}>
              <div className="pe-lg-4">
                <div className="mb-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="me-3">
                      <i className="bi bi-check2-circle text-primary fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">Quick Check-In/Out</h5>
                      <p className="text-muted small mb-0">
                        Students can mark attendance in seconds using biometric
                        sensors with instant verification.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="me-3">
                      <i className="bi bi-bell text-success fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">Automated Notifications</h5>
                      <p className="text-muted small mb-0">
                        Receive alerts for late arrivals, absences, and
                        important attendance updates.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="me-3">
                      <i className="bi bi-file-earmark-bar-graph text-info fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">Detailed Reports</h5>
                      <p className="text-muted small mb-0">
                        Generate comprehensive attendance reports for
                        individuals, classes, or entire programs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="ps-lg-4">
                <div className="mb-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="me-3">
                      <i className="bi bi-people text-warning fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">Multi-User Access</h5>
                      <p className="text-muted small mb-0">
                        Role-based access for students, faculty, and
                        administrators with customized permissions.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="me-3">
                      <i className="bi bi-cloud-check text-danger fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">Cloud-Based System</h5>
                      <p className="text-muted small mb-0">
                        Access your attendance data anywhere, anytime with
                        secure cloud storage.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="me-3">
                      <i className="bi bi-download text-secondary fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">Export & Integration</h5>
                      <p className="text-muted small mb-0">
                        Export data to Excel, PDF, or integrate with existing
                        school management systems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ------------------- DOCUMENTATION SECTION ------------------- */}
      <section id="documentation" className="py-5 bg-white fade-section">
        <Container>
          {/* Header */}
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <div className="mb-4">
                <i className="bi bi-book-fill text-primary fs-1"></i>
              </div>
              <h2 className="fw-bold mb-3">Documentation</h2>
              <p className="lead text-muted">
                Everything you need to get started with ARA System
              </p>
            </Col>
          </Row>

          {/* User Manuals */}
          <Row className="g-4">
            {/* Admin Manual */}
            <Col md={6} className="fade-up fade-delay-1">
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="bi bi-shield-lock-fill text-primary fs-3"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Admin User Manual</h5>
                  <p className="text-muted small mb-3">
                    Documentation intended for administrators and event
                    managers.
                  </p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowAdminManual(true)}>
                    View Admin Guide <i className="bi bi-arrow-right ms-1"></i>
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Student Manual */}
            <Col md={6} className="fade-up fade-delay-2">
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="bi bi-person-fill text-primary fs-3"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Student User Manual</h5>
                  <p className="text-muted small mb-3">
                    Documentation intended for students using the attendance
                    system.
                  </p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowStudentManual(true)}>
                    View Student Guide{" "}
                    <i className="bi bi-arrow-right ms-1"></i>
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Help Card */}
          <Row className="mt-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm bg-light">
                <Card.Body className="p-4">
                  <Row className="align-items-center">
                    <Col md={8}>
                      <h5 className="fw-bold mb-2">Need Additional Help?</h5>
                      <p className="text-muted small mb-0">
                        Can't find what you're looking for? Check out our FAQ
                        section or contact our support team for assistance.
                      </p>
                    </Col>
                    <Col md={4} className="text-md-end mt-3 mt-md-0">
                      <Button variant="primary" className="me-2">
                        <i className="bi bi-question-circle me-2"></i>FAQ
                      </Button>
                      <Button variant="outline-primary">
                        <i className="bi bi-headset me-2"></i>Support
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ------------------- CONTACT SECTION ------------------- */}
      <section id="contact" className="py-5 bg-light fade-section">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <div className="mb-4">
                <i className="bi bi-envelope-fill text-primary fs-1"></i>
              </div>
              <h2 className="fw-bold mb-3">Get In Touch</h2>
              <p className="lead text-muted">
                Have questions? We'd love to hear from you
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col lg={4} className="fade-up fade-delay-1">
              <Card className="h-100 border-0 shadow-sm text-center hover-lift">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="bi bi-geo-alt-fill text-primary fs-3"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Visit Us</h5>
                  <p className="text-muted small mb-0">
                    123 University Avenue
                    <br />
                    Cotabato City, ARMM 9600
                    <br />
                    Philippines
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="fade-up fade-delay-2">
              <Card className="h-100 border-0 shadow-sm text-center hover-lift">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="bi bi-telephone-fill text-success fs-3"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Call Us</h5>
                  <p className="text-muted small mb-0">
                    Office: +63 (64) 421-xxxx
                    <br />
                    Mobile: +63 912 345 6789
                    <br />
                    Mon-Fri, 8:00 AM - 5:00 PM
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="fade-up fade-delay-3">
              <Card className="h-100 border-0 shadow-sm text-center hover-lift">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="bi bi-envelope-fill text-info fs-3"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Email Us</h5>
                  <p className="text-muted small mb-0">
                    General: info@arasystem.edu
                    <br />
                    Support: support@arasystem.edu
                    <br />
                    Technical: tech@arasystem.edu
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/*  MODALS */}
      <RegisterModal show={showRegisterModal} handleClose={handleClose} />
      <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
      <AdminUserManualModal
        show={showAdminManual}
        onHide={() => setShowAdminManual(false)}
      />
      <StudentUserManualModal
        show={showStudentManual}
        onHide={() => setShowStudentManual(false)}
      />

      {/* ------------------- FOOTER ------------------- */}
      <footer className="bg-dark text-white py-4 mt-auto fade-section">
        <Container>
          <Row className="g-4">
            <Col lg={4}>
              <div className="d-flex align-items-center mb-3">
                <img
                  src={logo}
                  alt="Logo"
                  width="40"
                  height="40"
                  className="rounded-circle me-2"
                />
                <span className="fw-bold">ARA System</span>
              </div>
              <p className="small text-white-50">
                Innovative biometric attendance management for modern
                educational institutions.
              </p>
            </Col>
            <Col lg={2} md={6}>
              <h6 className="fw-bold mb-3">Quick Links</h6>
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <a
                    href="#about"
                    className="text-white-50 text-decoration-none">
                    About
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#features"
                    className="text-white-50 text-decoration-none">
                    Features
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#documentation"
                    className="text-white-50 text-decoration-none">
                    Documentation
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#contact"
                    className="text-white-50 text-decoration-none">
                    Contact
                  </a>
                </li>
              </ul>
            </Col>
            <Col lg={2} md={6}>
              <h6 className="fw-bold mb-3">Support</h6>
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <a href="#" className="text-white-50 text-decoration-none">
                    Help Center
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-white-50 text-decoration-none">
                    FAQ
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-white-50 text-decoration-none">
                    Privacy Policy
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-white-50 text-decoration-none">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </Col>
            <Col lg={4}>
              <h6 className="fw-bold mb-3">Connect With Us</h6>
              <div className="d-flex gap-3 mb-3">
                <a href="#" className="text-white-50 fs-4">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="text-white-50 fs-4">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="text-white-50 fs-4">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="text-white-50 fs-4">
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
              <p className="small text-white-50 mb-0">
                Stay updated with our latest features and updates.
              </p>
            </Col>
          </Row>
          <hr className="my-4 border-secondary" />
          <Row>
            <Col className="text-center">
              <p className="small text-white-50 mb-0">
                &copy; {new Date().getFullYear()} ARA Attendance System. All
                rights reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default Landingpage;

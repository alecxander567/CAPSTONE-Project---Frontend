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
          <span className="d-none d-md-inline">ARAS-BT</span>
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
                Activity Record Attendance (ARA) System using{" "}
                <span className="hero-primary">Biometric Technology</span>
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
                        Role-based access for students, and administrators with
                        customized permissions.
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
                Have questions? Our team is here to help you
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {/* Software Concerns - Alec Xander Espaldon */}
            <Col lg={6} xl={3} className="fade-up fade-delay-1">
              <Card className="h-100 border-0 shadow-sm text-center hover-lift">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="bi bi-code-slash text-primary fs-3"></i>
                  </div>
                  <h5 className="fw-bold mb-2">Software</h5>
                  <p className="text-muted small mb-3">
                    System & Application Issues
                  </p>
                  <div className="text-start">
                    <p className="mb-2 fw-semibold text-dark">
                      Alec Xander Espaldon
                    </p>
                    <p className="text-muted small mb-1">
                      <i className="bi bi-envelope me-2"></i>
                      alecxanderespaldon21@gmail.com
                    </p>
                    <p className="text-muted small mb-0">
                      <i className="bi bi-phone me-2"></i>
                      +63 933 298 1179
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Hardware Concerns - William Clyde Ceballos */}
            <Col lg={6} xl={3} className="fade-up fade-delay-2">
              <Card className="h-100 border-0 shadow-sm text-center hover-lift">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="bi bi-cpu text-success fs-3"></i>
                  </div>
                  <h5 className="fw-bold mb-2">Hardware</h5>
                  <p className="text-muted small mb-3">
                    Device & Sensor Support
                  </p>
                  <div className="text-start">
                    <p className="mb-2 fw-semibold text-dark">
                      William Clyde Ceballos
                    </p>
                    <p className="text-muted small mb-1">
                      <i className="bi bi-envelope me-2"></i>
                      williamceballos@gmail.com
                    </p>
                    <p className="text-muted small mb-0">
                      <i className="bi bi-phone me-2"></i>
                      +63 XXX XXX XXXX
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Documentation - Edrian Rosales */}
            <Col lg={6} xl={3} className="fade-up fade-delay-3">
              <Card className="h-100 border-0 shadow-sm text-center hover-lift">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="bi bi-file-text text-info fs-3"></i>
                  </div>
                  <h5 className="fw-bold mb-2">Documentation</h5>
                  <p className="text-muted small mb-3">Guides & Review</p>
                  <div className="text-start">
                    <p className="mb-2 fw-semibold text-dark">Edrian Rosales</p>
                    <p className="text-muted small mb-1">
                      <i className="bi bi-envelope me-2"></i>
                      edrianrosales@gmail.com
                    </p>
                    <p className="text-muted small mb-0">
                      <i className="bi bi-phone me-2"></i>
                      +63 XXX XXX XXXX
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* UI/UX Concerns - DJ Taguno */}
            <Col lg={6} xl={3} className="fade-up fade-delay-4">
              <Card className="h-100 border-0 shadow-sm text-center hover-lift">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="bi bi-palette text-warning fs-3"></i>
                  </div>
                  <h5 className="fw-bold mb-2">UI/UX Design</h5>
                  <p className="text-muted small mb-3">
                    Interface & Experience
                  </p>
                  <div className="text-start">
                    <p className="mb-2 fw-semibold text-dark">DJ Taguno</p>
                    <p className="text-muted small mb-1">
                      <i className="bi bi-envelope me-2"></i>
                      djtaguno@gmail.com
                    </p>
                    <p className="text-muted small mb-0">
                      <i className="bi bi-phone me-2"></i>
                      +63 XXX XXX XXXX
                    </p>
                  </div>
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
          <Row className="g-4 justify-content-center">
            <Col lg={6} className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-3">
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

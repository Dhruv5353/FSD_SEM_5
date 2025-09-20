import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // State management using React Hooks
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Navigation items configuration
  const navigationItems = [
    { id: "home", name: "Home", icon: "🏠" },
    { id: "about", name: "About", icon: "👤" },
    { id: "services", name: "Services", icon: "⚙️" },
    { id: "portfolio", name: "Portfolio", icon: "💼" },
    { id: "contact", name: "Contact", icon: "📞" },
    { id: "blog", name: "Blog", icon: "📝" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ];

  // Function to toggle sidebar open/close
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to handle navigation and close sidebar on mobile
  const handleNavigation = (sectionId) => {
    setActiveSection(sectionId);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Function to close sidebar when clicking outside (on overlay)
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Close sidebar on window resize if opened on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Content for different sections
  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="content-section">
            <h1>Welcome Home</h1>
            <p>
              This is the home page content. Here you can find the latest
              updates and featured content.
            </p>
            <div className="feature-cards">
              <div className="card">
                <h3>Latest News</h3>
                <p>Stay updated with our latest announcements and news.</p>
              </div>
              <div className="card">
                <h3>Quick Actions</h3>
                <p>Access your most frequently used features quickly.</p>
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="content-section">
            <h1>About Us</h1>
            <p>Learn more about our company, mission, and values.</p>
            <p>
              We are dedicated to providing excellent services and creating
              meaningful experiences for our users.
            </p>
          </div>
        );
      case "services":
        return (
          <div className="content-section">
            <h1>Our Services</h1>
            <p>
              Explore the various services we offer to help you achieve your
              goals.
            </p>
            <ul>
              <li>Web Development</li>
              <li>Mobile App Development</li>
              <li>UI/UX Design</li>
              <li>Consulting Services</li>
            </ul>
          </div>
        );
      case "portfolio":
        return (
          <div className="content-section">
            <h1>Portfolio</h1>
            <p>Check out our latest projects and achievements.</p>
            <div className="portfolio-grid">
              <div className="portfolio-item">Project 1</div>
              <div className="portfolio-item">Project 2</div>
              <div className="portfolio-item">Project 3</div>
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="content-section">
            <h1>Contact Us</h1>
            <p>Get in touch with us for any inquiries or support.</p>
            <div className="contact-info">
              <p>📧 Email: contact@example.com</p>
              <p>📞 Phone: +1 (555) 123-4567</p>
              <p>📍 Address: 123 Main St, City, State 12345</p>
            </div>
          </div>
        );
      case "blog":
        return (
          <div className="content-section">
            <h1>Blog</h1>
            <p>Read our latest blog posts and articles.</p>
            <div className="blog-posts">
              <article className="blog-post">
                <h3>How to Build Great User Interfaces</h3>
                <p>
                  Learn the fundamentals of creating user-friendly interfaces...
                </p>
              </article>
              <article className="blog-post">
                <h3>The Future of Web Development</h3>
                <p>
                  Explore upcoming trends and technologies in web development...
                </p>
              </article>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="content-section">
            <h1>Settings</h1>
            <p>Manage your account settings and preferences.</p>
            <div className="settings-options">
              <div className="setting-item">
                <label>Theme:</label>
                <select>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Notifications:</label>
                <input type="checkbox" /> Enable notifications
              </div>
            </div>
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="app">
      {/* Header with hamburger menu */}
      <header className="header">
        <button
          className="hamburger-menu"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <span
            className={`hamburger-line ${sidebarOpen ? "open" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${sidebarOpen ? "open" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${sidebarOpen ? "open" : ""}`}
          ></span>
        </button>
        <h1 className="header-title">React Sidebar Navigation</h1>
      </header>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Navigation</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>

        <ul className="nav-list">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-link ${
                  activeSection === item.id ? "active" : ""
                }`}
                onClick={() => handleNavigation(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content */}
      <main className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;

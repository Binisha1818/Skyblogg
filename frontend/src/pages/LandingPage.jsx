import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-mark">✈</div>
          <span>SkyBlog</span>
        </div>
 {/* Airplane SVG */}
        <div className="plane-wrapper">
          <svg
            className="airplane-svg"
            viewBox="0 0 800 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M80 180 C220 90 380 210 520 120 C630 50 690 80 770 45"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              className="flight-path"
            />

            <g transform="translate(650 55) rotate(-25)">
              <path
                d="M0 18 L65 18 L90 30 L65 42 L0 42 L-22 65 L-32 65 L-20 42 L-65 42 L-82 55 L-92 55 L-78 30 L-92 5 L-82 5 L-65 18 L-20 18 L-32 -5 L-22 -5 Z"
                fill="currentColor"
              />
            </g>
          </svg>
        </div>
        <div className="landing-nav-actions">
         
        
        </div>
      </nav>

      {/* Hero */}
      <main className="landing-hero">
        <div className="hero-glow glow-one"></div>
        <div className="hero-glow glow-two"></div>

      

        <h1>
          Stories   <br />from
          <br />
          <em>35,000 feet.</em>
        </h1>


        <p className="landing-description">
        
        </p>

        <div className="landing-buttons">
          <button
            className="landing-primary-btn"
            onClick={() => navigate("/")}
          >
            Get Started
            <span>→</span>
          </button>

        
        </div>

       
        <div className="scroll-hint">
          <span></span>
          EXPLORE THE SKY
        </div>
      </main>
    </div>
  );
};

export default LandingPage;

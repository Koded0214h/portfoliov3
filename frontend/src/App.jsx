import { useEffect, useRef, useState } from "react";

/* ─── GridScan Background ─────────────────────────────────────────── */
function GridScan({
  lineColor = "rgba(255,255,255,0.9)",
  cellSize = 60,
  opacity = 0.18,
  speed = 1.8,
  scanColor = "rgba(255,255,255,0.6)",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let scanY = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Draw grid
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = opacity;

      // Vertical lines
      for (let x = 0; x <= W; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      // Horizontal lines
      for (let y = 0; y <= H; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Scan line glow
      ctx.globalAlpha = 1;
      const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.45, scanColor.replace("0.6", "0.08"));
      grad.addColorStop(0.5, scanColor);
      grad.addColorStop(0.55, scanColor.replace("0.6", "0.08"));
      grad.addColorStop(1, "transparent");

      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 60, W, 120);

      // The bright scan line itself
      ctx.strokeStyle = scanColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(W, scanY);
      ctx.stroke();

      scanY += speed;
      if (scanY > H + 60) scanY = -60;

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [lineColor, cellSize, opacity, speed, scanColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── Scramble Text Animation ─────────────────────────────────────── */
function ScrambleText({ text, trigger, className = "" }) {
  const [display, setDisplay] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  useEffect(() => {
    if (!trigger) return;
    let frame = 0;
    const total = text.length * 3;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (frame / 3 > i) return text[i];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      frame++;
      if (frame > total) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [trigger, text]);

  return <span className={className}>{display}</span>;
}

/* ─── Cycling Role Text ────────────────────────────────────────────── */
const ROLES = [
  "AI Engineer",
  "Fullstack Developer",
  "Platform Builder",
  "Mobile Developer",
  "Automation Engineer",
  "Systems Thinker",
];

function CyclingRole() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIdx((p) => (p + 1) % ROLES.length);
        setShow(true);
      }, 300);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <span
      style={{
        display: "inline-block",
        color: "#3fa945",
        fontFamily: "'DM Mono', monospace",
        transition: "opacity 0.3s, transform 0.3s",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(-8px)",
      }}
    >
      {ROLES[idx]}
    </span>
  );
}

/* ─── Global Ambient Floating Code ────────────────────────────────── */
// type: "purple" | "green" | "blue" | "dim"
const ALL_SNIPPETS = [
  // ── Hero zone  (y 2–18%)
  { text: "const ai = new LangChain()",         x:"7%",  y:"3%",   delay:0,    dur:16, type:"purple" },
  { text: "@app.route('/api/predict')",          x:"68%", y:"5%",   delay:2.1,  dur:18, type:"blue"   },
  { text: "async def handle(req):",              x:"42%", y:"9%",   delay:0.9,  dur:15, type:"green"  },
  { text: "npm run build",                       x:"80%", y:"14%",  delay:3.4,  dur:13, type:"dim"    },
  { text: "useEffect(() => {",                   x:"2%",  y:"16%",  delay:1.5,  dur:19, type:"blue"   },

  // ── Marquee / upper-mid zone (y 19–32%)
  { text: "JWT.verify(token, secret)",           x:"88%", y:"21%",  delay:0.3,  dur:17, type:"green"  },
  { text: "celery -A app worker",                x:"1%",  y:"27%",  delay:2.8,  dur:21, type:"dim"    },
  { text: "model.fit(X_train, y_train)",         x:"55%", y:"24%",  delay:1.1,  dur:20, type:"purple" },
  { text: "docker-compose up -d",                x:"30%", y:"30%",  delay:4.0,  dur:14, type:"blue"   },

  // ── About zone (y 33–52%)
  { text: "SELECT * FROM users WHERE",           x:"4%",  y:"35%",  delay:0.7,  dur:22, type:"green"  },
  { text: "git push origin main",                x:"76%", y:"38%",  delay:2.5,  dur:16, type:"purple" },
  { text: "class UserSerializer(ModelSerializer):", x:"83%", y:"44%", delay:1.8, dur:24, type:"dim"  },
  { text: "useState<Project[]>([])",             x:"1%",  y:"48%",  delay:3.2,  dur:18, type:"blue"   },
  { text: "await openai.chat.completions.create", x:"40%", y:"51%", delay:0.4,  dur:23, type:"purple" },

  // ── Projects zone (y 53–72%)
  { text: "response.json()",                     x:"90%", y:"55%",  delay:1.6,  dur:15, type:"green"  },
  { text: "DATABASES = { 'default': {...} }",    x:"3%",  y:"59%",  delay:2.0,  dur:20, type:"dim"    },
  { text: "const [data, setData] = useState()", x:"58%", y:"62%",  delay:0.6,  dur:17, type:"blue"   },
  { text: "embeddings = model.encode(text)",     x:"20%", y:"67%",  delay:3.7,  dur:19, type:"purple" },
  { text: "supabase.from('posts').select()",     x:"72%", y:"70%",  delay:1.3,  dur:22, type:"green"  },

  // ── Testimonials / contact zone (y 73–94%)
  { text: "docker build -t koded .",             x:"5%",  y:"75%",  delay:0.2,  dur:16, type:"blue"   },
  { text: "pip install langchain openai",        x:"62%", y:"78%",  delay:2.9,  dur:21, type:"dim"    },
  { text: "axios.post('/api/generate', body)",   x:"15%", y:"82%",  delay:1.0,  dur:18, type:"purple" },
  { text: "Railway.app deploy --env prod",       x:"80%", y:"85%",  delay:3.5,  dur:14, type:"green"  },
  { text: "AssemblyAI.transcribe(audio_url)",    x:"35%", y:"89%",  delay:0.8,  dur:20, type:"blue"   },
  { text: "return Response(serializer.data)",    x:"2%",  y:"92%",  delay:2.3,  dur:17, type:"dim"    },
];

const SNIPPET_STYLES = {
  purple: { color: "rgba(63,169,69,0.18)", bg: "rgba(63,169,69,0.03)",  border: "rgba(63,169,69,0.07)" },
  green:  { color: "rgba(52,211,153,0.15)",  bg: "rgba(52,211,153,0.02)",   border: "rgba(52,211,153,0.06)"  },
  blue:   { color: "rgba(96,165,250,0.15)",  bg: "rgba(96,165,250,0.02)",   border: "rgba(96,165,250,0.06)"  },
  dim:    { color: "rgba(255,255,255,0.09)", bg: "transparent",             border: "rgba(255,255,255,0.04)" },
};

function GlobalFloatingCode() {
  return (
    <div
      className="floating-code-layer"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {ALL_SNIPPETS.map((s, i) => {
        const st = SNIPPET_STYLES[s.type];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              fontFamily: "'DM Mono', monospace",
              fontSize: 10.5,
              color: st.color,
              background: st.bg,
              border: `1px solid ${st.border}`,
              borderRadius: 6,
              padding: "4px 11px",
              whiteSpace: "nowrap",
              animation: `floatDrift ${s.dur}s ease-in-out ${s.delay}s infinite`,
              letterSpacing: "0.03em",
              backdropFilter: "blur(3px)",
            }}
          >
            {s.text}
          </div>
        );
      })}
    </div>
  );
}


function ProjectCard({ project, idx }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "rgba(63,169,69,0.08)"
          : "rgba(255,255,255,0.03)",
        border: hovered
          ? "1px solid rgba(63,169,69,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "28px 24px",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            color: "#3fa945",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "3px 10px",
            border: "1px solid rgba(63,169,69,0.3)",
            borderRadius: 99,
          }}
        >
          {project.category}
        </span>
        {project.status && (
          <span
            style={{
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              color: "#34d399",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            ● {project.status}
          </span>
        )}
      </div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "#fff",
          marginBottom: 8,
          fontFamily: "'Cabinet Grotesk', sans-serif",
        }}
      >
        {project.title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.65,
          marginBottom: 16,
        }}
      >
        {project.description}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {project.stack.map((s) => (
          <span
            key={s}
            style={{
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              color: "rgba(255,255,255,0.5)",
              padding: "3px 9px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 10,
        }}
      >
        <a
          href={project.demo}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 13,
            color: "#3fa945",
            textDecoration: "none",
            padding: "6px 16px",
            border: "1px solid rgba(63,169,69,0.4)",
            borderRadius: 8,
            transition: "all 0.2s",
            fontFamily: "'DM Mono', monospace",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(63,169,69,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          ↗ Demo
        </a>
        <a
          href={project.code}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            textDecoration: "none",
            padding: "6px 16px",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            transition: "all 0.2s",
            fontFamily: "'DM Mono', monospace",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          ⌥ Code
        </a>
      </div>
    </div>
  );
}

/* ─── Main Portfolio ───────────────────────────────────────────────── */
const PROJECTS = [
  {
    title: "BizPulse",
    category: "fullstack & cloud",
    description:
      "AI-powered business intelligence co-pilot delivering narrative insights and anomaly detection for SMBs using AWS serverless architecture.",
    stack: ["Django", "React", "AWS Lambda", "Bedrock", "Amazon Q"],
    demo: "https://biz-pulse.vercel.app/",
    code: "https://github.com/Koded0214h/Biz-Pulse",
    status: "live",
  },
  {
    title: "SoroSurance",
    category: "backend",
    description:
      "Voice-first insurance claim platform for elderly, visually impaired, and low-literate users. File claims just by speaking, in multiple local languages.",
    stack: ["Django", "AssemblyAI", "Gemini AI", "Spitch API", "Render"],
    demo: "https://soro-surance.vercel.app/",
    code: "https://github.com/Koded0214h/Soro-surance",
    status: "live",
  },
  {
    title: "Gradify",
    category: "edtech",
    description:
      "AI-assisted assignment distribution and grading platform with role-based dashboards for students and lecturers.",
    stack: ["Django", "React", "Gemini AI", "Celery", "PostgreSQL"],
    demo: "https://gradify-vert.vercel.app/",
    code: "https://github.com/Koded0214h/Gradify",
    status: "live",
  },
  {
    title: "TrustGrid",
    category: "privacy toolkit",
    description:
      "NDPR-compliant AI privacy platform enabling organizations to manage citizen data consent with automated audit trails.",
    stack: ["Django", "React", "PostgreSQL", "AI Compliance"],
    demo: "#",
    code: "https://github.com/qcoderx/Trust-Grid",
  },
  {
    title: "SmartMail AI",
    category: "productivity",
    description:
      "Gmail-integrated AI assistant that filters, summarizes, and generates smart replies while syncing calendar events.",
    stack: ["Django", "DRF", "Gmail API", "Gemini AI"],
    demo: "#",
    code: "https://github.com/Koded0214h/Smart-Mail-AI",
    status: "in progress",
  },
  {
    title: "SCAFLD",
    category: "developer tool",
    description:
      "Backend scaffolding engine that generates full Django backends — auth, CRUD, permissions, APIs — in seconds. Founder & lead engineer.",
    stack: ["Python", "Django", "JWT", "CLI", "Docker"],
    demo: "#",
    code: "#",
    status: "in progress",
  },
];

const TOOLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "React Native",
  "Next.js",
  "Tailwind",
  "Python",
  "Django",
  "DRF",
  "PostgreSQL",
  "MySQL",
  "Docker",
  "Celery",
  "Redis",
  "Firebase",
  "Appwrite",
  "Postman",
  "Render",
  "MongoDB",
];

const TESTIMONIALS = [
  {
    name: "Anselm I.",
    role: "Founder, Search Labs",
    text: "Koded is one of the most driven young engineers I've ever worked with. He takes full ownership of projects, learns fast, and consistently delivers solutions far beyond what was expected.",
    initial: "A",
  },
  {
    name: "Adejoke J.",
    role: "Tutor, Rubies Technology",
    text: "Working with Koded has been incredible. He built our entire backend and AI system with speed and clarity, always keeping the bigger picture in mind. Reliable, proactive, and truly world-class.",
    initial: "A",
  },
  {
    name: "Abdulbasit F.",
    role: "Product Designer",
    text: "What stands out about Koded is his ability to translate ideas into fully functional products in record time. His attention to detail and problem-solving skills are exceptional.",
    initial: "A",
  },
];

export default function Portfolio() {
  const [scrolled, setScrolled] = useState(false);
  const [scramble, setScramble] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    setTimeout(() => setScramble(true), 500);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Cabinet+Grotesk:wght@400;500;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050508; color: #fff; font-family: 'Cabinet Grotesk', sans-serif; }
        html { scroll-behavior: smooth; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: rgba(63,169,69,0.4); border-radius: 99px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes floatDrift {
          0%   { transform: translateY(0px)   translateX(0px);  }
          25%  { transform: translateY(-10px) translateX(5px);  }
          50%  { transform: translateY(-18px) translateX(-4px); }
          75%  { transform: translateY(-8px)  translateX(7px);  }
          100% { transform: translateY(0px)   translateX(0px);  }
        }
        @keyframes menuSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.25s; }
        .fade-up-3 { animation-delay: 0.4s; }
        .fade-up-4 { animation-delay: 0.55s; }

        .section-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: #fff;
          margin-bottom: 48px;
          letter-spacing: -0.02em;
        }
        .section-title span { color: #3fa945; }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: #3fa945;
          color: #050508;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Cabinet Grotesk', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #5cb85c; transform: translateY(-1px); }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: transparent;
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'Cabinet Grotesk', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          white-space: nowrap;
        }
        .btn-ghost:hover { border-color: rgba(63,169,69,0.4); color: #3fa945; transform: translateY(-1px); }

        .nav-links-desktop { display: flex; align-items: center; gap: 32px; }
        .hamburger { display: none; }
        .mobile-menu { display: none; }
        .floating-code-layer { display: block; }

        @media (max-width: 768px) {
          .nav-links-desktop { display: none; }
          .hamburger {
            display: flex;
            flex-direction: column;
            gap: 5px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
          }
          .hamburger span {
            display: block;
            width: 22px;
            height: 2px;
            background: rgba(255,255,255,0.8);
            border-radius: 2px;
            transition: all 0.3s;
          }
          .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
          .hamburger.open span:nth-child(2) { opacity: 0; }
          .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

          .mobile-menu {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 64px;
            left: 0;
            right: 0;
            background: rgba(5,5,8,0.97);
            backdrop-filter: blur(24px);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            padding: 20px 24px 28px;
            gap: 4px;
            z-index: 99;
            animation: menuSlide 0.2s ease;
          }
          .mobile-menu.hidden { display: none; }
          .mobile-menu a, .mobile-menu button {
            display: block;
            width: 100%;
            text-align: left;
            padding: 14px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 16px;
            font-family: 'Cabinet Grotesk', sans-serif;
            font-weight: 500;
            color: rgba(255,255,255,0.7);
            background: none;
            border-top: none;
            border-left: none;
            border-right: none;
            cursor: pointer;
            text-decoration: none;
          }
          .mobile-menu a:last-child, .mobile-menu button:last-child { border-bottom: none; }

          .about-grid { grid-template-columns: 1fr; gap: 40px; }
          .grid-3 { grid-template-columns: 1fr; }

          .section-title { margin-bottom: 28px; }

          /* Adjust floating snippets for mobile */
          .floating-code-layer div {
            font-size: 8px !important;
            padding: 2px 6px !important;
            opacity: 0.7;
          }

          .hero-social-label { display: none; }
          .hero-social-short { display: inline !important; }
        }

        @media (max-width: 480px) {
          .btn-primary, .btn-ghost { width: 100%; justify-content: center; font-size: 13px; }
          .hero-buttons { flex-direction: column; align-items: stretch; }
          .social-strip { flex-wrap: wrap; gap: 14px !important; justify-content: center; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ─── GLOBAL AMBIENT CODE LAYER ────────────────────── */}
      <GlobalFloatingCode />

      {/* ─── NAV ──────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(20px, 5vw, 80px)",
          height: 64,
          background: scrolled || menuOpen
            ? "rgba(5,5,8,0.95)"
            : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(20px)" : "none",
          borderBottom: scrolled || menuOpen
            ? "1px solid rgba(255,255,255,0.06)"
            : "none",
          transition: "all 0.3s ease",
        }}
      >
        <button
          onClick={() => scrollTo("hero")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            fontSize: 15,
            fontWeight: 500,
            color: "#fff",
            letterSpacing: "0.05em",
          }}
        >
          koded<span style={{ color: "#3fa945" }}>.</span>
        </button>

        {/* Desktop links */}
        <div className="nav-links-desktop">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontWeight: 500,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#fff")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.6)")}
            >
              {n.label}
            </button>
          ))}
          <a
            href="https://github.com/Koded0214h"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ padding: "9px 20px", fontSize: 13 }}
          >
            GitHub ↗
          </a>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? "" : " hidden"}`}>
        {navItems.map((n) => (
          <button key={n.id} onClick={() => scrollTo(n.id)}>
            {n.label}
          </button>
        ))}
        <a
          href="https://github.com/Koded0214h"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#3fa945" }}
          onClick={() => setMenuOpen(false)}
        >
          GitHub ↗
        </a>
      </div>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "80px 20px 60px",
        }}
      >
        {/* Deep bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(63,169,69,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Grid scan */}
        <GridScan
          lineColor="rgba(63,169,69,0.7)"
          cellSize={55}
          opacity={0.12}
          speed={1.8}
          scanColor="rgba(63,169,69,0.5)"
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            maxWidth: 780,
          }}
        >
          {/* Status badge */}
          <div
            className="fade-up fade-up-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              border: "1px solid rgba(52,211,153,0.35)",
              borderRadius: 99,
              marginBottom: 28,
            }}
          >
            <span
              style={{
                position: "relative",
                display: "inline-block",
                width: 8,
                height: 8,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "#34d399",
                  animation: "pulse-ring 1.5s ease-out infinite",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "#34d399",
                }}
              />
            </span>
            <span
              style={{
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                color: "#34d399",
                letterSpacing: "0.08em",
              }}
            >
              Available for work · Lagos, Nigeria
            </span>
          </div>

          <h1
            className="fade-up fade-up-2"
            style={{
              fontSize: "clamp(44px, 8vw, 88px)",
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            <ScrambleText text="Hi, I'm Koded." trigger={scramble} />
          </h1>

          <div
            className="fade-up fade-up-3"
            style={{
              fontSize: "clamp(18px, 3vw, 26px)",
              color: "rgba(255,255,255,0.55)",
              marginBottom: 20,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span>I'm a</span>
            <CyclingRole />
          </div>

          <p
            className="fade-up fade-up-3"
            style={{
              fontSize: "clamp(15px, 2vw, 17px)",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.75,
              maxWidth: 540,
              margin: "0 auto 40px",
            }}
          >
            Building intelligent, scalable systems — from AI-powered platforms
            to production-ready SaaS. Based in Lagos.
          </p>

          <div
            className="fade-up fade-up-4 hero-buttons"
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button className="btn-primary" onClick={() => scrollTo("projects")}>
              View Projects ↓
            </button>
            <button className="btn-ghost" onClick={() => scrollTo("contact")}>
              Contact Me
            </button>
          </div>

          {/* Social strip */}
          <div
            className="fade-up fade-up-4 social-strip"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              marginTop: 48,
            }}
          >
            {[
              { label: "GitHub",      short: "GH",  href: "https://github.com/Koded0214h" },
              { label: "LinkedIn",    short: "LI",  href: "https://www.linkedin.com/in/koded0214h" },
              { label: "X / Twitter", short: "X",   href: "https://x.com/coder0214h" },
              { label: "WhatsApp",    short: "WA",  href: "https://wa.me/+2347030057130" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                  color: "rgba(255,255,255,0.35)",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(63,169,69,0.9)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
                }
              >
                <span className="hero-social-label">{s.label}</span>
                <span style={{ display: "none" }} className="hero-social-short">{s.short}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            animation: "float 2.5s ease-in-out infinite",
          }}
        >
          <div
            style={{
              width: 1,
              height: 32,
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))",
            }}
          />
        </div>
      </section>

      {/* ─── TOOLS MARQUEE ──────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "18px 0",
          overflow: "hidden",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 40,
            animation: "marquee 30s linear infinite",
            width: "max-content",
          }}
        >
          {[...TOOLS, ...TOOLS].map((t, i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {t}
              <span
                style={{
                  marginLeft: 40,
                  color: "rgba(63,169,69,0.4)",
                  fontSize: 8,
                }}
              >
                ◆
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── ABOUT ──────────────────────────────────────────── */}
      <section
        id="about"
        style={{
          padding: "clamp(60px,10vw,100px) clamp(20px, 8vw, 120px)",
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="about-grid">
          <div>
            <p
              style={{
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                color: "#3fa945",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              About
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: 24,
              }}
            >
              Full-stack engineer
              <br />
              <span style={{ color: "#3fa945" }}>obsessed with AI.</span>
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.85,
                fontSize: 16,
                marginBottom: 16,
              }}
            >
              I'm Koded — an AI-focused fullstack developer from Nigeria. I
              build intelligent, scalable systems combining deep backend
              engineering with clean, modern interfaces. My work spans AI
              automation, SaaS platforms, mobile apps, and high-performance APIs
              using Django, React, Tailwind, and modern AI frameworks.
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.85,
                fontSize: 15,
              }}
            >
              Founder of <strong style={{ color: "#3fa945" }}>SCAFLD</strong> —
              a backend scaffolding engine. I collaborate with startups and
              teams to architect backend infrastructure, integrate AI, and ship
              production-ready features fast.
            </p>
          </div>

          <div>
            {/* Stats */}
            <div
              className="stats-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                { label: "Projects shipped", value: "18+" },
                { label: "Hackathons", value: "6+" },
                { label: "Students mentored", value: "100+" },
                { label: "GPA", value: "4.59/5" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    padding: "20px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#3fa945",
                      letterSpacing: "-0.02em",
                      marginBottom: 4,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            {/* Current role */}
            <div
              style={{
                padding: "18px 20px",
                border: "1px solid rgba(63,169,69,0.2)",
                borderRadius: 12,
                background: "rgba(63,169,69,0.05)",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#34d399",
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#fff",
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  Fullstack Developer @ SearchLabs
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "'DM Mono', monospace",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Sep 2025 – Present · Remote
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROJECTS ───────────────────────────────────────── */}
      <section
        id="projects"
        style={{
          padding: "clamp(60px,10vw,100px) clamp(20px, 8vw, 120px)",
          background: "rgba(255,255,255,0.015)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: "#3fa945",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Projects
          </p>
          <h2
            className="section-title"
            style={{ marginBottom: 16 }}
          >
            Things I've <span>built</span>
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 15,
              marginBottom: 48,
              maxWidth: 500,
            }}
          >
            A selection of real products, hackathon wins, and tools I've shipped.
          </p>
          <div className="grid-3">
            {PROJECTS.map((p, i) => (
              <ProjectCard key={i} project={p} idx={i} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <a
              href="https://github.com/Koded0214h"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              See all on GitHub ↗
            </a>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────── */}
      <section
        style={{
          padding: "clamp(60px,10vw,100px) clamp(20px, 8vw, 120px)",
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            color: "#3fa945",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Testimonials
        </p>
        <h2 className="section-title">
          What people <span>say</span>
        </h2>
        <div
          className="testimonials-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              style={{
                padding: "28px 24px",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.75,
                  marginBottom: 20,
                  fontStyle: "italic",
                }}
              >
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #2e7d32, #3fa945)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {t.initial}
                </div>
                <div>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: "'DM Mono', monospace",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CONTACT ────────────────────────────────────────── */}
      <section
        id="contact"
        style={{
          padding: "clamp(60px,10vw,100px) clamp(20px, 8vw, 120px) clamp(60px,10vw,120px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(63,169,69,0.15), transparent)",
          }}
        />
        <GridScan
          lineColor="rgba(63,169,69,0.5)"
          cellSize={50}
          opacity={0.07}
          speed={1.4}
          scanColor="rgba(63,169,69,0.3)"
        />
        <div style={{ position: "relative", zIndex: 2 }}>
          <p
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: "#3fa945",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Contact
          </p>
          <h2
            style={{
              fontSize: "clamp(34px, 6vw, 64px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Let's build something
            <br />
            <span style={{ color: "#3fa945" }}>together.</span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 400,
              margin: "0 auto 40px",
              lineHeight: 1.75,
            }}
          >
            I'm always excited to collaborate on innovative and ambitious
            projects.
          </p>
          <div
            className="hero-buttons"
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 48,
            }}
          >
            <a
              href="mailto:coder0214h@gmail.com"
              className="btn-primary"
            >
              coder0214h@gmail.com ↗
            </a>
            <a
              href="https://wa.me/+2347030057130"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              WhatsApp
            </a>
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.08em",
            }}
          >
            +234 703 005 7130
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "24px clamp(20px, 8vw, 120px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          koded<span style={{ color: "#3fa945" }}>.</span> © 2025
        </span>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          Django · React · AI
        </span>
      </footer>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { VERSION_LABEL } from './version';
import { 
  Activity, 
  Terminal, 
  ShieldCheck, 
  Globe, 
  KeyRound, 
  Box, 
  Play, 
  Pause, 
  RotateCw, 
  ExternalLink,
  Cpu
} from 'lucide-react';

export const App: React.FC = () => {
  const [ticks, setTicks] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);
  const [lastTickMs, setLastTickMs] = useState<number>(0);

  // Engine heartbeat simulation
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const start = performance.now();
      setTicks((prev) => prev + 1);
      const elapsed = performance.now() - start;
      setLastTickMs(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Frame rate monitor simulation
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '90px' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--as-border-subtle)',
          background: 'rgba(18, 18, 22, 0.7)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--as-radius-md)',
                background: 'var(--as-accent-muted)',
                border: '1px solid rgba(132, 204, 22, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--as-accent-primary)',
              }}
            >
              <Cpu size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--as-font-heading)', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
                  idleMullet
                </span>
                <span className="status-pill status-pill-accent">PROD SHELL</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--as-text-muted)', fontFamily: 'var(--as-font-mono)' }}>
                idlemullet.com · idleAustin ecosystem
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>idleAustin (idle, but operational)</span>
          </div>

          <a
            href="https://github.com/idleAustin/idlemullet"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '12px' }}
          >
            <ExternalLink size={13} />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '32px 24px', flex: 1 }}>
        {/* Hero Section */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
            Game Runtime & Infrastructure Cockpit
          </h1>
          <p style={{ color: 'var(--as-text-secondary)', fontSize: '16px', maxWidth: '720px' }}>
            Business in the front, idle party in the back. Frontend architecture initialized and wired to production reverse proxies, Doppler secrets vault, and automated release pipelines.
          </p>
        </div>

        {/* Telemetry Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {/* Engine Ticks Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontFamily: 'var(--as-font-mono)', color: 'var(--as-text-muted)' }}>
                ENGINE TICKS
              </span>
              <Activity size={16} color="var(--as-accent-primary)" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--as-font-mono)', color: 'var(--as-text-primary)' }}>
              {ticks.toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span className="status-pill status-pill-success">
                {isRunning ? 'TICKING' : 'PAUSED'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--as-text-muted)', fontFamily: 'var(--as-font-mono)' }}>
                {lastTickMs.toFixed(2)} ms latency
              </span>
            </div>
          </div>

          {/* Frame Rate */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontFamily: 'var(--as-font-mono)', color: 'var(--as-text-muted)' }}>
                DISPLAY REFRESH
              </span>
              <Terminal size={16} color="var(--as-status-info)" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--as-font-mono)', color: 'var(--as-text-primary)' }}>
              {fps} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--as-text-muted)' }}>FPS</span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--as-text-muted)', fontFamily: 'var(--as-font-mono)' }}>
              vsync animation loop active
            </div>
          </div>

          {/* Domain Routing */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontFamily: 'var(--as-font-mono)', color: 'var(--as-text-muted)' }}>
                DOMAIN & PROXY
              </span>
              <Globe size={16} color="var(--as-status-success)" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--as-text-primary)' }}>
              idlemullet.com
            </div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-pill status-pill-success">CLOUDFLARE PROXIED</span>
            </div>
          </div>

          {/* Doppler Vault */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontFamily: 'var(--as-font-mono)', color: 'var(--as-text-muted)' }}>
                SECRETS VAULT
              </span>
              <KeyRound size={16} color="var(--as-status-warning)" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--as-text-primary)' }}>
              Doppler (idlemullet)
            </div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-pill status-pill-accent">DEV & PRD LINKED</span>
            </div>
          </div>
        </div>

        {/* Runtime Stage Simulation Viewport */}
        <div
          className="card card-elevated"
          style={{
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            borderStyle: 'dashed',
            borderColor: 'var(--as-border-strong)',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              backgroundImage: 'radial-gradient(var(--as-accent-primary) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <Box size={42} strokeWidth={1.5} color="var(--as-accent-primary)" style={{ marginBottom: '16px', zIndex: 1 }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px', zIndex: 1 }}>Frontend Game Engine Stage</h3>
          <p style={{ color: 'var(--as-text-secondary)', maxWidth: '480px', marginBottom: '20px', zIndex: 1 }}>
            Ready for game loop components, WebGL/Canvas rendering, or procedural asset generation.
          </p>
          <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn btn-primary"
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{isRunning ? 'Pause Engine' : 'Resume Engine'}</span>
            </button>
            <button
              onClick={() => setTicks(0)}
              className="btn btn-secondary"
            >
              <RotateCw size={14} />
              <span>Reset Tick Counter</span>
            </button>
          </div>
        </div>

        {/* Infrastructure Checklist Overview */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--as-accent-primary)" />
            <span>Project Bootstrap Checklist & Gated Controls</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-pill status-pill-success">DONE</span>
              <span style={{ fontSize: '13px', color: 'var(--as-text-secondary)' }}>Git repo linked to idleAustin/idlemullet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-pill status-pill-success">DONE</span>
              <span style={{ fontSize: '13px', color: 'var(--as-text-secondary)' }}>Doppler project `idlemullet` configured</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-pill status-pill-success">DONE</span>
              <span style={{ fontSize: '13px', color: 'var(--as-text-secondary)' }}>Conventional commit versioning script</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-pill status-pill-success">DONE</span>
              <span style={{ fontSize: '13px', color: 'var(--as-text-secondary)' }}>GitHub CI/CD & Snyk SAST workflows</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-pill status-pill-success">DONE</span>
              <span style={{ fontSize: '13px', color: 'var(--as-text-secondary)' }}>Porkbun NS pointed to Cloudflare</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-pill status-pill-success">DONE</span>
              <span style={{ fontSize: '13px', color: 'var(--as-text-secondary)' }}>Multi-stage Docker container & Express shell</span>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Command Dock */}
      <nav className="icon-dock" aria-label="Action dock">
        <div className="tooltip-wrapper">
          <button
            className={`icon-action-btn ${isRunning ? 'active' : ''}`}
            onClick={() => setIsRunning(!isRunning)}
            aria-label={isRunning ? 'Pause Engine' : 'Resume Engine'}
          >
            {isRunning ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <div className="tooltip-bubble">
            <span>{isRunning ? 'Pause Ticks' : 'Start Ticks'}</span>
            <span className="tooltip-kbd">Space</span>
          </div>
        </div>

        <div className="tooltip-wrapper">
          <button
            className="icon-action-btn"
            onClick={() => setTicks((prev) => prev + 10)}
            aria-label="Step 10 Ticks"
          >
            <Activity size={17} />
          </button>
          <div className="tooltip-bubble">
            <span>Step +10 Ticks</span>
            <span className="tooltip-kbd">⌘ + T</span>
          </div>
        </div>

        <div className="tooltip-wrapper">
          <button
            className="icon-action-btn"
            onClick={() => setTicks(0)}
            aria-label="Reset Counters"
          >
            <RotateCw size={17} />
          </button>
          <div className="tooltip-bubble">
            <span>Reset Ticks</span>
            <span className="tooltip-kbd">⌘ + R</span>
          </div>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--as-border-strong)', margin: '0 4px' }} />

        <div className="tooltip-wrapper">
          <a
            href="https://github.com/idleAustin/idlemullet"
            target="_blank"
            rel="noreferrer"
            className="icon-action-btn"
            aria-label="Open GitHub Repo"
          >
            <ExternalLink size={17} />
          </a>
          <div className="tooltip-bubble">
            <span>Repository</span>
            <span className="tooltip-kbd">G</span>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--as-border-subtle)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--as-text-muted)',
          fontFamily: 'var(--as-font-mono)',
        }}
      >
        <div>{VERSION_LABEL}</div>
        <div>Mostly idle. There probably was an easier way to do this.</div>
      </footer>
    </div>
  );
};

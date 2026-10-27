import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabaseSchema, pool } from './config/database';
import { initSocketServer } from './config/socket';
import authRoutes from './routes/authRoutes';
import academicsRoutes from './routes/academicsRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import studentSafetyRoutes from './routes/studentSafetyRoutes';
import connectionsRoutes from './routes/connectionsRoutes';
import studentUtilitiesRoutes from './routes/studentUtilitiesRoutes';
import facultyRoutes from './routes/facultyRoutes';
import alumniRoutes from './routes/alumniRoutes';
import adminRoutes from './routes/adminRoutes';
import parentRoutes from './routes/parentRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '5000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Mount Authentication, Academics, Attendance, Student Safety, Connections, Student Utilities, Faculty, Alumni, Parent, Admin & AI Routes
app.use('/api/auth', authRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/student-safety', studentSafetyRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/student-utilities', studentUtilitiesRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);



// Root GET / endpoint - Detailed State-of-the-Art Backend Control Panel Dashboard
app.get('/', async (req: Request, res: Response) => {
  let stats = { students: 0, faculties: 0, parents: 0, alumni: 0, administrators: 0 };
  let dbConnected = false;
  try {
    const [[s]]: any = await pool.query('SELECT COUNT(*) as c FROM students');
    const [[f]]: any = await pool.query('SELECT COUNT(*) as c FROM faculties');
    const [[p]]: any = await pool.query('SELECT COUNT(*) as c FROM parents');
    const [[a]]: any = await pool.query('SELECT COUNT(*) as c FROM alumni');
    const [[ad]]: any = await pool.query('SELECT COUNT(*) as c FROM administrators');
    stats = { students: s.c, faculties: f.c, parents: p.c, alumni: a.c, administrators: ad.c };
    dbConnected = true;
  } catch (e) {
    dbConnected = false;
  }

  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NEXUS | Backend REST API Service & Control Center</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          background: #06050e;
          color: #f8fafc;
          min-h-screen;
          padding: 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-image: 
            radial-gradient(circle at 15% 15%, rgba(147, 51, 234, 0.15), transparent 40%),
            radial-gradient(circle at 85% 85%, rgba(79, 70, 229, 0.15), transparent 40%);
        }
        .container { max-width: 1100px; width: 100%; margin: 0 auto; space-y: 2rem; }
        .header {
          background: rgba(15, 12, 35, 0.7);
          border: 1px solid rgba(147, 51, 234, 0.3);
          border-radius: 2rem;
          padding: 2.5rem;
          backdrop-filter: blur(16px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          position: relative;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        .header-bg-glow {
          position: absolute;
          top: -50px; right: -50px;
          width: 250px; height: 250px;
          background: linear-gradient(135deg, #a855f7, #6366f1);
          opacity: 0.2;
          filter: blur(60px);
          border-radius: 50%;
          pointer-events: none;
        }
        .title-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          background: rgba(168, 85, 247, 0.15);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #c084fc;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        h1 {
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, #ffffff 30%, #a855f7 70%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle { color: #94a3b8; font-size: 0.95rem; max-width: 650px; line-height: 1.6; }
        
        .status-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1.25rem;
          border-radius: 1rem;
          font-size: 0.825rem;
          font-weight: 700;
        }
        .status-pill.online {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
        }
        .status-pill.offline {
          background: rgba(244, 63, 94, 0.15);
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: #fb7185;
        }
        .status-pill.info {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #818cf8;
        }
        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .dot.green { background: #34d399; box-shadow: 0 0 10px #34d399; }
        .dot.red { background: #fb7185; }

        .section-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #f1f5f9;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: rgba(20, 16, 48, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          padding: 1.5rem;
          backdrop-filter: blur(12px);
          transition: transform 0.2s, border-color 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(168, 85, 247, 0.4);
        }
        .stat-label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-val { font-size: 2.25rem; font-weight: 900; color: #ffffff; margin-top: 0.4rem; font-family: 'JetBrains Mono', monospace; }

        .routes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .route-card {
          background: rgba(20, 16, 48, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          padding: 1.5rem;
          backdrop-filter: blur(12px);
        }
        .route-header { display: flex; items-center; justify-content: space-between; margin-bottom: 0.75rem; }
        .route-name { font-size: 0.95rem; font-weight: 800; color: #a855f7; font-family: 'JetBrains Mono', monospace; }
        .route-desc { font-size: 0.825rem; color: #94a3b8; line-height: 1.5; }
        .route-badge { font-size: 0.7rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 0.5rem; background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }

        .credits-card {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(79, 70, 229, 0.2));
          border: 1px solid rgba(168, 85, 247, 0.4);
          border-radius: 1.75rem;
          padding: 1.75rem;
          text-align: center;
        }
        .credits-title { font-size: 1.1rem; font-weight: 900; color: #ffffff; margin-bottom: 0.4rem; }
        .credits-authors { font-size: 0.95rem; font-weight: 800; color: #c084fc; }
        .credits-sub { font-size: 0.8rem; color: #cbd5e1; margin-top: 0.5rem; }

        .btn-group { display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap; }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: 1rem;
          font-size: 0.825rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s;
        }
        .btn-primary { background: #9333ea; color: white; }
        .btn-primary:hover { background: #7e22ce; }
        .btn-secondary { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.15); }
        .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- HEADER CONTROL BANNER -->
        <div class="header">
          <div class="header-bg-glow"></div>
          <div class="title-badge">⚡ Core Backend API Controller Engine</div>
          <h1>NEXUS REST API Server</h1>
          <p class="subtitle">
            Next-Generation Microservices & Database API Server powering NEXUS Smart Campus Platform.
            Real-time MySQL 8.0 persistence, Express REST APIs, JWT Security, and Google Gemini AI Services.
          </p>

          <div class="status-row">
            <div class="status-pill ${dbConnected ? 'online' : 'offline'}">
              <span class="dot ${dbConnected ? 'green' : 'red'}"></span>
              ${dbConnected ? 'Backend Operational & MySQL 8.0 Active' : 'Database Connection Warning'}
            </div>
            <div class="status-pill info">
              <span>🚀 Node.js Express Server • Port 5000</span>
            </div>
            <div class="status-pill info">
              <span>🛡️ 50MB Payload Stream Limit Active</span>
            </div>
          </div>

          <div class="btn-group">
            <a href="/api/auth/stats" target="_blank" class="btn btn-primary">📊 View Live Auth Stats JSON</a>
            <a href="/api/db-status" target="_blank" class="btn btn-secondary">🗄️ Inspect MySQL Tables (/api/db-status)</a>
            <a href="/api/health" target="_blank" class="btn btn-secondary">❤️ System Health Check (/api/health)</a>
          </div>
        </div>

        <!-- LIVE DATABASE STATS GRID -->
        <div class="section-title">
          <span>📊 Live Database Record Statistics</span>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Students</div>
            <div class="stat-val">${stats.students}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Faculty Members</div>
            <div class="stat-val">${stats.faculties}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Parents</div>
            <div class="stat-val">${stats.parents}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Alumni</div>
            <div class="stat-val">${stats.alumni}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Administrators</div>
            <div class="stat-val">${stats.administrators}</div>
          </div>
        </div>

        <!-- ACTIVE API MODULES GRID -->
        <div class="section-title">
          <span>🔌 Active Backend Microservice Modules</span>
        </div>
        <div class="routes-grid">
          <div class="route-card">
            <div class="route-header">
              <span class="route-name">/api/auth</span>
              <span class="route-badge">POST / PUT / GET</span>
            </div>
            <div class="route-desc">Authentication, RBAC registration for Students, Faculty, Parents, Alumni, Admins, Profile updates & Student Profile retrieval.</div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <span class="route-name">/api/academics</span>
              <span class="route-badge">GET / POST</span>
            </div>
            <div class="route-desc">Academics management, student class schedule, subjects timetable conversion, and exam marks.</div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <span class="route-name">/api/attendance</span>
              <span class="route-badge">GET / POST</span>
            </div>
            <div class="route-desc">Real-time student & faculty attendance tracking, class roll calls, and percentage statistics.</div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <span class="route-name">/api/student-safety</span>
              <span class="route-badge">GET / POST</span>
            </div>
            <div class="route-desc">Student safety grievance reporting, confidential SOS helpdesk, and campus voice portal.</div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <span class="route-name">/api/connections</span>
              <span class="route-badge">GET / POST</span>
            </div>
            <div class="route-desc">Campus social network, student feeds, interest groups, peer networking, and community updates.</div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <span class="route-name">/api/student-utilities</span>
              <span class="route-badge">GET / POST</span>
            </div>
            <div class="route-desc">Student utilities, quick notes manager, self-testing toolbox, and AI productivity workspace.</div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <span class="route-name">/api/faculty</span>
              <span class="route-badge">GET / POST</span>
            </div>
            <div class="route-desc">Faculty workspace, class management, student directory sync, attendance entry, and utilities.</div>
          </div>
        </div>

        <!-- CREDITS FOOTER -->
        <div class="credits-card">
          <div class="credits-title">NEXUS Smart Campus Platform</div>
          <div class="credits-authors">Designed and Developed by Ketan Channa and Nitin Kumar</div>
          <div class="credits-sub">High-Performance Full-Stack Educational Platform • Express.js REST Engine & Node.js Microservices</div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint with HTML Dashboard support
app.get('/api/health', (req: Request, res: Response) => {
  const healthData = {
    status: 'success',
    message: 'NEXUS Smart Campus Backend API Server Operational',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  const isHtmlRequested = req.query.format === 'html' || req.headers.accept?.includes('text/html');

  if (isHtmlRequested && req.query.format !== 'json') {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NEXUS | System Health Check</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background: #06050e;
            color: #f8fafc;
            padding: 2.5rem 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-image: 
              radial-gradient(circle at 10% 20%, rgba(225, 29, 72, 0.15), transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(147, 51, 234, 0.15), transparent 40%);
          }
          .container { max-width: 900px; width: 100%; margin: 0 auto; }
          .header {
            background: rgba(15, 12, 35, 0.8);
            border: 1px solid rgba(225, 29, 72, 0.3);
            border-radius: 2rem;
            padding: 2.5rem;
            backdrop-filter: blur(16px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            margin-bottom: 2rem;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 1rem;
            border-radius: 9999px;
            background: rgba(225, 29, 72, 0.15);
            border: 1px solid rgba(225, 29, 72, 0.3);
            color: #fb7185;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 2.25rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #ffffff, #fb7185, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p { color: #94a3b8; font-size: 0.9rem; }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.25rem;
            margin-bottom: 2rem;
          }
          .card {
            background: rgba(20, 16, 48, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            padding: 1.5rem;
            backdrop-filter: blur(12px);
          }
          .card-title { font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
          .card-val { font-size: 1.5rem; font-weight: 900; color: #ffffff; margin-top: 0.4rem; font-family: 'JetBrains Mono', monospace; }

          .json-box {
            background: rgba(10, 8, 26, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            padding: 1.5rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            color: #34d399;
            overflow-x: auto;
            white-space: pre-wrap;
            margin-bottom: 2rem;
          }
          .btn-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
          .btn {
            padding: 0.6rem 1.25rem;
            border-radius: 1rem;
            font-size: 0.825rem;
            font-weight: 700;
            text-decoration: none;
            color: white;
            background: #e11d48;
            transition: background 0.2s;
          }
          .btn:hover { background: #be123c; }
          .btn-outline { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #cbd5e1; }
          .btn-outline:hover { background: rgba(255, 255, 255, 0.15); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">❤️ System Diagnostics</div>
            <h1>NEXUS Server Health & Performance</h1>
            <p>Real-Time Node.js Engine Status, Memory Consumption & Server Diagnostics.</p>
            
            <div class="btn-row">
              <a href="http://localhost:5000" class="btn btn-outline">⬅️ Back to Server Control Panel</a>
              <a href="/api/health?format=json" class="btn">Raw JSON View (?format=json)</a>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Server Operational Status</div>
              <div class="card-val" style="color: #34d399;">200 OK (Healthy)</div>
            </div>

            <div class="card">
              <div class="card-title">Continuous Uptime</div>
              <div class="card-val">${healthData.uptime}</div>
            </div>

            <div class="card">
              <div class="card-title">Heap Memory Used</div>
              <div class="card-val">${healthData.memory.heapUsed}</div>
            </div>

            <div class="card">
              <div class="card-title">Heap Total Reserved</div>
              <div class="card-val">${healthData.memory.heapTotal}</div>
            </div>

            <div class="card">
              <div class="card-title">RSS Memory Footprint</div>
              <div class="card-val">${healthData.memory.rss}</div>
            </div>

            <div class="card">
              <div class="card-title">Environment</div>
              <div class="card-val" style="color: #c084fc;">${healthData.environment}</div>
            </div>
          </div>

          <div style="font-weight: 800; margin-bottom: 0.75rem; color: #e2e8f0; font-size: 0.95rem;">Raw Diagnostics Stream (JSON):</div>
          <div class="json-box">${JSON.stringify(healthData, null, 2)}</div>
        </div>
      </body>
      </html>
    `);
    return;
  }

  res.status(200).json(healthData);
});

// Database status & tables inspection endpoint with HTML Inspector support
app.get('/api/db-status', async (req: Request, res: Response) => {
  try {
    const isInitialized = await initializeDatabaseSchema();
    if (!isInitialized) {
      res.status(503).json({
        status: 'error',
        message: 'MySQL database disconnected or port 3306 unreachable.',
      });
      return;
    }

    const [rows]: any = await pool.query('SHOW TABLES');
    const dbName = process.env.DB_NAME || 'nexus_campus_db';

    const tablesList = rows.map((r: any) => Object.values(r)[0]);

    const isHtmlRequested = req.query.format === 'html' || req.headers.accept?.includes('text/html');

    if (isHtmlRequested && req.query.format !== 'json') {
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NEXUS | MySQL Database Inspector</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              background: #06050e;
              color: #f8fafc;
              padding: 2.5rem 1.5rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              background-image: 
                radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.15), transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.15), transparent 40%);
            }
            .container { max-width: 900px; width: 100%; margin: 0 auto; }
            .header {
              background: rgba(15, 12, 35, 0.8);
              border: 1px solid rgba(16, 185, 129, 0.3);
              border-radius: 2rem;
              padding: 2.5rem;
              backdrop-filter: blur(16px);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
              margin-bottom: 2rem;
            }
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.4rem 1rem;
              border-radius: 9999px;
              background: rgba(16, 185, 129, 0.15);
              border: 1px solid rgba(16, 185, 129, 0.3);
              color: #34d399;
              font-size: 0.75rem;
              font-weight: 800;
              text-transform: uppercase;
              margin-bottom: 1rem;
            }
            h1 {
              font-size: 2.25rem;
              font-weight: 900;
              margin-bottom: 0.5rem;
              background: linear-gradient(135deg, #ffffff, #34d399, #818cf8);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p { color: #94a3b8; font-size: 0.9rem; }
            
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
              gap: 1.25rem;
              margin-bottom: 2rem;
            }
            .card {
              background: rgba(20, 16, 48, 0.7);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 1.5rem;
              padding: 1.5rem;
              backdrop-filter: blur(12px);
              transition: transform 0.2s, border-color 0.2s;
            }
            .card:hover { transform: translateY(-4px); border-color: rgba(16, 185, 129, 0.4); }
            .card-title { font-size: 1.1rem; font-weight: 800; color: #34d399; font-family: 'JetBrains Mono', monospace; }
            .card-sub { font-size: 0.8rem; color: #94a3b8; margin-top: 0.4rem; }

            .json-box {
              background: rgba(10, 8, 26, 0.9);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 1.5rem;
              padding: 1.5rem;
              font-family: 'JetBrains Mono', monospace;
              font-size: 0.85rem;
              color: #f472b6;
              overflow-x: auto;
              white-space: pre-wrap;
              margin-bottom: 2rem;
            }
            .btn-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
            .btn {
              padding: 0.6rem 1.25rem;
              border-radius: 1rem;
              font-size: 0.825rem;
              font-weight: 700;
              text-decoration: none;
              color: white;
              background: #059669;
              transition: background 0.2s;
            }
            .btn:hover { background: #047857; }
            .btn-outline { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #cbd5e1; }
            .btn-outline:hover { background: rgba(255, 255, 255, 0.15); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="badge">🗄️ Database Schema Inspector</div>
              <h1>NEXUS MySQL Tables & Database Control</h1>
              <p>Active Database: <strong style="color: #34d399; font-family: monospace;">${dbName}</strong> • Host: <span style="color: #c084fc;">localhost:3306</span></p>
              
              <div class="btn-row">
                <a href="http://localhost:5000" class="btn btn-outline">⬅️ Back to Server Control Panel</a>
                <a href="/api/db-status?format=json" class="btn">Raw JSON View (?format=json)</a>
              </div>
            </div>

            <div style="font-weight: 800; margin-bottom: 0.75rem; color: #e2e8f0; font-size: 0.95rem;">Active MySQL Tables in Database (${tablesList.length} Tables):</div>
            <div class="grid">
              ${tablesList.map((t: string) => `
                <div class="card">
                  <div class="card-title">📋 ${t}</div>
                  <div class="card-sub">Active Table in ${dbName}</div>
                </div>
              `).join('')}
            </div>

            <div style="font-weight: 800; margin-bottom: 0.75rem; color: #e2e8f0; font-size: 0.95rem;">Raw Response Stream (JSON):</div>
            <div class="json-box">${JSON.stringify({ status: 'success', database: dbName, tables: rows }, null, 2)}</div>
          </div>
        </body>
        </html>
      `);
      return;
    }

    res.status(200).json({
      status: 'success',
      database: dbName,
      tables: rows,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

const startServer = async (port: number) => {
  await initializeDatabaseSchema();

  const httpServer = http.createServer(app);
  initSocketServer(httpServer);

  const server = httpServer.listen(port, () => {
    console.log(`🚀 NEXUS Backend Server running on http://localhost:${port}`);
    console.log(`⚡ Socket.IO Realtime Engine listening on http://localhost:${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is occupied, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
    }
  });
};

startServer(DEFAULT_PORT);

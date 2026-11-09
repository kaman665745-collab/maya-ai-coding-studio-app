export interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  files: Record<string, string>;
  activeFile: string;
}

export const STARTER_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'react-vite',
    name: 'React 19 + Tailwind Studio App',
    category: 'Full-Stack Web',
    description: 'Clean monochrome application with state management, modular components, and Tailwind styling.',
    activeFile: 'src/App.tsx',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Maya React App</title>
  </head>
  <body class="bg-black text-white antialiased">
    <div id="root"></div>
  </body>
</html>`,
      'src/App.tsx': `export default function App() {
  const [count, setCount] = React.useState(0);
  const [tasks, setTasks] = React.useState([
    { id: 1, title: 'Architect modular backend API', done: true },
    { id: 2, title: 'Integrate Monaco editor & preview', done: true },
    { id: 3, title: 'Connect 8 autonomous AI agents', done: false },
  ]);
  const [newTask, setNewTask] = React.useState('');

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), title: newTask.trim(), done: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-6 font-mono flex flex-col items-center justify-center">
      <div className="max-w-md w-full border border-neutral-800 bg-[#121212] rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
            <h1 className="font-bold text-sm tracking-widest uppercase">MAYA RUNTIME</h1>
          </div>
          <span className="text-xs text-neutral-400">v2.4.0</span>
        </div>

        <div className="mb-6 bg-black border border-neutral-800 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400">STATE COUNTER</p>
            <p className="text-3xl font-extrabold tracking-tight mt-1">{count}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setCount(count - 1)}
              className="px-3 py-1.5 border border-neutral-700 hover:border-neutral-500 rounded text-xs transition"
            >
              -1
            </button>
            <button
              onClick={() => setCount(count + 1)}
              className="px-3 py-1.5 bg-white text-black font-semibold rounded text-xs hover:bg-neutral-200 transition"
            >
              +1
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xs uppercase text-neutral-400 tracking-wider mb-3">Project Sprints</h2>
          <form onSubmit={addTask} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add sprint item..."
              className="flex-1 bg-black border border-neutral-800 px-3 py-1.5 rounded text-xs text-white focus:outline-none focus:border-neutral-500"
            />
            <button type="submit" className="px-3 py-1.5 bg-white text-black text-xs font-semibold rounded hover:bg-neutral-200">
              Add
            </button>
          </form>

          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex items-center justify-between p-2.5 rounded bg-black border border-neutral-900 hover:border-neutral-800 cursor-pointer text-xs"
              >
                <span className={task.done ? 'line-through text-neutral-500' : 'text-neutral-200'}>
                  {task.title}
                </span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-neutral-800 text-neutral-400">
                  {task.done ? 'Completed' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}`,
      'src/style.css': `@import "tailwindcss";`,
      'package.json': `{
  "name": "maya-react-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`,
    },
  },
  {
    id: 'dashboard',
    name: 'Developer Metrics Dashboard',
    category: 'SaaS & Analytics',
    description: 'High-density developer analytics workspace with throughput charts, health monitors, and telemetry.',
    activeFile: 'src/App.tsx',
    files: {
      'src/App.tsx': `export default function App() {
  const [metricPeriod, setMetricPeriod] = React.useState('7d');

  const stats = [
    { label: 'API Deployments', value: '1,429', change: '+14.2%' },
    { label: 'Autonomous Fixes', value: '384', change: '+28.5%' },
    { label: 'Avg Build Time', value: '264ms', change: '-18.0%' },
    { label: 'Test Pass Rate', value: '99.8%', change: '+0.2%' },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">ENGINEERING TELEMETRY</h1>
            <p className="text-xs text-neutral-400 mt-1">Real-time build pipeline & autonomous agent metrics</p>
          </div>
          <div className="flex bg-[#121212] border border-neutral-800 rounded-lg p-1 text-xs">
            {['24h', '7d', '30d'].map((p) => (
              <button
                key={p}
                onClick={() => setMetricPeriod(p)}
                className={'px-3 py-1 rounded font-mono transition ' + (metricPeriod === p ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white')}
              >
                {p}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-[#121212] border border-neutral-800 p-4 rounded-xl">
              <span className="text-[11px] font-mono uppercase text-neutral-400">{s.label}</span>
              <div className="text-2xl font-bold tracking-tight mt-1">{s.value}</div>
              <div className="text-xs font-mono text-emerald-400 mt-2">{s.change} vs prev</div>
            </div>
          ))}
        </div>

        <div className="bg-[#121212] border border-neutral-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-4">Autonomous Agent Activity Stream</h2>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 bg-black border border-neutral-900 rounded-lg">
              <span className="text-neutral-300">Architect Agent: Decomposed schema & migration plan</span>
              <span className="text-neutral-500">2 mins ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black border border-neutral-900 rounded-lg">
              <span className="text-neutral-300">Debugging Agent: Detected undefined variable in handlers.ts & auto-fixed</span>
              <span className="text-neutral-500">14 mins ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black border border-neutral-900 rounded-lg">
              <span className="text-neutral-300">Security Agent: Verified no hardcoded tokens or secrets in commit #a1b2</span>
              <span className="text-neutral-500">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
      'styles.css': `body { margin: 0; }`,
    },
  },
  {
    id: 'portfolio',
    name: 'Minimalist Engineering Portfolio',
    category: 'Showcase',
    description: 'Ultra-clean black and white personal engineer portfolio with project cards and terminal modal.',
    activeFile: 'src/App.tsx',
    files: {
      'src/App.tsx': `export default function App() {
  const projects = [
    { title: 'Maya AI Studio', desc: 'Autonomous coding platform with multi-agent orchestration.', tag: 'Full-Stack' },
    { title: 'VectorFlow ORM', desc: 'Zero-latency pgvector query engine with schema inference.', tag: 'Database' },
    { title: 'HyperScale Micro-VM', desc: 'Secure web sandboxing with WebAssembly isolates.', tag: 'Systems' },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-neutral-200 font-sans p-8 md:p-16 max-w-4xl mx-auto">
      <header className="mb-12 border-b border-neutral-800 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Alex Thorne</h1>
        <p className="text-sm text-neutral-400 font-mono mt-2">Principal Systems & AI Infrastructure Engineer</p>
        <p className="text-sm text-neutral-300 mt-4 leading-relaxed max-w-2xl">
          Crafting low-latency developer environments, autonomous agent systems, and resilient distributed databases.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-6">Selected Architecture</h2>
        <div className="grid gap-4">
          {projects.map((p, i) => (
            <div key={i} className="border border-neutral-800 bg-[#121212] p-5 rounded-xl hover:border-neutral-600 transition">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-white">{p.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-700 text-neutral-400">{p.tag}</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}`,
    },
  },
  {
    id: 'canvas-game',
    name: '2D Cyber Arcade Game',
    category: 'Interactive & Games',
    description: 'Playable 2D retro arcade dodge game built with HTML5 Canvas and responsive touch/keyboard controls.',
    activeFile: 'index.html',
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cyber Dodge 2D</title>
  <style>
    body { margin: 0; background: #050505; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: monospace; }
    canvas { border: 1px solid #333; background: #000; border-radius: 8px; box-shadow: 0 0 20px rgba(255,255,255,0.05); }
    .hud { margin-top: 10px; font-size: 14px; color: #aaa; }
  </style>
</head>
<body>
  <div class="hud">Use [A/D] or [Left/Right] arrows to dodge asteroids. Score: <span id="score">0</span></div>
  <canvas id="game" width="480" height="400"></canvas>
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');

    let player = { x: 220, y: 350, size: 20, speed: 6 };
    let enemies = [];
    let score = 0;
    let gameOver = false;
    let keys = {};

    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);

    function spawnEnemy() {
      if (gameOver) return;
      enemies.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        size: 15 + Math.random() * 15,
        speed: 2 + Math.random() * 3
      });
      setTimeout(spawnEnemy, 600);
    }
    spawnEnemy();

    function update() {
      if (gameOver) return;

      if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x = Math.max(0, player.x - player.speed);
      if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x = Math.min(canvas.width - player.size, player.x + player.speed);

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += e.speed;

        // Collision check
        if (
          player.x < e.x + e.size &&
          player.x + player.size > e.x &&
          player.y < e.y + e.size &&
          player.y + player.size > e.y
        ) {
          gameOver = true;
        }

        if (e.y > canvas.height) {
          enemies.splice(i, 1);
          score += 10;
          scoreEl.innerText = score;
        }
      }
    }

    function draw() {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Player
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.x, player.y, player.size, player.size);

      // Enemies
      ctx.fillStyle = '#888888';
      for (const e of enemies) {
        ctx.fillRect(e.x, e.y, e.size, e.size);
      }

      if (gameOver) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CRASHED! REFRESH TO RETRY', canvas.width / 2, canvas.height / 2);
      }
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`,
    },
  },
];

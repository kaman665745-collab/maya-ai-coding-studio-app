export interface PreviewBundleOptions {
  files: Record<string, string>;
  title?: string;
  theme?: 'dark' | 'light';
}

/**
 * Generates an executable, self-contained HTML document for the iframe preview sandbox.
 * Handles plain HTML/CSS/JS, as well as React/JSX/TSX apps with Tailwind CSS, error boundary,
 * and bidirectional console log forwarding.
 */
export function generatePreviewHtml({
  files,
  title = 'Maya Live Preview',
  theme = 'dark',
}: PreviewBundleOptions): string {
  // Extract all CSS files
  const cssBlocks: string[] = [];
  for (const [path, content] of Object.entries(files)) {
    if (path.endsWith('.css')) {
      cssBlocks.push(`/* ${path} */\n${content}`);
    }
  }

  // Detect React / JSX project
  const isReact = Object.keys(files).some((p) =>
    p.endsWith('.tsx') ||
    p.endsWith('.jsx') ||
    (files[p] && (files[p].includes('from "react"') || files[p].includes("from 'react'") || files[p].includes('React.')))
  );

  // Script to intercept console logs and runtime errors and post to parent
  const consoleForwarder = `
<script>
(function() {
  function sendLog(type, args) {
    try {
      var messages = Array.from(args).map(function(arg) {
        if (arg instanceof Error) return (arg.stack || arg.message);
        if (typeof arg === 'object') {
          try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
        }
        return String(arg);
      }).join(' ');
      window.parent.postMessage({ type: 'MAYA_PREVIEW_CONSOLE', level: type, text: messages, timestamp: Date.now() }, '*');
    } catch(e) {}
  }

  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;
  var origInfo = console.info;

  console.log = function() { origLog.apply(console, arguments); sendLog('log', arguments); };
  console.warn = function() { origWarn.apply(console, arguments); sendLog('warn', arguments); };
  console.error = function() { origError.apply(console, arguments); sendLog('error', arguments); };
  console.info = function() { origInfo.apply(console, arguments); sendLog('info', arguments); };

  window.addEventListener('error', function(event) {
    var errorMsg = event.message + (event.filename ? (' at ' + event.filename + ':' + event.lineno) : '');
    sendLog('error', [errorMsg]);
    
    // Display visual error fallback in case DOM is empty
    var root = document.getElementById('root') || document.body;
    if (root && (!root.children || root.children.length === 0 || root.innerText.trim() === '')) {
      var errBox = document.createElement('div');
      errBox.style.cssText = 'padding: 24px; font-family: monospace; background: #180505; color: #ff6b6b; border: 1px solid #7f1d1d; border-radius: 8px; margin: 16px; font-size: 13px; line-height: 1.5;';
      errBox.innerHTML = '<h3 style="margin-top:0; color:#ef4444; font-size: 15px;">Preview Runtime Exception</h3><p>' + escapeHtml(errorMsg) + '</p><p style="color:#a1a1aa; font-size:11px;">Fix the defect in the code editor or click "AI Repair" to resolve automatically.</p>';
      root.appendChild(errBox);
    }
  });

  window.addEventListener('unhandledrejection', function(event) {
    var reason = event.reason ? (event.reason.stack || event.reason.message || String(event.reason)) : 'Unknown rejection';
    sendLog('error', ['Unhandled Promise Rejection: ' + reason]);
  });

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
</script>
`;

  if (isReact) {
    // Find App component code
    const appCode =
      files['src/App.tsx'] ||
      files['src/App.jsx'] ||
      files['App.tsx'] ||
      files['App.jsx'] ||
      files['src/main.tsx'] ||
      `
      function App() {
        return (
          <div className="p-8 text-center text-white">
            <h1 className="text-2xl font-bold">Maya Project</h1>
            <p className="text-zinc-400 mt-2">Edit src/App.tsx to see live changes.</p>
          </div>
        );
      }
    `;

    // Also collect any other components/utilities in project (e.g. components/Header.tsx)
    const extraComponentCodes: string[] = [];
    for (const [path, content] of Object.entries(files)) {
      if (
        (path.endsWith('.tsx') || path.endsWith('.jsx') || path.endsWith('.ts') || path.endsWith('.js')) &&
        path !== 'src/App.tsx' &&
        path !== 'src/App.jsx' &&
        path !== 'App.tsx' &&
        path !== 'App.jsx' &&
        !path.endsWith('.test.ts') &&
        !path.endsWith('.test.tsx') &&
        !path.includes('drizzle.config')
      ) {
        // Clean imports/exports from supporting components so they evaluate in browser Babel scope
        const cleaned = content
          .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
          .replace(/export\s+default\s+function\s+(\w+)/g, 'function $1')
          .replace(/export\s+default\s+\w+;?/g, '')
          .replace(/export\s+(?:const|let|var|function|class)\s+/g, (m) => m.replace('export ', ''));
        extraComponentCodes.push(`// --- ${path} ---\n${cleaned}`);
      }
    }

    // Clean App.tsx code
    let sanitizedAppCode = appCode
      .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
      .replace(/export\s+default\s+function(?:\s+(\w+))?/g, (_m, name) => `function ${name || 'App'}`)
      .replace(/export\s+default\s+\w+;?/g, '')
      .replace(/export\s+(?:const|let|var|function|class)\s+/g, (m) => m.replace('export ', ''));

    // Ensure App component identifier exists
    if (!sanitizedAppCode.includes('function App') && !sanitizedAppCode.includes('const App')) {
      sanitizedAppCode += `\nconst App = typeof Main !== 'undefined' ? Main : () => React.createElement('div', { className: 'p-6 text-white' }, 'Maya Preview Ready');`;
    }

    return `<!DOCTYPE html>
<html lang="en" class="${theme === 'dark' ? 'dark' : ''}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: {} }
    };
  </script>
  <!-- React 18 & Babel Standalone CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      background-color: ${theme === 'dark' ? '#080808' : '#ffffff'};
      color: ${theme === 'dark' ? '#f4f4f5' : '#18181b'};
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    ${cssBlocks.join('\n')}
  </style>
  ${consoleForwarder}
</head>
<body>
  <div id="root">
    <div style="display:flex; align-items:center; justify-content:center; height:100vh; color:#71717a; font-family:monospace; font-size:12px;">
      Loading Maya Runtime...
    </div>
  </div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;

    // Error boundary wrapper component
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      componentDidCatch(error, errorInfo) {
        console.error("Component Crash:", error, errorInfo);
      }
      render() {
        if (this.state.hasError) {
          return (
            <div style={{ padding: 24, margin: 16, background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: 8, color: '#fca5a5', fontFamily: 'monospace', fontSize: 13 }}>
              <h2 style={{ margin: '0 0 8px 0', color: '#f87171', fontSize: 15 }}>React Runtime Error</h2>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#fef2f2' }}>{this.state.error?.stack || this.state.error?.message}</pre>
            </div>
          );
        }
        return this.props.children;
      }
    }

    try {
      ${extraComponentCodes.join('\n\n')}

      ${sanitizedAppCode}

      const container = document.getElementById('root');
      if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        );
      }
    } catch(err) {
      console.error("Babel Execution Error:", err);
      const container = document.getElementById('root');
      if (container) {
        container.innerHTML = '<div style="padding:24px; margin:16px; background:#1c0a0a; border:1px solid #7f1d1d; border-radius:8px; color:#fca5a5; font-family:monospace; font-size:13px;"><h2 style="color:#f87171; font-size:15px; margin-top:0;">Compilation / Syntax Error</h2><pre style="white-space:pre-wrap;">' + String(err.message || err) + '</pre></div>';
      }
    }
  </script>
</body>
</html>`;
  }

  // Vanilla HTML / JS Project
  const userHtml = files['index.html'] || files['public/index.html'] || '';
  const jsFiles: string[] = [];
  for (const [path, content] of Object.entries(files)) {
    if (path.endsWith('.js') && !path.includes('node_modules')) {
      jsFiles.push(`// ${path}\n${content}`);
    }
  }

  if (userHtml) {
    let processed = userHtml;
    // Inject CSS
    if (cssBlocks.length > 0) {
      const styleTag = `<style>\n${cssBlocks.join('\n')}\n</style>`;
      processed = processed.includes('</head>')
        ? processed.replace('</head>', `${styleTag}</head>`)
        : `${styleTag}${processed}`;
    }
    // Inject console forwarder
    processed = processed.includes('</head>')
      ? processed.replace('</head>', `${consoleForwarder}</head>`)
      : `${consoleForwarder}${processed}`;

    // Inject JS
    if (jsFiles.length > 0) {
      const scriptTag = `<script>\n${jsFiles.join('\n')}\n</script>`;
      processed = processed.includes('</body>')
        ? processed.replace('</body>', `${scriptTag}</body>`)
        : `${processed}${scriptTag}`;
    }
    return processed;
  }

  // Default Vanilla Shell
  return `<!DOCTYPE html>
<html lang="en" class="${theme === 'dark' ? 'dark' : ''}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: ${theme === 'dark' ? '#080808' : '#ffffff'};
      color: ${theme === 'dark' ? '#f4f4f5' : '#18181b'};
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 1rem;
    }
    ${cssBlocks.join('\n')}
  </style>
  ${consoleForwarder}
</head>
<body>
  <div id="app"></div>
  <script>
    try {
      ${jsFiles.join('\n')}
    } catch(err) {
      console.error("Script Execution Error:", err);
    }
  </script>
</body>
</html>`;
}

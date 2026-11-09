import JSZip from 'jszip';

export interface UnpackedProject {
  files: Record<string, string>;
  manifest?: {
    name?: string;
    description?: string;
    entry?: string;
  };
}

/**
 * Packs virtual files into a downloadable ZIP archive
 */
export async function packProjectToZip(files: Record<string, string>): Promise<Blob> {
  const zip = new JSZip();

  for (const [filePath, content] of Object.entries(files)) {
    // Avoid leading slashes in ZIP
    const normalized = filePath.replace(/^[/\\]+/, '');
    zip.file(normalized, content);
  }

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/**
 * Unpacks an uploaded ZIP file and extracts valid text/source files safely
 */
export async function unpackProjectFromZip(data: ArrayBuffer | Blob): Promise<UnpackedProject> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(data);
  const files: Record<string, string> = {};

  for (const [relativePath, zipEntry] of Object.entries(loaded.files)) {
    // Ignore directories
    if (zipEntry.dir) continue;

    // Safety checks against directory traversal
    if (relativePath.includes('..') || relativePath.startsWith('/') || relativePath.startsWith('\\')) {
      continue;
    }

    // Skip git internal files or system clutter
    if (relativePath.startsWith('.git/') || relativePath.includes('__MACOSX') || relativePath.endsWith('.DS_Store')) {
      continue;
    }

    try {
      const content = await zipEntry.async('string');
      files[relativePath] = content;
    } catch {
      // Skip binary unreadable files
    }
  }

  // Detect project name from package.json if present
  let manifestName = 'Imported Project';
  if (files['package.json']) {
    try {
      const pkg = JSON.parse(files['package.json']);
      if (pkg.name) manifestName = pkg.name;
    } catch {}
  }

  return {
    files,
    manifest: {
      name: manifestName,
    },
  };
}

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');

/** Build a tree of { name, path, children? } for the docs folder. */
function buildTree(dirPath: string, relativePath = ''): { name: string; path: string; children?: { name: string; path: string; children?: unknown[] }[] }[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const result: { name: string; path: string; children?: { name: string; path: string; children?: unknown[] }[] }[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      result.push({
        name: entry.name,
        path: relPath,
        children: buildTree(fullPath, relPath),
      });
    } else if (entry.name.endsWith('.md')) {
      result.push({ name: entry.name, path: relPath });
    }
  }

  return result.sort((a, b) => {
    const aIsDir = 'children' in a && a.children;
    const bIsDir = 'children' in b && b.children;
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function GET(request: NextRequest) {
  try {
    if (!fs.existsSync(DOCS_DIR)) {
      return NextResponse.json({ tree: [], error: 'Docs folder not found' }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file');

    if (filePath) {
      // Return content of a single file (path must be under docs, no traversal)
      const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
      const fullPath = path.join(DOCS_DIR, normalized);
      if (!fullPath.startsWith(path.resolve(DOCS_DIR))) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
      if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      const content = fs.readFileSync(fullPath, 'utf-8');
      return NextResponse.json({ content });
    }

    const tree = buildTree(DOCS_DIR);
    return NextResponse.json({ tree });
  } catch (err) {
    console.error('Docs API error:', err);
    return NextResponse.json({ error: 'Failed to read docs' }, { status: 500 });
  }
}

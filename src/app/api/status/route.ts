import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function checkServerOnline(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2500); // 2500ms timeout for external servers
    await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return true; // If resolved, connection succeeded
  } catch (error: any) {
    // If it's a HTTP error status, fetch still resolves. It only throws on network failure.
    // If fetch failed due to other statuses or aborted, check if connection was established.
    // In most cases, connection refused or timeout throws and is caught here.
    return false;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId') || 'project-demo';
  
  // Prevent directory traversal by sanitizing projectId
  const safeProjectId = projectId.replace(/[^a-zA-Z0-9-_]/g, '');

  // Read targetUrl from projects.json
  let targetUrl = 'http://localhost:4000/api/health';
  try {
    const projectsPath = path.join(process.cwd(), 'data', 'projects.json');
    const projectsContent = await fs.readFile(projectsPath, 'utf-8');
    const projects = JSON.parse(projectsContent);
    const proj = projects.find((p: any) => p.id === safeProjectId);
    if (proj && proj.targetUrl) {
      targetUrl = proj.targetUrl;
    }
  } catch (e) {
    // ignore
  }

  // Check if API server is online
  const isApiOnline = await checkServerOnline(targetUrl);

  const filePath = path.join(process.cwd(), 'data', safeProjectId, 'results.json');
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json({
      ...data,
      isApiOnline,
      targetUrl
    });
  } catch (error) {
    return NextResponse.json({
      lastUpdated: new Date().toISOString(),
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      },
      mockServerStatus: isApiOnline ? "running" : "stopped",
      isApiOnline,
      targetUrl,
      runs: []
    });
  }
}

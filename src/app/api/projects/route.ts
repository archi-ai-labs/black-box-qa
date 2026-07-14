import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function getProjectLastUpdated(projectId: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'data', projectId, 'results.json');
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.lastUpdated || new Date(0).toISOString();
  } catch (error) {
    return new Date(0).toISOString();
  }
}

export async function GET() {
  const filePath = path.join(process.cwd(), 'data', 'projects.json');
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const projects = JSON.parse(fileContent);
    
    const projectsWithTime = await Promise.all(
      projects.map(async (project: any) => {
        const lastUpdated = await getProjectLastUpdated(project.id);
        return { ...project, lastUpdated };
      })
    );

    // Sort projects by lastUpdated descending (newest first)
    projectsWithTime.sort((a, b) => {
      const timeA = new Date(a.lastUpdated).getTime();
      const timeB = new Date(b.lastUpdated).getTime();
      return timeB - timeA;
    });

    return NextResponse.json(projectsWithTime);
  } catch (error) {
    return NextResponse.json([
      {
        id: "project-demo",
        name: "Demo Register API",
        description: "API đăng ký tài khoản giả lập trên Mock Server.",
        lastUpdated: new Date(0).toISOString()
      }
    ]);
  }
}


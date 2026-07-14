import { NextResponse } from 'next/server';
import { execFile } from 'child_process';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Missing projectId" }, { status: 400 });
    }

    // Input sanitization: Allow only alphanumeric, dash, and underscore
    if (!/^[a-zA-Z0-9-_]+$/.test(projectId)) {
      return NextResponse.json({ success: false, error: "Invalid projectId format" }, { status: 400 });
    }

    // Execute the test runner safely using execFile to prevent shell injection
    execFile('npm', ['run', 'run-tests', '--', `--project=${projectId}`], (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running tests for ${projectId}: ${error.message}`);
        return;
      }
      console.log(`Tests stdout (${projectId}): ${stdout}`);
      if (stderr) {
        console.error(`Tests stderr (${projectId}): ${stderr}`);
      }
    });

    return NextResponse.json({ success: true, message: `Tests triggered successfully for ${projectId}` });
  } catch (error) {
    console.error("Failed to trigger tests", error);
    return NextResponse.json({ success: false, error: "Failed to trigger tests" }, { status: 500 });
  }
}

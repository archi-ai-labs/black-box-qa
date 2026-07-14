export interface Project {
  id: string;
  name: string;
  description: string;
  targetUrl?: string;
  type?: 'api' | 'ui-test';
  lastUpdated?: string;
}

export interface TestCase {
  name: string;
  catalog?: string;
  status: 'PASS' | 'FAIL';
  statusCode: number;
  durationMs: number;
  request: {
    method: string;
    url: string;
    body: any;
  };
  response: {
    status: number;
    body: any;
  };
  errorMsg?: string;
  passCondition?: string;
  screenshot?: string;
  logs?: string[];
}

export interface TestRun {
  id: string;
  timestamp: string;
  status?: 'running' | 'completed' | 'pending';
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  performance?: {
    avgResponseTimeMs: number;
    maxResponseTimeMs: number;
    p95ResponseTimeMs: number;
    slowestEndpoint: string;
  };
  autoFixReport?: {
    status: 'healed' | 'failed' | 'skipped';
    title: string;
    details: string;
    modifiedFiles: string[];
  };
  testCases: TestCase[];
}

export interface StatusData {
  lastUpdated: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  mockServerStatus: 'running' | 'stopped';
  isApiOnline?: boolean;
  targetUrl?: string;
  runs: TestRun[];
}

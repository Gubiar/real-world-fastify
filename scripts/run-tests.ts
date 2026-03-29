import { spawnSync } from 'node:child_process';

type RunOptions = {
  env?: NodeJS.ProcessEnv;
  capture?: boolean;
};

type CommandResult = {
  status: number;
  stdout: string;
};

class CommandFailure extends Error {
  public readonly status: number;

  constructor(status: number) {
    super(`Command failed with status ${status}`);
    this.status = status;
  }
}

function run(command: string, args: string[], options: RunOptions = {}): string {
  const result = spawnSync(command, args, {
    env: options.env ?? process.env,
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    throw new CommandFailure(result.status ?? 1);
  }

  if (!options.capture) {
    return '';
  }

  return (result.stdout ?? '').trim();
}

function runStatus(command: string, args: string[], env: NodeJS.ProcessEnv): CommandResult {
  const result = spawnSync(command, args, {
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32'
  });
  return {
    status: result.status ?? 1,
    stdout: (result.stdout ?? '').trim()
  };
}

function waitForDbHealthy(containerName: string, dockerCmd: string): void {
  const retries = 60;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const check = runStatus(dockerCmd, ['exec', containerName, 'pg_isready', '-U', 'postgres', '-d', 'fastify_db'], process.env);
    if (check.status === 0) {
      return;
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }
  throw new CommandFailure(1);
}

function getMappedPort(containerName: string, dockerCmd: string): string {
  const output = run(dockerCmd, ['port', containerName, '5432/tcp'], { capture: true });
  const mapped = output.split(':').at(-1)?.trim();
  if (!mapped) {
    throw new CommandFailure(1);
  }
  return mapped;
}

function removeContainer(containerName: string, dockerCmd: string): void {
  runStatus(dockerCmd, ['rm', '-f', containerName], process.env);
}

function main(): void {
  const dockerCmd = 'docker';
  const pnpmCmd = 'pnpm';
  const containerName = `fastify-test-db-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  try {
    run(dockerCmd, [
      'run',
      '-d',
      '--name',
      containerName,
      '-e',
      'POSTGRES_USER=postgres',
      '-e',
      'POSTGRES_PASSWORD=postgres',
      '-e',
      'POSTGRES_DB=fastify_db',
      '-p',
      '127.0.0.1::5432',
      'postgres:16.0-alpine'
    ]);

    waitForDbHealthy(containerName, dockerCmd);

    const mappedPort = getMappedPort(containerName, dockerCmd);
    const testEnv: NodeJS.ProcessEnv = {
      ...process.env,
      DATABASE_URL: `postgresql://postgres:postgres@localhost:${mappedPort}/fastify_db`,
      JWT_SECRET: 'test-jwt-secret-for-testing-only',
      NODE_ENV: 'test'
    };

    run(pnpmCmd, ['db:migrate'], { env: testEnv });
    run(pnpmCmd, ['exec', 'jest'], { env: testEnv });
  } catch (error) {
    if (error instanceof CommandFailure) {
      process.exit(error.status);
    }
    process.exit(1);
  } finally {
    removeContainer(containerName, dockerCmd);
  }
}

main();

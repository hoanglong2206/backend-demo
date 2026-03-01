import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /**
   * GET /api/v1/health
   *
   * Basic liveness check — returns 200 if the server is running.
   * Used by load balancers, Kubernetes probes, and monitoring systems.
   */
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

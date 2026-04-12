interface BreakerState {
  failures: number;
  lastFailure: number;
  status: 'closed' | 'open' | 'half-open';
}

const breakers: Record<string, BreakerState> = {};

const THRESHOLD = 5;
const TIMEOUT = 60000; // 1 minute

export const executeWithBreaker = async (serviceName: string, fn: () => Promise<any>) => {
  if (!breakers[serviceName]) {
    breakers[serviceName] = { failures: 0, lastFailure: 0, status: 'closed' };
  }

  const state = breakers[serviceName];

  if (state.status === 'open') {
    if (Date.now() - state.lastFailure > TIMEOUT) {
      state.status = 'half-open';
    } else {
      throw new Error(`Circuit breaker for ${serviceName} is OPEN. Falling back to local.`);
    }
  }

  try {
    const result = await fn();
    state.failures = 0;
    state.status = 'closed';
    return result;
  } catch (error) {
    state.failures++;
    state.lastFailure = Date.now();
    if (state.failures >= THRESHOLD) {
      state.status = 'open';
    }
    throw error;
  }
};

export const getBreakerStatus = () => breakers;

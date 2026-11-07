interface RouteMatchContext {
  currentPath: string;
  targetUrl: string;
  isSoftNavigation: boolean;
}

interface InterceptingRouteDefinition {
  routePattern: string;
  slotName: string;
  targetPattern: string;
}

interface EvaluatedRouteResult {
  isIntercepted: boolean;
  activeSlot?: string;
  renderedPattern: string;
  params: Record<string, string>;
}

const evaluateInterceptingRoute = (
  definition: InterceptingRouteDefinition,
  context: RouteMatchContext
): EvaluatedRouteResult => {
  const matchPattern = (pattern: string, url: string): Record<string, string> | null => {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const patSegs = pattern.split('/').filter(Boolean);
    const urlSegs = cleanUrl.split('/').filter(Boolean);

    if (patSegs.length !== urlSegs.length) {
      return null;
    }

    const params: Record<string, string> = {};
    for (let i = 0; i < patSegs.length; i++) {
      const p = patSegs[i];
      const u = urlSegs[i];
      if (p.startsWith('[') && p.endsWith(']')) {
        const key = p.slice(1, -1);
        params[key] = u;
      } else if (p !== u) {
        return null;
      }
    }

    return params;
  };

  const matchedParams = matchPattern(definition.targetPattern, context.targetUrl);
  if (!matchedParams) {
    return {
      isIntercepted: false,
      renderedPattern: definition.targetPattern,
      params: {},
    };
  }

  // If hard navigation (refresh / direct load), intercepting routes do NOT trigger
  if (!context.isSoftNavigation) {
    return {
      isIntercepted: false,
      renderedPattern: definition.targetPattern,
      params: matchedParams,
    };
  }

  // Determine interception token
  const tokenMatch = definition.routePattern.match(/\((\.\.\.\.|\.\.\)\(\.\.|\.\.|\.\))/);
  const token = tokenMatch ? tokenMatch[1] : null;

  const currentSegs = context.currentPath.split('/').filter(Boolean);
  const targetSegs = context.targetUrl.split('?')[0].split('/').filter(Boolean);
  const targetParentDepth = Math.max(0, targetSegs.length - 1);

  let satisfiesToken = false;
  if (token === '....' || token === '...') {
    // Intercept from root: valid anywhere in app
    satisfiesToken = true;
  } else if (token === '.') {
    // Same directory level
    satisfiesToken = currentSegs.length === targetParentDepth;
  } else if (token === '..') {
    // One level above current path's directory
    satisfiesToken = currentSegs.length >= 1;
  } else if (token === '..)(' || token === '..)(..') {
    // Two levels above
    satisfiesToken = currentSegs.length >= 2;
  } else {
    satisfiesToken = true;
  }

  if (satisfiesToken) {
    return {
      isIntercepted: true,
      activeSlot: definition.slotName,
      renderedPattern: definition.routePattern,
      params: matchedParams,
    };
  }

  return {
    isIntercepted: false,
    renderedPattern: definition.targetPattern,
    params: matchedParams,
  };
};


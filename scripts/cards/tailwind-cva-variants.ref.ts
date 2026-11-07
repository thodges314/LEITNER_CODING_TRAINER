type CvaClassValue = string | string[] | undefined | null | false;

interface CvaConfig {
  variants?: Record<string, Record<string, CvaClassValue>>;
  defaultVariants?: Record<string, string>;
  compoundVariants?: Array<Record<string, any>>;
}

type CvaProps = Record<string, any>;

function cva(
  base?: CvaClassValue,
  config: CvaConfig = {}
): (props?: CvaProps) => string {
  const { variants = {}, defaultVariants = {}, compoundVariants = [] } = config || {};

  function parseClasses(val: unknown): string[] {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.flatMap(parseClasses);
    }
    if (typeof val === 'string') {
      return val.trim().split(/\s+/).filter(Boolean);
    }
    return [];
  }

  return function (props: CvaProps = {}): string {
    const safeProps = props || {};
    const tokens: string[] = [];

    // 1. Base classes
    if (base) {
      tokens.push(...parseClasses(base));
    }

    // 2. Resolve active variants
    const resolved: Record<string, string | undefined> = {};
    for (const [vKey, vOptions] of Object.entries(variants)) {
      const activeKey =
        safeProps[vKey] !== undefined ? String(safeProps[vKey]) : defaultVariants[vKey];
      resolved[vKey] = activeKey;

      if (activeKey !== undefined && vOptions && vOptions[activeKey] !== undefined) {
        tokens.push(...parseClasses(vOptions[activeKey]));
      }
    }

    // 3. Compound variants
    if (Array.isArray(compoundVariants)) {
      for (const cv of compoundVariants) {
        if (!cv || typeof cv !== 'object') continue;
        const cvClass = cv.className !== undefined ? cv.className : cv.class;
        let matches = true;

        for (const [k, expectedVal] of Object.entries(cv)) {
          if (k === 'className' || k === 'class') continue;
          if (resolved[k] !== expectedVal) {
            matches = false;
            break;
          }
        }

        if (matches && cvClass) {
          tokens.push(...parseClasses(cvClass));
        }
      }
    }

    // 4. Custom caller override classes
    const extra =
      safeProps.className !== undefined ? safeProps.className : safeProps.class;
    if (extra) {
      tokens.push(...parseClasses(extra));
    }

    return tokens.join(' ');
  };
}


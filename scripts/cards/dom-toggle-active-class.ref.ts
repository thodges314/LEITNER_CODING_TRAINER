interface ToggleBindingOptions {
  triggerId: string;
  targetId: string;
  activeClass?: string;
  initialExpanded?: boolean;
}

interface ToggleBindingController {
  isExpanded(): boolean;
  destroy(): void;
}

function bindClassToggle(options: ToggleBindingOptions): ToggleBindingController {
  const trigger = document.getElementById(options.triggerId);
  const target = document.getElementById(options.targetId);

  if (!trigger || !target) {
    throw new Error('Required element not found');
  }

  const activeClass = options.activeClass || 'active';
  const initialExpanded = Boolean(options.initialExpanded);

  if (initialExpanded) {
    target.classList.add(activeClass);
    trigger.setAttribute('aria-expanded', 'true');
  } else {
    target.classList.remove(activeClass);
    trigger.setAttribute('aria-expanded', 'false');
  }

  const handleClick = () => {
    const isNowActive = target.classList.toggle(activeClass);
    trigger.setAttribute('aria-expanded', String(isNowActive));
  };

  trigger.addEventListener('click', handleClick);

  return {
    isExpanded(): boolean {
      return target.classList.contains(activeClass);
    },
    destroy(): void {
      trigger.removeEventListener('click', handleClick);
    },
  };
}

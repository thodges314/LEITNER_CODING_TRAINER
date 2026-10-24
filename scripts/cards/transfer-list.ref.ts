interface TransferListResult {
  left: string[];
  right: string[];
  leftSelected: string[];
  rightSelected: string[];
  toggleLeft: (item: string) => void;
  toggleRight: (item: string) => void;
  moveRight: () => void;
  moveLeft: () => void;
  moveAllRight: () => void;
  moveAllLeft: () => void;
}

function useTransferList({
  initialLeft = [],
  initialRight = [],
}: {
  initialLeft?: string[];
  initialRight?: string[];
} = {}): TransferListResult {
  const [left, setLeft] = React.useState<string[]>(initialLeft);
  const [right, setRight] = React.useState<string[]>(initialRight);
  const [leftSelected, setLeftSelected] = React.useState<string[]>([]);
  const [rightSelected, setRightSelected] = React.useState<string[]>([]);

  const toggleLeft = React.useCallback((item: string): void => {
    setLeftSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }, []);

  const toggleRight = React.useCallback((item: string): void => {
    setRightSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }, []);

  const moveRight = React.useCallback((): void => {
    setLeft((prev) => prev.filter((item) => !leftSelected.includes(item)));
    setRight((prev) => [...prev, ...leftSelected]);
    setLeftSelected([]);
  }, [leftSelected]);

  const moveLeft = React.useCallback((): void => {
    setRight((prev) => prev.filter((item) => !rightSelected.includes(item)));
    setLeft((prev) => [...prev, ...rightSelected]);
    setRightSelected([]);
  }, [rightSelected]);

  const moveAllRight = React.useCallback((): void => {
    setRight((prev) => [...prev, ...left]);
    setLeft([]);
    setLeftSelected([]);
  }, [left]);

  const moveAllLeft = React.useCallback((): void => {
    setLeft((prev) => [...prev, ...right]);
    setRight([]);
    setRightSelected([]);
  }, [right]);

  return {
    left,
    right,
    leftSelected,
    rightSelected,
    toggleLeft,
    toggleRight,
    moveRight,
    moveLeft,
    moveAllRight,
    moveAllLeft,
  };
}

function useTransferList({ initialLeft = [], initialRight = [] } = {}) {
  const [left, setLeft] = React.useState(initialLeft);
  const [right, setRight] = React.useState(initialRight);
  const [leftSelected, setLeftSelected] = React.useState([]);
  const [rightSelected, setRightSelected] = React.useState([]);

  const toggleLeft = React.useCallback((item) => {
    setLeftSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }, []);

  const toggleRight = React.useCallback((item) => {
    setRightSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }, []);

  const moveRight = React.useCallback(() => {
    setLeft((prev) => prev.filter((item) => !leftSelected.includes(item)));
    setRight((prev) => [...prev, ...leftSelected]);
    setLeftSelected([]);
  }, [leftSelected]);

  const moveLeft = React.useCallback(() => {
    setRight((prev) => prev.filter((item) => !rightSelected.includes(item)));
    setLeft((prev) => [...prev, ...rightSelected]);
    setRightSelected([]);
  }, [rightSelected]);

  const moveAllRight = React.useCallback(() => {
    setRight((prev) => [...prev, ...left]);
    setLeft([]);
    setLeftSelected([]);
  }, [left]);

  const moveAllLeft = React.useCallback(() => {
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

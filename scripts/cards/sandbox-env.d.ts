// Ambient sandbox globals for IDE editing of scripts/cards/*.ref.ts
declare var React: any;
declare var ReactDOM: any;
declare var useState: <S = any>(initialState?: S | (() => S)) => [S, (value: S | ((prev: S) => S)) => void];
declare var useEffect: (effect: () => void | (() => void), deps?: readonly any[]) => void;
declare var useLayoutEffect: (effect: () => void | (() => void), deps?: readonly any[]) => void;
declare var useCallback: <T extends (...args: any[]) => any>(callback: T, deps: readonly any[]) => T;
declare var useMemo: <T>(factory: () => T, deps: readonly any[]) => T;
declare var useRef: <T = any>(initialValue?: T) => { current: T };
declare var useReducer: <R extends (state: any, action: any) => any, I = any>(
  reducer: R,
  initializerArg: I,
  initializer?: (arg: I) => any
) => [any, (action: any) => void];
declare var useContext: <T = any>(context: any) => T;
declare var createContext: <T = any>(defaultValue?: T) => any;
declare var memo: <T = any>(component: T, propsAreEqual?: (prev: any, next: any) => boolean) => T;
declare var forwardRef: <T = any, P = any>(render: (props: P, ref: any) => any) => any;
declare var useImperativeHandle: <T, R extends T>(ref: any, init: () => R, deps?: readonly any[]) => void;
declare var useId: () => string;
declare var useTransition: () => [boolean, (callback: () => void) => void];
declare var useDeferredValue: <T>(value: T) => T;
declare var useSyncExternalStore: <Snapshot>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot?: () => Snapshot
) => Snapshot;
declare var useOptimistic: <State, Action = State>(
  passthrough: State,
  reducer?: (state: State, optimisticValue: Action) => State
) => [State, (optimisticValue: Action) => void];
declare var useActionState: <State, Payload = any>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string
) => [state: Awaited<State>, dispatch: (payload?: Payload) => void, isPending: boolean];
declare var use: <T>(usable: Promise<T> | any) => T;
declare var Suspense: any;
declare var Fragment: any;
declare var Component: any;
declare var createPortal: (children: any, container: Element | DocumentFragment, key?: null | string) => any;
declare var flushSync: <R>(fn: () => R) => R;

declare namespace React {
  type ReactNode = any;
  type ReactElement<P = any> = any;
  type FC<P = {}> = (props: P) => any;
  type ComponentType<P = {}> = any;
  type CSSProperties = Record<string, string | number | undefined>;
  type Ref<T> = { current: T | null } | ((instance: T | null) => void) | null;
  type RefObject<T> = { current: T | null };
  type MutableRefObject<T> = { current: T };
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
  type FormEvent<T = Element> = any;
  type ChangeEvent<T = Element> = any;
  type MouseEvent<T = Element> = any;
  type KeyboardEvent<T = Element> = any;
  type FocusEvent<T = Element> = any;
  type PointerEvent<T = Element> = any;
  type DragEvent<T = Element> = any;
  type TouchEvent<T = Element> = any;
  type WheelEvent<T = Element> = any;
  type SyntheticEvent<T = Element> = any;
  type InputHTMLAttributes<T = Element> = Record<string, any>;
  type ButtonHTMLAttributes<T = Element> = Record<string, any>;
  type HTMLAttributes<T = Element> = Record<string, any>;
  type ErrorInfo = { componentStack?: string | null; [key: string]: any };
}

declare namespace JSX {
  type Element = any;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare var d3: any;
declare var $test: any;
declare var $dom: any;
declare var PGlite: any;
declare var graphql: any;
declare var buildSchema: any;
declare var parseGraphql: any;
declare var validateGraphql: any;
declare var Buffer: any;

declare class ListNode<T = any> {
  val: T;
  next: ListNode<T> | null;
  constructor(val?: T, next?: ListNode<T> | null);
}
declare class TreeNode<T = any> {
  val: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
  id?: string;
  label?: string;
  children?: TreeNode<T>[];
  [key: string]: any;
  constructor(val?: T, left?: TreeNode<T> | null, right?: TreeNode<T> | null);
}
declare class GraphNode<T = any> {
  val: T;
  neighbors: GraphNode<T>[];
  id?: string;
  label?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  [key: string]: any;
  constructor(val?: T, neighbors?: GraphNode<T>[]);
}
declare function list<T = any>(...vals: T[]): ListNode<T> | null;
declare function toArray<T = any>(node: ListNode<T> | null): T[];


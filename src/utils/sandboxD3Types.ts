/**
 * Ambient D3 types for the in-browser TypeScript sandbox (appended to sandbox-globals.d.ts).
 *
 * Goal: idiomatic typed D3 (`d3.pie<Slice>()`, `d3.stratify<Row>().id(d => d.id)`,
 * `d3.scaleLinear<string>()`) type-checks the way it does in a real project with @types/d3,
 * without bundling the 30+ @types/d3-* packages.
 *
 * Design rules (keep them when extending this file for new D3 cards):
 * 1. Mirror the @types/d3 names and generic parameters for the APIs the cards use, so learner
 *    muscle memory transfers to real projects (`d3.HierarchyNode<T>`, `d3.PieArcDatum<T>`, ...).
 * 2. Accurate return types (that is where inference helps the learner), lenient parameter types
 *    (accept `undefined`/`null` where @types/d3 would force a cast) so correct code is never rejected.
 * 3. Every builder/behaviour interface ends with `[key: string]: any`, and so does `D3Static`:
 *    an API that is not modelled here still works (it is simply untyped) instead of failing.
 * 4. Methods that take callbacks give the callback parameters real types, so `(d) => d.value`
 *    never trips noImplicitAny (TS7006).
 */
export const SANDBOX_D3_TYPES = `
  declare namespace d3 {
    type NumberValue = number | { valueOf(): number };
    type Primitive = string | number | boolean;
    type AttrValue = Primitive | null | undefined | ReadonlyArray<string | number>;
    type ValueFn<D, R> = (this: any, d: D, i: number, nodes: any[]) => R;

    // ---- d3-selection -------------------------------------------------------------------
    interface Selection<Datum = any> {
      select(selector: string | ValueFn<Datum, any>): Selection<Datum>;
      selectAll<NewDatum = any>(selector?: string | ValueFn<Datum, any>): Selection<NewDatum>;
      append(type: string | ValueFn<Datum, any>): Selection<Datum>;
      insert(type: string | ValueFn<Datum, any>, before?: string | ValueFn<Datum, any>): Selection<Datum>;
      attr(name: string): string;
      attr(name: string, value: AttrValue | ValueFn<Datum, AttrValue>): this;
      style(name: string): string;
      style(name: string, value: AttrValue | ValueFn<Datum, AttrValue>, priority?: 'important' | null): this;
      property(name: string): any;
      property(name: string, value: any): this;
      classed(names: string): boolean;
      classed(names: string, value: boolean | ValueFn<Datum, boolean>): this;
      text(): string;
      text(value: AttrValue | ValueFn<Datum, AttrValue>): this;
      html(): string;
      html(value: AttrValue | ValueFn<Datum, AttrValue>): this;
      datum(): Datum;
      datum<NewDatum>(value: NewDatum | ValueFn<Datum, NewDatum>): Selection<NewDatum>;
      data(): Datum[];
      data<NewDatum>(
        data: Iterable<NewDatum> | ArrayLike<NewDatum> | ValueFn<Datum, Iterable<NewDatum> | ArrayLike<NewDatum>>,
        key?: (this: any, d: any, i: number, groups: any) => string | number
      ): Selection<NewDatum>;
      enter(): Selection<Datum>;
      exit<OldDatum = Datum>(): Selection<OldDatum>;
      merge(other: Selection<any>): Selection<Datum>;
      join(
        enter: string | ((enter: Selection<Datum>) => any),
        update?: (update: Selection<Datum>) => any,
        exit?: (exit: Selection<Datum>) => any
      ): Selection<Datum>;
      on(typenames: string): any;
      on(typenames: string, listener: ((this: any, event: any, d: Datum) => void) | null, options?: any): this;
      dispatch(type: string, parameters?: any): this;
      call(fn: (selection: this, ...args: any[]) => any, ...args: any[]): this;
      each(fn: ValueFn<Datum, void>): this;
      filter(filter: string | ValueFn<Datum, boolean>): this;
      sort(comparator?: (a: Datum, b: Datum) => number): this;
      order(): this;
      raise(): this;
      lower(): this;
      remove(): this;
      clone(deep?: boolean): this;
      node(): any;
      nodes(): any[];
      size(): number;
      empty(): boolean;
      interrupt(name?: string): this;
      transition(nameOrTransition?: string | Transition<any>): Transition<Datum>;
      [key: string]: any;
    }

    // ---- d3-transition ------------------------------------------------------------------
    interface Transition<Datum = any> {
      select(selector: string | ValueFn<Datum, any>): Transition<Datum>;
      selectAll<NewDatum = any>(selector: string | ValueFn<Datum, any>): Transition<NewDatum>;
      attr(name: string, value: AttrValue | ValueFn<Datum, AttrValue>): this;
      attrTween(name: string, factory: ValueFn<Datum, (t: number) => string> | null): this;
      style(name: string, value: AttrValue | ValueFn<Datum, AttrValue>, priority?: 'important' | null): this;
      styleTween(name: string, factory: ValueFn<Datum, (t: number) => string> | null): this;
      text(value: AttrValue | ValueFn<Datum, AttrValue>): this;
      tween(name: string, factory: ValueFn<Datum, (t: number) => void> | null): this;
      duration(): number;
      duration(ms: number | ValueFn<Datum, number>): this;
      delay(): number;
      delay(ms: number | ValueFn<Datum, number>): this;
      ease(fn: (t: number) => number): this;
      on(typenames: string, listener: ((this: any, d: Datum, i: number, nodes: any[]) => void) | null): this;
      each(fn: ValueFn<Datum, void>): this;
      call(fn: (transition: this, ...args: any[]) => any, ...args: any[]): this;
      filter(filter: string | ValueFn<Datum, boolean>): this;
      remove(): this;
      transition(): Transition<Datum>;
      selection(): Selection<Datum>;
      end(): Promise<void>;
      node(): any;
      size(): number;
      [key: string]: any;
    }

    // ---- d3-scale -----------------------------------------------------------------------
    interface ScaleContinuousNumeric<Range = number, Output = Range> {
      (value: NumberValue): Output;
      invert(value: NumberValue): number;
      domain(): number[];
      domain(domain: Iterable<NumberValue | null | undefined>): this;
      range(): Range[];
      range(range: Iterable<Range>): this;
      rangeRound(range: Iterable<NumberValue>): this;
      clamp(): boolean;
      clamp(clamp: boolean): this;
      nice(count?: number): this;
      ticks(count?: number): number[];
      tickFormat(count?: number, specifier?: string): (d: NumberValue) => string;
      interpolate(interpolate: any): this;
      unknown(value: any): this;
      copy(): this;
      [key: string]: any;
    }
    type ScaleLinear<Range = number, Output = Range> = ScaleContinuousNumeric<Range, Output>;
    type ScalePower<Range = number, Output = Range> = ScaleContinuousNumeric<Range, Output>;
    type ScaleLogarithmic<Range = number, Output = Range> = ScaleContinuousNumeric<Range, Output>;

    interface ScaleTime<Range = number, Output = Range> {
      (value: Date | NumberValue): Output;
      invert(value: NumberValue): Date;
      domain(): Date[];
      domain(domain: Iterable<Date | NumberValue | null | undefined>): this;
      range(): Range[];
      range(range: Iterable<Range>): this;
      rangeRound(range: Iterable<NumberValue>): this;
      clamp(clamp: boolean): this;
      nice(count?: number): this;
      ticks(count?: number): Date[];
      tickFormat(count?: number, specifier?: string): (d: Date) => string;
      copy(): this;
      [key: string]: any;
    }

    interface ScaleBand<Domain = string> {
      (value: Domain): number | undefined;
      domain(): Domain[];
      domain(domain: Iterable<Domain>): this;
      range(): [number, number];
      range(range: Iterable<NumberValue>): this;
      rangeRound(range: Iterable<NumberValue>): this;
      round(round: boolean): this;
      padding(padding: number): this;
      paddingInner(padding: number): this;
      paddingOuter(padding: number): this;
      align(align: number): this;
      bandwidth(): number;
      step(): number;
      copy(): this;
      [key: string]: any;
    }
    type ScalePoint<Domain = string> = ScaleBand<Domain>;

    interface ScaleOrdinal<Domain = string, Range = string> {
      (value: Domain): Range;
      domain(): Domain[];
      domain(domain: Iterable<Domain>): this;
      range(): Range[];
      range(range: Iterable<Range>): this;
      unknown(value: Range): this;
      copy(): this;
      [key: string]: any;
    }

    interface ScaleSequential<Output = string> {
      (value: NumberValue): Output;
      domain(): [number, number];
      domain(domain: Iterable<NumberValue | null | undefined>): this;
      interpolator(interpolator: (t: number) => Output): this;
      clamp(clamp: boolean): this;
      copy(): this;
      [key: string]: any;
    }

    // ---- d3-axis ------------------------------------------------------------------------
    interface Axis {
      (context: any): void;
      scale(): any;
      scale(scale: any): this;
      ticks(...args: any[]): this;
      tickArguments(args: any[]): this;
      tickValues(values: Iterable<any> | null): this;
      tickFormat(format: ((d: any, i: number) => string) | null): this;
      tickSize(size: number): this;
      tickSizeInner(size: number): this;
      tickSizeOuter(size: number): this;
      tickPadding(padding: number): this;
      [key: string]: any;
    }

    // ---- d3-shape -----------------------------------------------------------------------
    type CurveFactory = { [key: string]: any };

    interface Line<Datum = any> {
      (data: Iterable<Datum> | Datum[]): string | null;
      x(x: number | ((d: Datum, i: number, data: Datum[]) => number)): this;
      y(y: number | ((d: Datum, i: number, data: Datum[]) => number)): this;
      defined(defined: boolean | ((d: Datum, i: number, data: Datum[]) => boolean)): this;
      curve(curve: CurveFactory): this;
      context(context: any): this;
      [key: string]: any;
    }

    interface Area<Datum = any> {
      (data: Iterable<Datum> | Datum[]): string | null;
      x(x: number | ((d: Datum, i: number, data: Datum[]) => number)): this;
      x0(x: number | ((d: Datum, i: number, data: Datum[]) => number)): this;
      x1(x: number | ((d: Datum, i: number, data: Datum[]) => number)): this;
      y(y: number | ((d: Datum, i: number, data: Datum[]) => number)): this;
      y0(y: number | ((d: Datum, i: number, data: Datum[]) => number)): this;
      y1(y: number | ((d: Datum, i: number, data: Datum[]) => number)): this;
      defined(defined: boolean | ((d: Datum, i: number, data: Datum[]) => boolean)): this;
      curve(curve: CurveFactory): this;
      [key: string]: any;
    }

    interface PieArcDatum<T = any> {
      data: T;
      value: number;
      index: number;
      startAngle: number;
      endAngle: number;
      padAngle: number;
    }

    interface Pie<Datum = any> {
      (data: Datum[]): PieArcDatum<Datum>[];
      value(value: number | ((d: Datum, i: number, data: Datum[]) => number)): this;
      sort(comparator: ((a: Datum, b: Datum) => number) | null): this;
      sortValues(comparator: ((a: number, b: number) => number) | null): this;
      startAngle(angle: number | ((data: Datum[]) => number)): this;
      endAngle(angle: number | ((data: Datum[]) => number)): this;
      padAngle(angle: number | ((data: Datum[]) => number)): this;
      [key: string]: any;
    }

    interface Arc<Datum = any> {
      (d: Datum, ...args: any[]): string | null;
      innerRadius(radius: number | ((d: Datum, ...args: any[]) => number)): this;
      outerRadius(radius: number | ((d: Datum, ...args: any[]) => number)): this;
      cornerRadius(radius: number | ((d: Datum, ...args: any[]) => number)): this;
      padAngle(angle: number | ((d: Datum, ...args: any[]) => number)): this;
      startAngle(angle: number | ((d: Datum, ...args: any[]) => number)): this;
      endAngle(angle: number | ((d: Datum, ...args: any[]) => number)): this;
      centroid(d: Datum, ...args: any[]): [number, number];
      context(context: any): this;
      [key: string]: any;
    }

    interface Link<LinkDatum = any, NodeDatum = any> {
      (d: LinkDatum): string | null;
      source(accessor: (d: LinkDatum) => NodeDatum): this;
      target(accessor: (d: LinkDatum) => NodeDatum): this;
      x(x: number | ((node: NodeDatum) => number)): this;
      y(y: number | ((node: NodeDatum) => number)): this;
      [key: string]: any;
    }

    // ---- d3-hierarchy -------------------------------------------------------------------
    interface HierarchyLink<Datum = any> {
      source: HierarchyNode<Datum>;
      target: HierarchyNode<Datum>;
    }

    interface HierarchyNode<Datum = any> {
      data: Datum;
      depth: number;
      height: number;
      parent: this | null;
      children?: this[];
      value?: number;
      id?: string;
      ancestors(): this[];
      descendants(): this[];
      leaves(): this[];
      links(): Array<{ source: this; target: this }>;
      path(target: this): this[];
      find(filter: (node: this) => boolean): this | undefined;
      sum(value: (d: Datum) => number): this;
      count(): this;
      sort(compare: (a: this, b: this) => number): this;
      each(fn: (node: this, i: number, thisNode: this) => void): this;
      eachBefore(fn: (node: this, i: number, thisNode: this) => void): this;
      eachAfter(fn: (node: this, i: number, thisNode: this) => void): this;
      copy(): this;
      [Symbol.iterator](): Iterator<this>;
      [key: string]: any;
    }
    interface HierarchyPointNode<Datum = any> extends HierarchyNode<Datum> {
      x: number;
      y: number;
    }
    interface HierarchyRectangularNode<Datum = any> extends HierarchyNode<Datum> {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    }
    interface HierarchyCircularNode<Datum = any> extends HierarchyNode<Datum> {
      x: number;
      y: number;
      r: number;
    }

    interface StratifyOperator<Datum = any> {
      (data: Datum[]): HierarchyNode<Datum>;
      id(id: (d: Datum, i: number, data: Datum[]) => string | null | undefined): this;
      parentId(parentId: (d: Datum, i: number, data: Datum[]) => string | null | undefined): this;
      path(path: ((d: Datum, i: number, data: Datum[]) => string) | null | undefined): this;
      [key: string]: any;
    }

    interface TreeLayout<Datum = any> {
      (root: HierarchyNode<Datum>): HierarchyPointNode<Datum>;
      size(size: [number, number] | null): this;
      nodeSize(size: [number, number] | null): this;
      separation(separation: (a: HierarchyPointNode<Datum>, b: HierarchyPointNode<Datum>) => number): this;
      [key: string]: any;
    }

    type PaddingValue<Datum = any> = number | ((node: HierarchyRectangularNode<Datum>) => number);
    interface TreemapLayout<Datum = any> {
      (root: HierarchyNode<Datum>): HierarchyRectangularNode<Datum>;
      size(size: [number, number]): this;
      round(round: boolean): this;
      tile(tile: any): this;
      padding(padding: PaddingValue<Datum>): this;
      paddingInner(padding: PaddingValue<Datum>): this;
      paddingOuter(padding: PaddingValue<Datum>): this;
      paddingTop(padding: PaddingValue<Datum>): this;
      paddingRight(padding: PaddingValue<Datum>): this;
      paddingBottom(padding: PaddingValue<Datum>): this;
      paddingLeft(padding: PaddingValue<Datum>): this;
      [key: string]: any;
    }

    interface PartitionLayout<Datum = any> {
      (root: HierarchyNode<Datum>): HierarchyRectangularNode<Datum>;
      size(size: [number, number]): this;
      round(round: boolean): this;
      padding(padding: number): this;
      [key: string]: any;
    }

    interface PackLayout<Datum = any> {
      (root: HierarchyNode<Datum>): HierarchyCircularNode<Datum>;
      size(size: [number, number]): this;
      radius(radius: ((node: HierarchyCircularNode<Datum>) => number) | null): this;
      padding(padding: number | ((node: HierarchyCircularNode<Datum>) => number)): this;
      [key: string]: any;
    }

    // ---- d3-quadtree --------------------------------------------------------------------
    interface Quadtree<Datum = any> {
      x(): (d: Datum) => number;
      x(x: (d: Datum) => number): this;
      y(): (d: Datum) => number;
      y(y: (d: Datum) => number): this;
      add(datum: Datum): this;
      addAll(data: Datum[]): this;
      remove(datum: Datum): this;
      removeAll(data: Datum[]): this;
      copy(): Quadtree<Datum>;
      root(): any;
      data(): Datum[];
      size(): number;
      extent(): [[number, number], [number, number]];
      extent(extent: [[number, number], [number, number]]): this;
      cover(x: number, y: number): this;
      find(x: number, y: number, radius?: number): Datum | undefined;
      /** node is a leaf ({ data, next? }) or an internal node (array of up to 4 children). */
      visit(callback: (node: any, x0: number, y0: number, x1: number, y1: number) => void | boolean): this;
      visitAfter(callback: (node: any, x0: number, y0: number, x1: number, y1: number) => void): this;
      [key: string]: any;
    }

    // ---- d3-force -----------------------------------------------------------------------
    interface SimulationNodeDatum {
      index?: number;
      x?: number;
      y?: number;
      vx?: number;
      vy?: number;
      fx?: number | null;
      fy?: number | null;
    }
    interface SimulationLinkDatum<NodeDatum> {
      source: NodeDatum | string | number;
      target: NodeDatum | string | number;
      index?: number;
    }
    interface Simulation<NodeDatum = SimulationNodeDatum> {
      nodes(): NodeDatum[];
      nodes(nodes: NodeDatum[]): this;
      force(name: string): any;
      force(name: string, force: any): this;
      alpha(): number;
      alpha(alpha: number): this;
      alphaMin(min: number): this;
      alphaDecay(decay: number): this;
      alphaTarget(target: number): this;
      velocityDecay(decay: number): this;
      randomSource(source: () => number): this;
      restart(): this;
      stop(): this;
      tick(iterations?: number): this;
      find(x: number, y: number, radius?: number): NodeDatum | undefined;
      on(typenames: string): any;
      on(typenames: string, listener: ((this: any) => void) | null): this;
      [key: string]: any;
    }
    type ForceValue<T> = number | ((d: T, i: number, data: T[]) => number);
    interface ForceLink<NodeDatum = any, LinkDatum = any> {
      (alpha: number): void;
      links(): LinkDatum[];
      links(links: LinkDatum[]): this;
      id(id: (node: NodeDatum, i: number, nodes: NodeDatum[]) => string | number): this;
      distance(distance: ForceValue<LinkDatum>): this;
      strength(strength: ForceValue<LinkDatum>): this;
      iterations(iterations: number): this;
      [key: string]: any;
    }
    interface ForceManyBody<NodeDatum = any> {
      (alpha: number): void;
      strength(strength: ForceValue<NodeDatum>): this;
      theta(theta: number): this;
      distanceMin(distance: number): this;
      distanceMax(distance: number): this;
      [key: string]: any;
    }
    interface ForceCenter {
      (alpha: number): void;
      x(x: number): this;
      y(y: number): this;
      strength(strength: number): this;
      [key: string]: any;
    }
    interface ForceCollide<NodeDatum = any> {
      (alpha: number): void;
      radius(radius: ForceValue<NodeDatum>): this;
      strength(strength: number): this;
      iterations(iterations: number): this;
      [key: string]: any;
    }
    interface ForcePosition<NodeDatum = any> {
      (alpha: number): void;
      x(x: ForceValue<NodeDatum>): this;
      y(y: ForceValue<NodeDatum>): this;
      strength(strength: ForceValue<NodeDatum>): this;
      [key: string]: any;
    }

    // ---- d3-delaunay --------------------------------------------------------------------
    interface Voronoi<P = any> {
      delaunay: Delaunay<P>;
      circumcenters: Float64Array;
      vectors: Float64Array;
      xmin: number;
      ymin: number;
      xmax: number;
      ymax: number;
      contains(i: number, x: number, y: number): boolean;
      neighbors(i: number): Iterable<number>;
      render(context?: any): string;
      renderBounds(context?: any): string;
      renderCell(i: number, context?: any): string;
      cellPolygon(i: number): Array<[number, number]> | null;
      cellPolygons(): Iterable<Array<[number, number]> & { index: number }>;
      update(): this;
      [key: string]: any;
    }
    interface Delaunay<P = any> {
      points: Float64Array;
      halfedges: Int32Array;
      hull: Uint32Array;
      triangles: Uint32Array;
      inedges: Int32Array;
      find(x: number, y: number, i?: number): number;
      neighbors(i: number): Iterable<number>;
      voronoi(bounds?: [number, number, number, number]): Voronoi<P>;
      render(context?: any): string;
      renderHull(context?: any): string;
      renderTriangle(i: number, context?: any): string;
      renderPoints(context?: any, radius?: number): string;
      trianglePolygons(): Iterable<Array<[number, number]>>;
      update(): this;
      [key: string]: any;
    }
    interface DelaunayStatic {
      new <P = any>(points: ArrayLike<number>): Delaunay<P>;
      from<P = any>(
        points: Iterable<P> | ArrayLike<P>,
        getX?: (p: P, i: number, points: any) => number,
        getY?: (p: P, i: number, points: any) => number
      ): Delaunay<P>;
    }

    // ---- d3-brush / d3-zoom / d3-drag ---------------------------------------------------
    type BrushSelection = [number, number] | [[number, number], [number, number]];
    interface BrushBehavior<Datum = any> {
      (group: any): void;
      extent(extent: [[number, number], [number, number]]): this;
      on(typenames: string, listener: ((this: any, event: any, d: Datum) => void) | null): this;
      move(group: any, selection: BrushSelection | null, event?: any): void;
      clear(group: any, event?: any): void;
      filter(filter: (this: any, event: any, d: Datum) => boolean): this;
      handleSize(size: number): this;
      keyModifiers(modifiers: boolean): this;
      [key: string]: any;
    }
    interface ZoomTransform {
      readonly k: number;
      readonly x: number;
      readonly y: number;
      apply(point: [number, number]): [number, number];
      applyX(x: number): number;
      applyY(y: number): number;
      invert(point: [number, number]): [number, number];
      invertX(x: number): number;
      invertY(y: number): number;
      rescaleX<S>(scale: S): S;
      rescaleY<S>(scale: S): S;
      scale(k: number): ZoomTransform;
      translate(x: number, y: number): ZoomTransform;
      toString(): string;
    }
    interface ZoomBehavior<Datum = any> {
      (selection: any): void;
      scaleExtent(extent: [number, number]): this;
      translateExtent(extent: [[number, number], [number, number]]): this;
      extent(extent: [[number, number], [number, number]]): this;
      on(typenames: string, listener: ((this: any, event: any, d: Datum) => void) | null): this;
      filter(filter: (this: any, event: any, d: Datum) => boolean): this;
      transform(selection: any, transform: ZoomTransform | ((this: any, event: any, d: Datum) => ZoomTransform)): void;
      scaleBy(selection: any, k: number): void;
      scaleTo(selection: any, k: number): void;
      translateBy(selection: any, x: number, y: number): void;
      translateTo(selection: any, x: number, y: number): void;
      [key: string]: any;
    }
    interface DragBehavior<Datum = any> {
      (selection: any): void;
      on(typenames: string, listener: ((this: any, event: any, d: Datum) => void) | null): this;
      subject(subject: (this: any, event: any, d: Datum) => any): this;
      container(container: any): this;
      filter(filter: (this: any, event: any, d: Datum) => boolean): this;
      [key: string]: any;
    }

    // ---- d3-geo / d3-contour ------------------------------------------------------------
    interface GeoProjection {
      (point: [number, number]): [number, number] | null;
      invert?(point: [number, number]): [number, number] | null;
      scale(): number;
      scale(scale: number): this;
      translate(): [number, number];
      translate(point: [number, number]): this;
      center(): [number, number];
      center(point: [number, number]): this;
      rotate(): [number, number, number];
      rotate(angles: [number, number] | [number, number, number]): this;
      fitSize(size: [number, number], object: any): this;
      fitExtent(extent: [[number, number], [number, number]], object: any): this;
      fitWidth(width: number, object: any): this;
      precision(precision: number): this;
      clipAngle(angle: number | null): this;
      [key: string]: any;
    }
    interface GeoPath {
      (object: any, ...args: any[]): string | null;
      projection(projection: GeoProjection | null): this;
      context(context: any): this;
      pointRadius(radius: number | ((...args: any[]) => number)): this;
      area(object: any): number;
      bounds(object: any): [[number, number], [number, number]];
      centroid(object: any): [number, number];
      [key: string]: any;
    }
    interface ContourMultiPolygon {
      type: 'MultiPolygon';
      value: number;
      coordinates: number[][][][];
    }
    interface ContourDensity<Datum = any> {
      (data: Datum[]): ContourMultiPolygon[];
      x(x: (d: Datum) => number): this;
      y(y: (d: Datum) => number): this;
      weight(weight: (d: Datum) => number): this;
      size(size: [number, number]): this;
      cellSize(cellSize: number): this;
      thresholds(thresholds: number | number[] | ((values: number[]) => number[])): this;
      bandwidth(bandwidth: number): this;
      [key: string]: any;
    }
    interface Contours {
      (values: number[]): ContourMultiPolygon[];
      size(size: [number, number]): this;
      smooth(smooth: boolean): this;
      thresholds(thresholds: number | number[] | ((values: number[]) => number[])): this;
      contour(values: number[], threshold: number): ContourMultiPolygon;
      [key: string]: any;
    }

    interface Bisector<T, U> {
      left(array: ArrayLike<T>, x: U, lo?: number, hi?: number): number;
      right(array: ArrayLike<T>, x: U, lo?: number, hi?: number): number;
      center(array: ArrayLike<T>, x: U, lo?: number, hi?: number): number;
    }

    // ---- the d3 namespace object --------------------------------------------------------
    interface D3Static {
      // selection
      select<Datum = any>(selector: string | any): Selection<Datum>;
      selectAll<Datum = any>(selector: string | any): Selection<Datum>;
      create<Datum = any>(name: string): Selection<Datum>;
      pointer(event: any, target?: any): [number, number];
      pointers(event: any, target?: any): Array<[number, number]>;

      // arrays and statistics
      min(iterable: Iterable<number | null | undefined>): number | undefined;
      min<T, U extends number | string | Date>(iterable: Iterable<T>, accessor: (d: T, i: number, array: Iterable<T>) => U | null | undefined): U | undefined;
      max(iterable: Iterable<number | null | undefined>): number | undefined;
      max<T, U extends number | string | Date>(iterable: Iterable<T>, accessor: (d: T, i: number, array: Iterable<T>) => U | null | undefined): U | undefined;
      extent(iterable: Iterable<number | null | undefined>): [number, number] | [undefined, undefined];
      extent<T, U extends number | string | Date>(iterable: Iterable<T>, accessor: (d: T, i: number, array: Iterable<T>) => U | null | undefined): [U, U] | [undefined, undefined];
      sum(iterable: Iterable<number | null | undefined>): number;
      sum<T>(iterable: Iterable<T>, accessor: (d: T, i: number, array: Iterable<T>) => number | null | undefined): number;
      mean(iterable: Iterable<number | null | undefined>): number | undefined;
      mean<T>(iterable: Iterable<T>, accessor: (d: T, i: number, array: Iterable<T>) => number | null | undefined): number | undefined;
      median(iterable: Iterable<number | null | undefined>): number | undefined;
      median<T>(iterable: Iterable<T>, accessor: (d: T, i: number, array: Iterable<T>) => number | null | undefined): number | undefined;
      deviation(iterable: Iterable<number | null | undefined>): number | undefined;
      deviation<T>(iterable: Iterable<T>, accessor: (d: T, i: number, array: Iterable<T>) => number | null | undefined): number | undefined;
      quantile(iterable: Iterable<number | null | undefined>, p: number): number | undefined;
      quantile<T>(iterable: Iterable<T>, p: number, accessor: (d: T, i: number, array: Iterable<T>) => number | null | undefined): number | undefined;
      range(stop: number): number[];
      range(start: number, stop: number, step?: number): number[];
      ticks(start: number, stop: number, count: number): number[];
      ascending(a: any, b: any): number;
      descending(a: any, b: any): number;
      bisector<T, U>(accessor: (d: T) => U): Bisector<T, U>;
      bisector<T, U>(comparator: (a: T, b: U) => number): Bisector<T, U>;
      bisectLeft(array: ArrayLike<number>, x: number, lo?: number, hi?: number): number;
      bisectRight(array: ArrayLike<number>, x: number, lo?: number, hi?: number): number;
      group<T, K>(iterable: Iterable<T>, key: (d: T) => K): Map<K, T[]>;
      group<T, K1, K2>(iterable: Iterable<T>, key1: (d: T) => K1, key2: (d: T) => K2): Map<K1, Map<K2, T[]>>;
      groups<T, K>(iterable: Iterable<T>, key: (d: T) => K): Array<[K, T[]]>;
      rollup<T, R, K>(iterable: Iterable<T>, reduce: (values: T[]) => R, key: (d: T) => K): Map<K, R>;
      rollups<T, R, K>(iterable: Iterable<T>, reduce: (values: T[]) => R, key: (d: T) => K): Array<[K, R]>;
      index<T, K>(iterable: Iterable<T>, key: (d: T) => K): Map<K, T>;
      cumsum(iterable: Iterable<number | null | undefined>): Float64Array;
      shuffle<T>(array: T[], lo?: number, hi?: number): T[];

      // scales
      scaleLinear<Range = number, Output = Range>(): ScaleLinear<Range, Output>;
      scaleSqrt<Range = number, Output = Range>(): ScalePower<Range, Output>;
      scalePow<Range = number, Output = Range>(): ScalePower<Range, Output>;
      scaleLog<Range = number, Output = Range>(): ScaleLogarithmic<Range, Output>;
      scaleTime<Range = number, Output = Range>(): ScaleTime<Range, Output>;
      scaleUtc<Range = number, Output = Range>(): ScaleTime<Range, Output>;
      scaleBand<Domain = string>(): ScaleBand<Domain>;
      scalePoint<Domain = string>(): ScalePoint<Domain>;
      scaleOrdinal<Domain = string, Range = string>(range?: Iterable<Range>): ScaleOrdinal<Domain, Range>;
      scaleSequential<Output = string>(interpolator?: (t: number) => Output): ScaleSequential<Output>;

      // axes
      axisTop(scale: any): Axis;
      axisRight(scale: any): Axis;
      axisBottom(scale: any): Axis;
      axisLeft(scale: any): Axis;

      // shapes
      line<Datum = any>(x?: (d: Datum, i: number, data: Datum[]) => number, y?: (d: Datum, i: number, data: Datum[]) => number): Line<Datum>;
      area<Datum = any>(): Area<Datum>;
      pie<Datum = any>(): Pie<Datum>;
      arc<Datum = any>(): Arc<Datum>;
      linkHorizontal<LinkDatum = any, NodeDatum = any>(): Link<LinkDatum, NodeDatum>;
      linkVertical<LinkDatum = any, NodeDatum = any>(): Link<LinkDatum, NodeDatum>;
      curveLinear: CurveFactory;
      curveMonotoneX: CurveFactory;
      curveMonotoneY: CurveFactory;
      curveBasis: CurveFactory;
      curveCardinal: CurveFactory;
      curveCatmullRom: CurveFactory;
      curveNatural: CurveFactory;
      curveStep: CurveFactory;
      curveStepAfter: CurveFactory;
      curveStepBefore: CurveFactory;

      // hierarchy
      hierarchy<Datum = any>(data: Datum, children?: (d: Datum) => Iterable<Datum> | null | undefined): HierarchyNode<Datum>;
      stratify<Datum = any>(): StratifyOperator<Datum>;
      tree<Datum = any>(): TreeLayout<Datum>;
      cluster<Datum = any>(): TreeLayout<Datum>;
      treemap<Datum = any>(): TreemapLayout<Datum>;
      partition<Datum = any>(): PartitionLayout<Datum>;
      pack<Datum = any>(): PackLayout<Datum>;
      treemapSquarify: any;
      treemapBinary: any;
      treemapDice: any;
      treemapSlice: any;
      treemapSliceDice: any;
      treemapResquarify: any;

      // spatial
      quadtree<Datum = any>(data?: Datum[], x?: (d: Datum) => number, y?: (d: Datum) => number): Quadtree<Datum>;
      Delaunay: DelaunayStatic;

      // force
      forceSimulation<NodeDatum = SimulationNodeDatum>(nodes?: NodeDatum[]): Simulation<NodeDatum>;
      forceLink<NodeDatum = any, LinkDatum = any>(links?: LinkDatum[]): ForceLink<NodeDatum, LinkDatum>;
      forceManyBody<NodeDatum = any>(): ForceManyBody<NodeDatum>;
      forceCenter(x?: number, y?: number): ForceCenter;
      forceCollide<NodeDatum = any>(radius?: ForceValue<NodeDatum>): ForceCollide<NodeDatum>;
      forceX<NodeDatum = any>(x?: ForceValue<NodeDatum>): ForcePosition<NodeDatum>;
      forceY<NodeDatum = any>(y?: ForceValue<NodeDatum>): ForcePosition<NodeDatum>;

      // interaction
      brush<Datum = any>(): BrushBehavior<Datum>;
      brushX<Datum = any>(): BrushBehavior<Datum>;
      brushY<Datum = any>(): BrushBehavior<Datum>;
      brushSelection(node: any): BrushSelection | null;
      zoom<Element = any, Datum = any>(): ZoomBehavior<Datum>;
      zoomIdentity: ZoomTransform;
      zoomTransform(node: any): ZoomTransform;
      drag<Element = any, Datum = any>(): DragBehavior<Datum>;

      // geo and contours
      geoPath(projection?: GeoProjection | null, context?: any): GeoPath;
      geoMercator(): GeoProjection;
      geoEqualEarth(): GeoProjection;
      geoNaturalEarth1(): GeoProjection;
      geoOrthographic(): GeoProjection;
      geoAlbers(): GeoProjection;
      geoAlbersUsa(): GeoProjection;
      geoEquirectangular(): GeoProjection;
      geoGraticule10(): any;
      contours(): Contours;
      contourDensity<Datum = any>(): ContourDensity<Datum>;

      // colour, interpolation, easing, formatting
      schemeCategory10: string[];
      schemeTableau10: string[];
      schemeSet1: string[];
      schemeSet2: string[];
      schemeSet3: string[];
      schemePastel1: string[];
      schemeDark2: string[];
      schemeAccent: string[];
      interpolateViridis(t: number): string;
      interpolateInferno(t: number): string;
      interpolateMagma(t: number): string;
      interpolatePlasma(t: number): string;
      interpolateTurbo(t: number): string;
      interpolateBlues(t: number): string;
      interpolateReds(t: number): string;
      interpolateGreens(t: number): string;
      interpolateRdYlBu(t: number): string;
      interpolate(a: any, b: any): (t: number) => any;
      interpolateNumber(a: number, b: number): (t: number) => number;
      interpolateRgb(a: string, b: string): (t: number) => string;
      color(specifier: string): any;
      rgb(...args: any[]): any;
      hsl(...args: any[]): any;
      easeLinear(t: number): number;
      easeCubic(t: number): number;
      easeCubicOut(t: number): number;
      easeCubicInOut(t: number): number;
      easeQuadInOut(t: number): number;
      easeElastic(t: number): number;
      easeElasticOut(t: number): number;
      easeElasticInOut(t: number): number;
      easeBounce(t: number): number;
      easeBounceOut(t: number): number;
      easeBounceInOut(t: number): number;
      easeBack(t: number): number;
      easeBackOut(t: number): number;
      easeBackInOut(t: number): number;
      format(specifier: string): (n: NumberValue) => string;
      timeFormat(specifier: string): (date: Date) => string;
      timeParse(specifier: string): (dateString: string) => Date | null;
      utcFormat(specifier: string): (date: Date) => string;
      utcParse(specifier: string): (dateString: string) => Date | null;

      [key: string]: any;
    }
  }
  declare var d3: d3.D3Static;
  declare module 'd3' {
    const d3Module: d3.D3Static;
    export = d3Module;
  }
`;

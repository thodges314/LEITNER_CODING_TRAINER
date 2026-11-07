import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by Next.js harness', ...o });

export default {
  'next-client-boundary-guard': [
    r(
      '{ title: "Next.js", count: 10, ok: true, d: new Date("2026-01-01T00:00:00.000Z") }',
      '{"errors":[],"sanitizedProps":{"count":10,"d":"2026-01-01T00:00:00.000Z","ok":true,"title":"Next.js"},"valid":true}',
      'Passes valid primitive and date props, serializing Date to ISO string'
    ),
    r(
      '{ handler: () => {}, id: "btn-1" }',
      '{"errors":[{"message":"Functions cannot be passed across RSC client boundaries. Pass an identifier or Server Action reference instead.","path":"handler","type":"function"}],"valid":false}',
      'Rejects function prop with explanatory error and path'
    ),
    r(
      '(() => { class Customer { name = "Alice"; } return { user: new Customer() }; })()',
      '{"errors":[{"message":"Class instance Customer cannot be passed to Client Components. Convert to a plain object.","path":"user","type":"class_instance"}],"valid":false}',
      'Rejects non-plain class instance prop'
    ),
    r(
      '(() => { const o = { name: "loop" }; o.self = o; return { item: o }; })()',
      '{"errors":[{"message":"Circular reference detected at item.self.","path":"item.self","type":"circular_reference"}],"valid":false}',
      'Rejects circular reference graph'
    ),
  ],

  'next-parallel-intercepting-routes': [
    r(
      '{ routePattern: "/feed/@modal/(..)photo/[id]", slotName: "modal", targetPattern: "/photo/[id]" }, { currentPath: "/feed", targetUrl: "/photo/42", isSoftNavigation: true }',
      '{"activeSlot":"modal","isIntercepted":true,"params":{"id":"42"},"renderedPattern":"/feed/@modal/(..)photo/[id]"}',
      'Intercepts soft navigation into parallel modal slot with extracted params'
    ),
    r(
      '{ routePattern: "/feed/@modal/(..)photo/[id]", slotName: "modal", targetPattern: "/photo/[id]" }, { currentPath: "/feed", targetUrl: "/photo/42", isSoftNavigation: false }',
      '{"isIntercepted":false,"params":{"id":"42"},"renderedPattern":"/photo/[id]"}',
      'Renders canonical standalone route on hard navigation without intercepting'
    ),
    r(
      '{ routePattern: "/dashboard/@drawer/(...)photo/[id]", slotName: "drawer", targetPattern: "/photo/[id]" }, { currentPath: "/dashboard/stats", targetUrl: "/photo/99", isSoftNavigation: true }',
      '{"activeSlot":"drawer","isIntercepted":true,"params":{"id":"99"},"renderedPattern":"/dashboard/@drawer/(...)photo/[id]"}',
      'Intercepts across root boundary (...) on soft navigation'
    ),
    r(
      '{ routePattern: "/feed/@modal/(..)photo/[id]", slotName: "modal", targetPattern: "/photo/[id]" }, { currentPath: "/feed", targetUrl: "/settings", isSoftNavigation: true }',
      '{"isIntercepted":false,"params":{},"renderedPattern":"/photo/[id]"}',
      'Returns un-intercepted result with empty params on route mismatch'
    ),
  ],
};

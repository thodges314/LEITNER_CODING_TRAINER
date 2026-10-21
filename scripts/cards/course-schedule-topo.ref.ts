function buildGraph(n: number, prerequisites: [number, number][]): { adj: number[][]; indegree: number[] } {
  const adj: number[][] = Array.from({ length: n }, () => []);
  const indegree: number[] = new Array(n).fill(0);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    indegree[course]++;
  }
  return { adj, indegree };
}

function findOrder(numCourses: number, prerequisites: [number, number][]): number[] {
  const { adj, indegree } = buildGraph(numCourses, prerequisites);
  const ready: number[] = [];
  for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) ready.push(i);
  const order: number[] = [];
  while (ready.length) {
    ready.sort((a, b) => a - b);
    const node = ready.shift()!;
    order.push(node);
    for (const next of adj[node]) {
      if (--indegree[next] === 0) ready.push(next);
    }
  }
  return order.length === numCourses ? order : [];
}

function canFinish(numCourses: number, prerequisites: [number, number][]): boolean {
  return findOrder(numCourses, prerequisites).length === numCourses;
}

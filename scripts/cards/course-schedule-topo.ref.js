function buildGraph(n, prerequisites) {
  const adj = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    indegree[course]++;
  }
  return { adj, indegree };
}

function findOrder(numCourses, prerequisites) {
  const { adj, indegree } = buildGraph(numCourses, prerequisites);
  const ready = [];
  for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) ready.push(i);
  const order = [];
  while (ready.length) {
    ready.sort((a, b) => a - b);
    const node = ready.shift();
    order.push(node);
    for (const next of adj[node]) {
      if (--indegree[next] === 0) ready.push(next);
    }
  }
  return order.length === numCourses ? order : [];
}

function canFinish(numCourses, prerequisites) {
  return findOrder(numCourses, prerequisites).length === numCourses;
}

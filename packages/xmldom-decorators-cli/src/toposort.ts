// Adapted from:
// https://github.com/marcelklehr/toposort/blob/3e3d72d1b48196ab0e87348d142ef23788a5bb67/index.js
// Ported to TypeScript and added callback for cycles
/**
 * Topological sorting function
 */
export function toposort<T>(nodes: T[], edges: [T, T][], cycleCallback: Function|undefined = undefined): T[] {
  var cursor = nodes.length
    , sorted = new Array<T>(cursor)
    , visited: {[key:number]: boolean} = {}
    , i = cursor
    // Better data structures make algorithm much faster.
    , outgoingEdges = makeOutgoingEdges<T>(edges)
    , nodesHash = makeNodesHash<T>(nodes)

  // check for unknown nodes
  edges.forEach(function(edge) {
    if (!nodesHash.has(edge[0]) || !nodesHash.has(edge[1])) {
      throw new Error('Unknown node. There is an unknown node in the supplied edges.')
    }
  })

  while (i--) {
    if (!visited[i]) visit(nodes[i], i, new Set(), undefined)
  }

  return sorted

  function visit(node: T, i: number, predecessors: Set<T>, parent: T|undefined) {
    if(predecessors.has(node)) {
      var nodeRep
      try {
        nodeRep = ", node was:" + JSON.stringify(node)
      } catch(e) {
        nodeRep = ""
      }

      if (cycleCallback) {
          cycleCallback(node, parent);
          return;
      } else {
          throw new Error('Cyclic dependency' + nodeRep)
      }
    }

    if (!nodesHash.has(node)) {
      throw new Error('Found unknown node. Make sure to provided all involved nodes. Unknown node: '+JSON.stringify(node))
    }

    if (visited[i]) return;
    visited[i] = true

    var outgoing = Array.from<T>(outgoingEdges.get(node) || new Set());

    if (i = outgoing.length) {
      predecessors.add(node)
      do {
        var child = outgoing[--i]
        visit(child, nodesHash.get(child) as number, predecessors, node)
      } while (i)
      predecessors.delete(node)
    }

    sorted[--cursor] = node
  }
}

function uniqueNodes(arr: any[]){
  var res = new Set()
  for (var i = 0, len = arr.length; i < len; i++) {
    var edge = arr[i]
    res.add(edge[0])
    res.add(edge[1])
  }
  return Array.from(res)
}

function makeOutgoingEdges<T>(arr: [T, T][]): Map<T, Set<T>> {
  var edges = new Map<T, Set<T>>()
  for (var i = 0, len = arr.length; i < len; i++) {
    var edge = arr[i]
    if (!edges.has(edge[0])) edges.set(edge[0], new Set<T>());
    if (!edges.has(edge[1])) edges.set(edge[1], new Set<T>());
    (edges.get(edge[0]) as Set<T>).add(edge[1])
  }
  return edges
}

function makeNodesHash<T>(arr: T[]): Map<T, number> {
  var res = new Map<T, number>()
  for (var i = 0, len = arr.length; i < len; i++) {
    res.set(arr[i], i)
  }
  return res
}
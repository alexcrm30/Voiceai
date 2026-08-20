# Graph Report - voiceai  (2026-06-23)

## Corpus Check
- 18 files · ~4,972 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 91 nodes · 73 edges · 21 communities (9 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fca26452`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `scripts` - 5 edges
3. `paths` - 2 edges
4. `stripe` - 1 edges
5. `stripe` - 1 edges
6. `sb` - 1 edges
7. `sb` - 1 edges
8. `resend` - 1 edges
9. `sb` - 1 edges
10. `geistSans` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (21 total, 12 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (17): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (8): dependencies, next, react, react-dom, resend, stripe, @supabase/supabase-js, @vapi-ai/web

### Community 4 - "Community 4"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 6 - "Community 6"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **59 isolated node(s):** `stripe`, `stripe`, `sb`, `sb`, `resend` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `compilerOptions` connect `Community 0` to `Community 12`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `stripe`, `stripe`, `sb` to the rest of the system?**
  _59 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
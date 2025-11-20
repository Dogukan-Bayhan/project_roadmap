import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RoadmapSeed = {
  id: number;
  title: string;
  category:
    | "Memory"
    | "Semantics"
    | "Type System"
    | "Templates"
    | "Concurrency"
    | "Modern STL & Features"
    | "Optimization";
  parentId: number | null;
};

const ROADMAP_SEED: RoadmapSeed[] = [
  { id: 1, title: "RAII", category: "Memory", parentId: null },
  { id: 2, title: "unique_ptr", category: "Memory", parentId: 1 },
  { id: 3, title: "shared_ptr", category: "Memory", parentId: 1 },
  { id: 4, title: "weak_ptr", category: "Memory", parentId: 3 },
  { id: 5, title: "Custom Deleters", category: "Memory", parentId: 2 },
  { id: 6, title: "Memory Alignment", category: "Memory", parentId: 1 },
  { id: 7, title: "Move Semantics (std::move)", category: "Semantics", parentId: null },
  { id: 8, title: "Rvalue References", category: "Semantics", parentId: 7 },
  { id: 9, title: "Perfect Forwarding (std::forward)", category: "Semantics", parentId: 8 },
  { id: 10, title: "Copy Elision (RVO/NRVO)", category: "Semantics", parentId: 7 },
  { id: 11, title: "auto & decltype", category: "Type System", parentId: null },
  { id: 12, title: "Structured Bindings", category: "Type System", parentId: 11 },
  { id: 13, title: "Type Deduction", category: "Type System", parentId: 11 },
  { id: 14, title: "std::any", category: "Type System", parentId: 13 },
  { id: 15, title: "std::variant", category: "Type System", parentId: 13 },
  { id: 16, title: "std::optional", category: "Type System", parentId: 13 },
  { id: 17, title: "Function/Class Templates", category: "Templates", parentId: null },
  { id: 18, title: "Variadic Templates", category: "Templates", parentId: 17 },
  { id: 19, title: "Fold Expressions", category: "Templates", parentId: 18 },
  { id: 20, title: "SFINAE", category: "Templates", parentId: 17 },
  { id: 21, title: "Concepts (C++20)", category: "Templates", parentId: 20 },
  { id: 22, title: "Template Specialization", category: "Templates", parentId: 17 },
  { id: 23, title: "constexpr if", category: "Templates", parentId: 19 },
  { id: 24, title: "std::thread", category: "Concurrency", parentId: null },
  { id: 25, title: "std::async", category: "Concurrency", parentId: 24 },
  { id: 26, title: "std::future & std::promise", category: "Concurrency", parentId: 25 },
  { id: 27, title: "std::mutex & locks", category: "Concurrency", parentId: 24 },
  { id: 28, title: "std::condition_variable", category: "Concurrency", parentId: 27 },
  { id: 29, title: "std::atomic", category: "Concurrency", parentId: 24 },
  { id: 30, title: "Memory Models", category: "Concurrency", parentId: 29 },
  { id: 31, title: "Lambda Expressions", category: "Modern STL & Features", parentId: null },
  { id: 32, title: "std::function", category: "Modern STL & Features", parentId: 31 },
  { id: 33, title: "Smart Pointers Implementation details", category: "Modern STL & Features", parentId: 32 },
  { id: 34, title: "std::string_view", category: "Modern STL & Features", parentId: 31 },
  { id: 35, title: "std::span", category: "Modern STL & Features", parentId: 34 },
  { id: 36, title: "Ranges (C++20)", category: "Modern STL & Features", parentId: 34 },
  { id: 37, title: "Coroutines", category: "Modern STL & Features", parentId: 31 },
  { id: 38, title: "Modules", category: "Modern STL & Features", parentId: 37 },
  { id: 39, title: "Three-way Comparison (<=>)", category: "Modern STL & Features", parentId: 31 },
  { id: 40, title: "Cache Locality", category: "Optimization", parentId: null },
  { id: 41, title: "SOAO vs AOS", category: "Optimization", parentId: 40 },
  { id: 42, title: "SIMD basics", category: "Optimization", parentId: 40 },
];

const PROJECT_SEED = [
  {
    title: "Order Book Matching Engine",
    description:
      "Implement a low-latency limit/market matching engine that enforces strict price-time priority and supports depth snapshots.",
    tasks: [
      "Model level-2 order book structures with price buckets and FIFO queues.",
      "Implement order submission, cancellation, and amend flows with sequencing.",
      "Design the matching core for limit vs. market orders under price-time priority.",
      "Emit depth snapshots and trade prints with latency metrics.",
      "Stress test with synthetic bursts and record profiling data.",
    ],
  },
  {
    title: "Market Data Feed Handler",
    description:
      "Build a resilient PCAP/UDP parser that normalizes exchange-specific packets into a unified feed for downstream systems.",
    tasks: [
      "Parse raw PCAP capture files into timestamped UDP payloads.",
      "Decode exchange wire formats and normalize to an internal schema.",
      "Implement replay controls, gap detection, and drop handling.",
      "Expose zero-copy snapshots for downstream consumers.",
      "Capture per-stage latency metrics for observability.",
    ],
  },
  {
    title: "Backtesting Engine",
    description:
      "Create an event-driven simulation harness that replays historical ticks into strategy logic with deterministic timing.",
    tasks: [
      "Design the event bus and scheduling primitives for deterministic playback.",
      "Implement adapters for historical trades/quotes and align timestamps.",
      "Add portfolio accounting with transaction costs and slippage.",
      "Surface analytics for PnL, drawdown, and factor exposures.",
      "Allow plug-in strategy modules with lifecycle hooks.",
    ],
  },
  {
    title: "High-Frequency Trading Strategy",
    description:
      "Prototype a latency-aware SMA crossover strategy with microburst handling and safeguards for stale data.",
    tasks: [
      "Implement rolling SMA calculations optimized for cache locality.",
      "Add signal gating for spread/latency constraints.",
      "Integrate with synthetic market data and risk limits.",
      "Profile the pipeline and eliminate hotspots via SIMD where possible.",
      "Record post-trade analytics to validate behavior.",
    ],
  },
  {
    title: "Option Pricing Library",
    description:
      "Develop a Monte Carlo and closed-form Black-Scholes pricing toolkit with reusable RNG abstractions.",
    tasks: [
      "Implement analytic Black-Scholes pricers for calls/puts/greeks.",
      "Create variance-reduced Monte Carlo engines with Sobol sequences.",
      "Add calibration utilities for implied volatility surfaces.",
      "Vectorize payoff accumulation using SIMD-friendly layouts.",
      "Document benchmarks comparing analytic vs. simulation results.",
    ],
  },
];

async function seedRoadmap() {
  await prisma.roadmapNode.deleteMany();
  await prisma.roadmapNode.createMany({
    data: ROADMAP_SEED.map((node) => ({
      ...node,
      status: "PENDING",
      userCode: null,
    })),
  });
}

async function seedProjects() {
  await prisma.projectTask.deleteMany();
  await prisma.project.deleteMany();

  for (const project of PROJECT_SEED) {
    await prisma.project.create({
      data: {
        title: project.title,
        description: project.description,
        tasks: {
          create: project.tasks.map((description) => ({ description })),
        },
      },
    });
  }
}

async function main() {
  await seedRoadmap();
  await seedProjects();
  console.log("🌱 Seeded roadmap nodes and quant projects");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


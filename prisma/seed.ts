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
  longDescription: string;
  implementationSteps: string[];
  learningOutcomes: string;
};

const ROADMAP_SEED: RoadmapSeed[] = [
  {
    id: 1,
    title: "RAII",
    category: "Memory",
    parentId: null,
    longDescription:
      "Resource Acquisition Is Initialization binds ownership of memory, sockets, or file descriptors to object lifetime so that constructors acquire resources and destructors release them deterministically. The pattern removes manual try/finally scaffolding and keeps invariants intact even when stack unwinding happens because of exceptions or early returns.",
    implementationSteps: [
      "Wrap every raw handle or heap block inside a lightweight C++ class whose constructor acquires and whose destructor releases.",
      "Favor stack allocation or smart pointers so the compiler inserts the correct lifetime automatically.",
      "Delete copy semantics and allow moves to prevent duplicate ownership while still enabling transfers across components.",
    ],
    learningOutcomes:
      "Matching engines and feed handlers leak throughput when descriptors linger; RAII guarantees cleanup even under bursty failure scenarios, which keeps latencies flat.",
  },
  {
    id: 2,
    title: "unique_ptr",
    category: "Memory",
    parentId: 1,
    longDescription:
      "std::unique_ptr encodes single ownership and deterministic destruction without the overhead of reference counting. It models RAII in a generic container that plays nicely with custom deleters and move semantics.",
    implementationSteps: [
      "Use std::make_unique to ensure exception safety during allocation and construction.",
      "Expose unique_ptr in APIs when a callee needs to take ownership; accept by value and std::move internally.",
      "Attach custom deleters when managing memory from shared arenas, huge pages, or device buffers.",
    ],
    learningOutcomes:
      "Quant libraries favor unique_ptr to communicate ownership boundaries across high-frequency components, preventing leaks that would fragment NUMA heaps over a trading day.",
  },
  {
    id: 3,
    title: "shared_ptr",
    category: "Memory",
    parentId: 1,
    longDescription:
      "std::shared_ptr provides intrusive reference counting for scenarios where objects must outlive the creator and no single subsystem can own them outright. It hides atomic increments behind a friendly API but still demands care to avoid cycles.",
    implementationSteps: [
      "Construct shared_ptr with std::make_shared so control block and object share the same allocation for cache friendliness.",
      "Use std::weak_ptr to break retention loops between publisher/subscriber graphs.",
      "Measure contention on the control block when shared_ptr travels across threads; switch to intrusive ref counting if contention dominates.",
    ],
    learningOutcomes:
      "Market data caches and pub/sub buses often need shared ownership for payloads; understanding shared_ptr costs helps quants decide when to copy, when to share, and when to recycle buffers.",
  },
  {
    id: 4,
    title: "weak_ptr",
    category: "Memory",
    parentId: 3,
    longDescription:
      "std::weak_ptr observes an object managed by std::shared_ptr without extending its lifetime. It lets graphs reference each other without creating retention cycles.",
    implementationSteps: [
      "Store weak_ptr in observer lists or callback registries so the publisher does not keep subscribers alive.",
      "Lock the weak_ptr to a shared_ptr right before use to obtain a safe snapshot, and handle the expired case explicitly.",
      "Clear weak_ptr collections aggressively to keep them from growing with expired entries under heavy churn.",
    ],
    learningOutcomes:
      "Risk dashboards and signal routers frequently register short-lived listeners; weak_ptr keeps subscription churn from leaking memory while still letting callbacks access warm data when it exists.",
  },
  {
    id: 5,
    title: "Custom Deleters",
    category: "Memory",
    parentId: 2,
    longDescription:
      "Custom deleters let smart pointers release memory through bespoke logic: pool returns, huge-page munmaps, or object recycling. They complete the RAII story for resources that cannot be simply delete’d.",
    implementationSteps: [
      "Embed lambda or function object deleters when constructing smart pointers to describe how buffers are recycled.",
      "Use stateless deleters for hot paths so the control block remains small and trivially copyable.",
      "Pair deleters with memory pools or shared arenas to make ownership boundaries visible without exposing raw pointers.",
    ],
    learningOutcomes:
      "Quant stacks constantly juggle shared arenas for feed decoding; custom deleters ensure buffers go back to the correct pool, lowering allocator jitter and GC-like pauses.",
  },
  {
    id: 6,
    title: "Memory Alignment",
    category: "Memory",
    parentId: 1,
    longDescription:
      "Alignment determines how data lines up with cache lines and SIMD registers. Correctly aligned allocations remove false sharing, enable vector instructions, and reduce microcode fixes fired by misaligned accesses.",
    implementationSteps: [
      "Use std::aligned_alloc, std::pmr resources, or custom allocators to guarantee 32- or 64-byte alignment for hot data.",
      "Annotate structs with alignas when they feed SIMD kernels or hardware DMA.",
      "Measure cache misses with perf/VTune to confirm that padding and alignment actually reduce stalls.",
    ],
    learningOutcomes:
      "Order book depth arrays streamed into AVX pipelines must be aligned; otherwise a single misaligned load can blow the latency budget for a quote.",
  },
  {
    id: 7,
    title: "Move Semantics (std::move)",
    category: "Semantics",
    parentId: null,
    longDescription:
      "Move semantics let objects transfer ownership of expensive resources instead of cloning them. std::move signals that an object may be pilfered, enabling buffer reuse and cheap container mutations.",
    implementationSteps: [
      "Mark move constructors/assignments noexcept to unlock vector/List reallocation optimizations.",
      "Use std::move when returning large aggregates or when pushing onto vectors to avoid copies.",
      "After moving from an object, reset it to a valid but empty state so it can be reused.",
    ],
    learningOutcomes:
      "Quant code often ships large tick snapshots across queues; std::move keeps that transfer O(1) and eliminates allocator pressure during bursts.",
  },
  {
    id: 8,
    title: "Rvalue References",
    category: "Semantics",
    parentId: 7,
    longDescription:
      "Rvalue references (T&&) bind to temporaries and movable objects, letting APIs overload behavior depending on value categories. They are the foundation of move constructors and perfect forwarding.",
    implementationSteps: [
      "Declare move constructors/assignments that take T&& and transfer ownership member by member.",
      "Provide separate overloads or forwarding constructors to distinguish cheap moves from expensive copies.",
      "Use std::forward inside templates so value category information is preserved.",
    ],
    learningOutcomes:
      "Without rvalue references, container nodes inside matching engines would copy enormous trade messages; the feature keeps CPU caches focused on live data.",
  },
  {
    id: 9,
    title: "Perfect Forwarding (std::forward)",
    category: "Semantics",
    parentId: 8,
    longDescription:
      "Perfect forwarding lets templated functions pass arguments along while preserving whether they were lvalues or rvalues. It solves the 'forwarding constructor' problem where every overload would otherwise have to be spelled manually.",
    implementationSteps: [
      "Template the function on typename T and take T&& parameter.",
      "Use std::forward<T>(arg) when passing to another function so rvalues stay movable.",
      "Constrain templates with concepts/SFINAE to avoid instantiating on unsupported arguments.",
    ],
    learningOutcomes:
      "Generic reactors in quant code route many message types; perfect forwarding avoids copies while still letting instrumentation hook every call.",
  },
  {
    id: 10,
    title: "Copy Elision (RVO/NRVO)",
    category: "Semantics",
    parentId: 7,
    longDescription:
      "Return Value Optimization and Named Return Value Optimization let compilers construct return objects directly in the caller's storage. C++17 guarantees elision in more scenarios, making 'return by value' zero-cost for most aggregates.",
    implementationSteps: [
      "Return by value confidently; avoid std::move in the return statement because it can block mandatory RVO.",
      "Structure hot code so the compiler can identify a single return object and elide copies.",
      "Use compiler explorer to verify when NRVO triggers for complex builder functions.",
    ],
    learningOutcomes:
      "Trade evaluators that build complex structs each tick rely on guaranteed copy elision to keep heap allocations off the critical path.",
  },
  {
    id: 11,
    title: "auto & decltype",
    category: "Type System",
    parentId: null,
    longDescription:
      "auto deduces types from initializers while decltype inspects expressions without evaluating them. Together they make complex template code writable and ensure return types stay in sync with expressions.",
    implementationSteps: [
      "Use auto for iterators and lambdas to keep code legible yet strongly typed.",
      "Combine decltype(auto) for forwarding functions to deduce references correctly.",
      "Rely on trailing return types with decltype when building expression templates or CRTP helpers.",
    ],
    learningOutcomes:
      "Quant libraries expose templated math kernels; auto/decltype remove manual typedef churn and prevent subtle bugs when instrumenting new feeds.",
  },
  {
    id: 12,
    title: "Structured Bindings",
    category: "Type System",
    parentId: 11,
    longDescription:
      "Structured bindings destructure tuples, structs, and pair-like objects into named variables. They make algorithms more readable and reduce indexing mistakes.",
    implementationSteps: [
      "Use auto [price, qty] = book.best_bid(); to reveal intent.",
      "Bind by reference when you need to mutate the underlying aggregate.",
      "Combine with std::tie or std::apply to unpack heterogeneous containers cleanly.",
    ],
    learningOutcomes:
      "While decoding packets, structured bindings turn bitfield extractions into self-documenting code, shortening the feedback loop for reviewing protocol changes.",
  },
  {
    id: 13,
    title: "Type Deduction",
    category: "Type System",
    parentId: 11,
    longDescription:
      "Understanding C++ type deduction rules (template argument deduction, auto deduction, decltype) is vital when writing generic components. It explains why constness or references are dropped and how to preserve them.",
    implementationSteps: [
      "Memorize deduction rules for auto, forwarding references, and decay contexts.",
      "Use helper aliases (std::decay_t, std::remove_reference_t) to normalize types explicitly.",
      "Write static_asserts with std::is_same_v to document the expected deduced type in hot templates.",
    ],
    learningOutcomes:
      "Quant infra teams maintain massive template libraries; mastering deduction avoids template explosion that would otherwise slow builds and introduce subtle runtime overhead.",
  },
  {
    id: 14,
    title: "std::any",
    category: "Type System",
    parentId: 13,
    longDescription:
      "std::any provides type-erased storage for any CopyConstructible object. It trades performance for flexibility and is useful when only runtime composition is possible.",
    implementationSteps: [
      "Store small immutable payloads that rarely change type; avoid std::any in per-tick hot paths.",
      "Use any_cast with care and provide fallback branches when the type is missing.",
      "Prefer std::variant when the set of types is known ahead of time.",
    ],
    learningOutcomes:
      "Control planes in quant stacks occasionally need extensible configuration; std::any enables plugin data without forcing template recompiles.",
  },
  {
    id: 15,
    title: "std::variant",
    category: "Type System",
    parentId: 13,
    longDescription:
      "std::variant is a type-safe tagged union. It encodes a closed set of alternatives and forces exhaustive handling through std::visit.",
    implementationSteps: [
      "Model heterogeneous feed messages as variants and use visitors to route them.",
      "Provide small custom visitors or lambdas capturing shared state.",
      "Leverage std::monostate for default construction and pattern matching fallbacks.",
    ],
    learningOutcomes:
      "Variants let quant developers model normalized events (trade, quote, imbalance) without virtual dispatch, keeping data compact and cache friendly.",
  },
  {
    id: 16,
    title: "std::optional",
    category: "Type System",
    parentId: 13,
    longDescription:
      "std::optional represents an optional value without sentinel states. It clarifies APIs by making the absence of data explicit and type-safe.",
    implementationSteps: [
      "Return std::optional when a lookup might fail instead of using nullptrs or special prices.",
      "Use has_value() before dereferencing, or use value_or for sane defaults.",
      "Combine optional with structured bindings to unpack successful parses cleanly.",
    ],
    learningOutcomes:
      "Risk systems ingest patchy market data; optional ensures missing fields don’t become 0.0, which could trip risk checks.",
  },
  {
    id: 17,
    title: "Function/Class Templates",
    category: "Templates",
    parentId: null,
    longDescription:
      "Templates let code operate on types and values known only at compile time. Function templates bring generic algorithms, while class templates encode containers, adapters, and expression trees.",
    implementationSteps: [
      "Start with type parameters then add non-type template parameters for dimensions or compile-time constants.",
      "Use explicit instantiation or export key instantiations to manage build times.",
      "Document template expectations with static_asserts and concise concept-style comments.",
    ],
    learningOutcomes:
      "Quant engines reuse the same math kernels for equities, futures, and options; templates keep code deduplicated without sacrificing performance.",
  },
  {
    id: 18,
    title: "Variadic Templates",
    category: "Templates",
    parentId: 17,
    longDescription:
      "Variadic templates accept an arbitrary number of template parameters or function arguments. They enable tuple utilities, formatters, and strongly typed dispatchers.",
    implementationSteps: [
      "Use parameter packs (typename... Args) and fold expressions to iterate over arguments.",
      "Provide base cases carefully to stop recursion for recursive variadic patterns.",
      "Combine with std::index_sequence to address pack elements by index.",
    ],
    learningOutcomes:
      "Logging, metrics, and event fan-out layers in quant stacks use variadic templates to avoid runtime allocation while still supporting arbitrary payloads.",
  },
  {
    id: 19,
    title: "Fold Expressions",
    category: "Templates",
    parentId: 18,
    longDescription:
      "Fold expressions reduce a parameter pack with a binary operator. They replaced the old recursive unpacking pattern and keep template metaprogramming readable.",
    implementationSteps: [
      "Use unary folds ( ... + args ) or binary folds ( (args + ...) + init ) when aggregating data.",
      "Ensure operators are associative/commutative or document evaluation order assumptions.",
      "Leverage folds for compile-time traits like logical AND/OR across types.",
    ],
    learningOutcomes:
      "Folding compile-time predicates lets quants build constraint systems for strategies without bloating compile times.",
  },
  {
    id: 20,
    title: "SFINAE",
    category: "Templates",
    parentId: 17,
    longDescription:
      "Substitution Failure Is Not An Error lets the compiler discard ill-formed template instantiations instead of halting compilation. It enables trait detection and overload selection.",
    implementationSteps: [
      "Use std::void_t tricks or detection idioms to probe for member types/functions.",
      "Pair SFINAE with enable_if to select overloads when constraints hold.",
      "Prefer modern concepts when available, falling back to SFINAE for pre-C++20 compilers.",
    ],
    learningOutcomes:
      "Quant libraries must support multiple exchange-specific message types; SFINAE keeps the same code compiling even when some exchanges lack features.",
  },
  {
    id: 21,
    title: "Concepts (C++20)",
    category: "Templates",
    parentId: 20,
    longDescription:
      "Concepts declaratively constrain template parameters. They turn unreadable enable_if expressions into human-friendly requirements and drastically improve compiler diagnostics.",
    implementationSteps: [
      "Use standard concepts (integral, floating_point) before defining custom ones.",
      "Group related requirements in requires clauses for clarity.",
      "Adopt concepts to document quant domain abstractions such as PriceLevelRange or LatencyClock.",
    ],
    learningOutcomes:
      "Concepts let quant teams encode market semantics at the type level, preventing misuse of APIs across asset classes before code reaches production.",
  },
  {
    id: 22,
    title: "Template Specialization",
    category: "Templates",
    parentId: 17,
    longDescription:
      "Specialization tailors template behavior for specific types or compile-time constants. Partial specializations customize behavior without rewriting entire classes.",
    implementationSteps: [
      "Provide primary templates that express default behavior concisely.",
      "Specialize for pivotal types (e.g., double vs. decimal128) to pick numerically stable algorithms.",
      "Document specializations clearly; they can be hard to discover during code review.",
    ],
    learningOutcomes:
      "Specializations let quant libraries use fused-multiply-add for floats while falling back to multiprecision for exotic products, maximizing both speed and precision.",
  },
  {
    id: 23,
    title: "constexpr if",
    category: "Templates",
    parentId: 19,
    longDescription:
      "constexpr if performs compile-time branching without generating dead code for the false branch. It simplifies template metaprogramming and keeps instantiations minimal.",
    implementationSteps: [
      "Use constexpr if to pick algorithm variants (SIMD vs. scalar) based on type traits.",
      "Prefer constexpr flags over std::enable_if clutter for intra-function branching.",
      "Combine with concepts to keep compile-time decisions declarative and precise.",
    ],
    learningOutcomes:
      "Strategy libraries can switch between scalar math and vectorized math at compile time, letting a single codebase target both desktop research and production FPGA offload.",
  },
  {
    id: 24,
    title: "std::thread",
    category: "Concurrency",
    parentId: null,
    longDescription:
      "std::thread is the basic building block for spawning parallel execution in C++. It abstracts platform threads while still giving access to handles for affinity and priority tuning.",
    implementationSteps: [
      "Launch threads with explicit names and bind them to CPU cores that match NUMA traffic.",
      "Join or detach threads deterministically; never leave a joinable thread unjoined.",
      "Wrap thread startup in RAII helpers that capture start timestamps for monitoring.",
    ],
    learningOutcomes:
      "Many quant engines pin specific responsibilities (feed decode, risk checks) to dedicated cores; std::thread plus OS APIs create the scaffolding for that pinning.",
  },
  {
    id: 25,
    title: "std::async",
    category: "Concurrency",
    parentId: 24,
    longDescription:
      "std::async launches tasks that return futures, abstracting away whether work runs on a new thread or a shared pool. It’s a high-level tool for asynchronous work off the hot path.",
    implementationSteps: [
      "Specify launch::async to force a new thread when you need true parallelism.",
      "Use launch::deferred for lazily evaluated tasks such as expensive analytics triggered by demand.",
      "Propagate cancellation by respecting shared state associated with the future/promise pair.",
    ],
    learningOutcomes:
      "Quant research UIs leverage std::async to kick off scenario analysis without freezing the main event loop.",
  },
  {
    id: 26,
    title: "std::future & std::promise",
    category: "Concurrency",
    parentId: 25,
    longDescription:
      "Futures and promises formalize handoffs between producers and consumers. Promises set values (or errors); futures retrieve them, optionally blocking.",
    implementationSteps: [
      "Pair each promise with exactly one future to avoid dangling shared states.",
      "Use future.wait_for to implement timeouts and surface soft-failure telemetry.",
      "Capture exceptions in promises so futures can surface diagnostics cleanly.",
    ],
    learningOutcomes:
      "Risk-controlled order entry often waits for upstream approvals; futures make that wait observable and cancellable rather than ad-hoc polling.",
  },
  {
    id: 27,
    title: "std::mutex & locks",
    category: "Concurrency",
    parentId: 24,
    longDescription:
      "std::mutex, std::shared_mutex, and lock_guard provide mutual exclusion primitives with RAII semantics. They are the first line of defense when serializing critical sections.",
    implementationSteps: [
      "Use std::scoped_lock to lock multiple mutexes without risking deadlock.",
      "Adopt shared_mutex for read-dominant workloads like market data caches.",
      "Profile critical sections to ensure mutex contention stays below microsecond thresholds.",
    ],
    learningOutcomes:
      "Order book state machines sustain hundreds of thousands of reads per second; knowing when to use shared vs. exclusive locks keeps them scalable.",
  },
  {
    id: 28,
    title: "std::condition_variable",
    category: "Concurrency",
    parentId: 27,
    longDescription:
      "Condition variables let threads sleep until a predicate becomes true. They separate signaling from shared data so that spurious wakeups can be handled cleanly.",
    implementationSteps: [
      "Always wait with a predicate inside a while loop to handle spurious wakeups.",
      "Use notify_one for targeted wakeups and notify_all when multiple consumers need the same event.",
      "Pair condition variables with steady_clock timeouts to detect stalled producers.",
    ],
    learningOutcomes:
      "Batching modules in quant systems rely on condition variables to sleep when markets are quiet without busy-waiting away CPU headroom.",
  },
  {
    id: 29,
    title: "std::atomic",
    category: "Concurrency",
    parentId: 24,
    longDescription:
      "std::atomic exposes lock-free operations with controllable memory ordering. It is the backbone of wait-free queues, reference counters, and synchronization primitives.",
    implementationSteps: [
      "Use atomic_flag or atomic<bool> with memory_order_release/acquire for simple handoffs.",
      "Prefer relaxed ordering for statistics counters to minimize fences.",
      "Document invariants when mixing atomics with mutex-protected data.",
    ],
    learningOutcomes:
      "Low-latency ring buffers depend on atomics for producer/consumer indices; mastering them avoids heavyweight locks that would add jitter.",
  },
  {
    id: 30,
    title: "Memory Models",
    category: "Concurrency",
    parentId: 29,
    longDescription:
      "The C++ memory model describes how operations may reorder and which fences are required to observe writes. Understanding acquire/release, relaxed, and seq_cst is essential for lock-free design.",
    implementationSteps: [
      "Map each shared data path to the weakest memory order that still preserves correctness.",
      "Use std::atomic_thread_fence sparingly to document cross-variable ordering constraints.",
      "Validate designs with tools like TSAN or herd7 to catch reorderings that intuition misses.",
    ],
    learningOutcomes:
      "Quant infrastructures run across NUMA domains; misapplied memory orders can surface as heisenbugs that only appear under burst load, so deep model knowledge is mandatory.",
  },
  {
    id: 31,
    title: "Lambda Expressions",
    category: "Modern STL & Features",
    parentId: null,
    longDescription:
      "Lambdas create inline, unnamed functors capturing local state. They power algorithms, callbacks, and DSL-like constructs across modern C++.",
    implementationSteps: [
      "Capture by value when state must be frozen, or by reference for mutation.",
      "Use constexpr lambdas for compile-time computation and immediate invocation.",
      "Annotate lambdas with mutable or explicit return types when inference is ambiguous.",
    ],
    learningOutcomes:
      "Lambdas make on-the-fly analytics possible in trading GUIs without building heavyweight functor classes for each prototype idea.",
  },
  {
    id: 32,
    title: "std::function",
    category: "Modern STL & Features",
    parentId: 31,
    longDescription:
      "std::function type-erases callable targets so they can be stored uniformly. It allocates when necessary and provides copyable semantics.",
    implementationSteps: [
      "Avoid std::function in tight loops; prefer templated callables or small-function optimizations.",
      "Reserve std::function for long-lived registries or plugin APIs where flexibility outweighs cost.",
      "Reset unused std::function objects to release captured resources.",
    ],
    learningOutcomes:
      "Strategy sandboxes expose hooks to Python or scripting layers; std::function lets native code accept user-supplied callbacks safely.",
  },
  {
    id: 33,
    title: "Smart Pointers Implementation details",
    category: "Modern STL & Features",
    parentId: 32,
    longDescription:
      "Understanding how standard smart pointers implement control blocks, reference counts, and deleters clarifies their performance envelope and memory layout.",
    implementationSteps: [
      "Inspect control block layouts to know when allocations double (object + control).",
      "Choose intrusively reference-counted types when shared_ptr contention dominates.",
      "Use enable_shared_from_this judiciously; it injects weak_ptr plumbing into objects.",
    ],
    learningOutcomes:
      "Being fluent with smart pointer internals helps quants diagnose throughput collapses when pointers bounce between threads.",
  },
  {
    id: 34,
    title: "std::string_view",
    category: "Modern STL & Features",
    parentId: 31,
    longDescription:
      "std::string_view is a non-owning view into contiguous characters. It avoids copies when slicing or parsing text.",
    implementationSteps: [
      "Return string_view from parsing APIs to keep them zero-copy.",
      "Guarantee the referenced storage outlives the view; document lifetimes explicitly.",
      "Use starts_with, find, and comparisons provided by string_view for clarity.",
    ],
    learningOutcomes:
      "Exchange feeds ship textual fields like venue codes and condition flags; string_view keeps parsing code lean without re-allocating per tick.",
  },
  {
    id: 35,
    title: "std::span",
    category: "Modern STL & Features",
    parentId: 34,
    longDescription:
      "std::span is a lightweight view over contiguous memory for arbitrary types. It encodes pointer + length and can be static_extent for compile-time sizes.",
    implementationSteps: [
      "Accept span<const T> parameters to make APIs work with arrays, vectors, and std::array seamlessly.",
      "Use subspan to slice without copying, but stay mindful of bounds.",
      "Combine with gsl::span or mdspan when working with multi-dimensional tensors.",
    ],
    learningOutcomes:
      "When pricing Greeks, spans allow kernel code to reference sliding windows without copying each vector.",
  },
  {
    id: 36,
    title: "Ranges (C++20)",
    category: "Modern STL & Features",
    parentId: 34,
    longDescription:
      "The Ranges library revamps algorithms and views to be composable pipelines. Views lazily transform data, keeping code expressive and allocation-free.",
    implementationSteps: [
      "Chain views::transform, filter, take, and chunk to build dataflows without temporary containers.",
      "Use ranges::views::zip to synchronize feeds by timestamp.",
      "Write custom views when the standard set cannot express your stream transformations.",
    ],
    learningOutcomes:
      "Ranges make it trivial to express multi-stage normalization of raw tick data while keeping memory usage predictable.",
  },
  {
    id: 37,
    title: "Coroutines",
    category: "Modern STL & Features",
    parentId: 31,
    longDescription:
      "Coroutines let functions suspend and resume without dedicated threads. They underpin async I/O, generators, and cooperative schedulers.",
    implementationSteps: [
      "Define promise_type, awaitables, and return objects (task/generator) to integrate with the coroutine runtime.",
      "Use co_await on io_uring, epoll, or custom event sources to keep threads busy only when useful.",
      "Handle cancellation tokens so coroutines stop promptly when the market session ends.",
    ],
    learningOutcomes:
      "Coroutines power reactive order gateways that juggle thousands of sockets without dedicating a thread per connection, dramatically reducing jitter.",
  },
  {
    id: 38,
    title: "Modules",
    category: "Modern STL & Features",
    parentId: 37,
    longDescription:
      "C++20 modules replace textual inclusion with compiled interface units. They slash build times and prevent macro/ODR collisions.",
    implementationSteps: [
      "Partition large libraries into module interface units (.ixx) and implementation partitions.",
      "Export only the minimal API surface; keep implementation details in module partitions.",
      "Adopt BMI caching strategies so builds remain incremental across CI nodes.",
    ],
    learningOutcomes:
      "With modules, quant teams can cleanly expose math kernels to multiple strategies without leaking macros or forcing hour-long rebuilds.",
  },
  {
    id: 39,
    title: "Three-way Comparison (<=>)",
    category: "Modern STL & Features",
    parentId: 31,
    longDescription:
      "The spaceship operator synthesizes all six comparison operators from a single definition, with ordering categories capturing partial vs. total orderings.",
    implementationSteps: [
      "Implement operator<=> to auto-generate ==, <, >, <=, >= when semantics are consistent.",
      "Choose strong_ordering, weak_ordering, or partial_ordering based on domain invariants.",
      "Use defaulted operator<=> for aggregates so comparisons stay lexicographic and maintainable.",
    ],
    learningOutcomes:
      "Portfolio rebalancers compare large structs frequently; <=> prevents bugs where only half the comparisons were updated after adding a field.",
  },
  {
    id: 40,
    title: "Cache Locality",
    category: "Optimization",
    parentId: null,
    longDescription:
      "Cache locality ensures data required together is stored together, minimizing cache misses and memory latency. Spatial and temporal locality directly translate into predictable performance.",
    implementationSteps: [
      "Profile cache miss ratios using perf or VTune before guessing.",
      "Lay out hot structs of arrays or arrays of structs based on access patterns.",
      "Prefetch upcoming data with __builtin_prefetch when traversal patterns are deterministic.",
    ],
    learningOutcomes:
      "Quote responding loops often have sub-microsecond budgets; cache-friendly layouts keep L1 hit rates high so tail latency stays controlled.",
  },
  {
    id: 41,
    title: "SOAO vs AOS",
    category: "Optimization",
    parentId: 40,
    longDescription:
      "Struct-of-Arrays (SoA) and Array-of-Structs (AoS) describe how related fields are organized in memory. Picking the right layout decides whether SIMD and cache lines are used efficiently.",
    implementationSteps: [
      "Map real access patterns: if you touch price for many levels but not quantity, SoA makes sense.",
      "Convert between layouts at boundaries so human-friendly AoS structs do not leak into inner loops.",
      "Use compiler vectorization reports to confirm the chosen layout enables packed loads/stores.",
    ],
    learningOutcomes:
      "Trading engines often maintain thousands of price levels; SoA unlocks full vector width when updating them en masse.",
  },
  {
    id: 42,
    title: "SIMD basics",
    category: "Optimization",
    parentId: 40,
    longDescription:
      "Single Instruction Multiple Data (SIMD) executes the same instruction across multiple data lanes. Leveraging SSE/AVX/AVX-512 drastically increases throughput for arithmetic-heavy workloads.",
    implementationSteps: [
      "Align data and use intrinsics or auto-vectorized loops to operate on multiple elements at once.",
      "Guard code paths with cpuid checks so binaries fall back gracefully on older hardware.",
      "Aggregate results horizontally (e.g., reduce add) to convert vector registers back to scalars.",
    ],
    learningOutcomes:
      "Gamma hedging and Monte Carlo tight loops are dominated by arithmetic; SIMD keeps them within the millisecond budgets demanded by intraday risk.",
  },
];

type ProjectSeed = {
  title: string;
  description: string;
  longDescription: string;
  implementationSteps: string[];
  learningOutcomes: string;
  techStack: string[];
  tasks: string[];
};

const PROJECT_SEED: ProjectSeed[] = [
  {
    title: "Order Book Matching Engine",
    description:
      "Design a production-like matcher with strict price-time priority, telemetry, and replayable audit trails.",
    longDescription:
      "Overview: implement dual bid/ask ladders, sequencing logic, and deterministic snapshot emission so every state transition is auditable. The build emphasizes cache locality, NUMA awareness, and observability hooks.",
    implementationSteps: [
      "Lay out depth levels as contiguous price buckets with lock-free FIFO queues.",
      "Implement order ingestion, amend, cancel, and IOC/market-paths with sequence numbers.",
      "Add deterministic matching and self-trade prevention toggles.",
      "Publish depth snapshots or incremental updates without blocking the hot path.",
      "Record microsecond timestamps for every transition to feed latency dashboards.",
    ],
    learningOutcomes:
      "Real-World Quant Application: Citadel Securities and Nasdaq teams rely on deterministic matchers to reproduce trades under regulatory scrutiny while keeping tail latency sub-100µs.",
    techStack: ["C++20", "Lock-Free", "NUMA"],
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
      "Normalize multicast UDP packets from multiple exchanges into a single schema with replay controls.",
    longDescription:
      "Overview: craft PCAP ingestion, packet sequencing, loss detection, and normalization layers so downstream strategy code receives a clean, deduplicated event stream.",
    implementationSteps: [
      "Capture and timestamp traffic as close to the NIC as possible (AF_XDP/DPDK or WinPcap).",
      "Implement binary decoders per venue, handling sequence gaps, drops, and conflation records.",
      "Normalize messages into tightly packed structs and publish via lock-free rings.",
      "Expose replay controls for gap fills and on-demand historical replays.",
      "Instrument each pipeline stage with counters and latency histograms.",
    ],
    learningOutcomes:
      "Real-World Quant Application: Exchanges like CME and Eurex expect firms to ingest multi-megabit feeds flawlessly—reliable handlers stop PnL bleed from stale or missing ticks.",
    techStack: ["Networking", "UDP", "Lock-Free"],
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
      "Replay nano-timestamped events through strategies with deterministic timing and portfolio accounting.",
    longDescription:
      "Overview: architect a scheduler-driven simulator that replays trades/quotes, injects simulated latency, and produces verifiable PnL so research mirrors production behavior.",
    implementationSteps: [
      "Design an event bus that advances simulated time deterministically, even under multi-stream data.",
      "Create adapters for historical trades, quotes, and depth snapshots with alignment logic.",
      "Implement a portfolio ledger covering inventory, borrow, fees, and slippage.",
      "Add hooks for multiple strategies to subscribe to the same timeline with isolation.",
      "Output analytics for drawdown, factor exposure, and latency budgets.",
    ],
    learningOutcomes:
      "Real-World Quant Application: Hedge funds such as Two Sigma only ship code that reproduces production fills offline—robust backtesters slash false positives.",
    techStack: ["Simulation", "Event-Driven", "C++20"],
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
      "Ship a latency-aware momentum or SMA crossover loop with stale-data guards and profiling hooks.",
    longDescription:
      "Overview: turn a simple signal into a deployable HFT component complete with rolling indicators, throttling, and risk gates.",
    implementationSteps: [
      "Implement O(1) rolling statistics with SIMD-friendly buffers.",
      "Integrate market data timestamps to discard stale or out-of-order ticks.",
      "Add guardrails for widened spreads, circuit breakers, and drop detection.",
      "Profile the full signal-to-order latency path and remove hotspots.",
      "Record fills, rejects, and micro-metrics for post-trade analytics.",
    ],
    learningOutcomes:
      "Real-World Quant Application: Firms like Jump Trading use lightweight HFT ‘widgets’ like this to probe venues and capture micro-alpha without tipping risk budgets.",
    techStack: ["Low Latency", "SIMD", "Telemetry"],
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
      "Blend closed-form Greeks with Monte Carlo engines to price complex structures and calibrate vols.",
    longDescription:
      "Overview: expose both analytic Black-Scholes pricers and Monte Carlo payoffs behind reusable RNG and payoff abstractions.",
    implementationSteps: [
      "Implement closed-form Black-Scholes, Merton, and greeks with robust unit tests.",
      "Build Monte Carlo engines that support Sobol/Halton sequences and variance reduction tricks.",
      "Design payoff functors that can target CPU or GPU backends.",
      "Add volatility surface calibration utilities with visualization hooks.",
      "Benchmark analytic vs. Monte Carlo results and expose drift metrics.",
    ],
    learningOutcomes:
      "Real-World Quant Application: Banks like Goldman Sachs rely on internal pricing libraries to validate vendor quotes and stress exotic portfolios intraday.",
    techStack: ["Monte Carlo", "SIMD", "C++20"],
    tasks: [
      "Implement analytic Black-Scholes pricers for calls/puts/greeks.",
      "Create variance-reduced Monte Carlo engines with Sobol sequences.",
      "Add calibration utilities for implied volatility surfaces.",
      "Vectorize payoff accumulation using SIMD-friendly layouts.",
      "Document benchmarks comparing analytic vs. simulation results.",
    ],
  },
  {
    title: "Cross-Venue Arbitrage Bot",
    description:
      "Automate detection of price dislocations between venues and fire synchronized orders under strict latency budgets.",
    longDescription:
      "Overview: build a stat-arb or latency-arb bot that monitors multiple venues, computes edge nets of fees, and routes child orders with kill switches.",
    implementationSteps: [
      "Stream normalized quotes from at least two venues with synchronized timestamps.",
      "Compute edge after venue fees, latency costs, and inventory constraints.",
      "Implement order routing that slices orders across venues and cancels instantly if edge decays.",
      "Add real-time PnL attribution per venue to confirm fills beat theoretical edge.",
      "Wire safety nets for throttling, fat-finger limits, and exchange halts.",
    ],
    learningOutcomes:
      "Real-World Quant Application: HFT shops like DRW use cross-venue arb bots to enforce price parity between CME futures and ETF proxies within microseconds.",
    techStack: ["Networking", "Risk", "Multithreading"],
    tasks: [
      "Normalize two or more venue feeds into a shared book representation.",
      "Calculate edge after fees and latency buffers.",
      "Implement dual-order routing with synchronized cancels.",
      "Record fills and edge decay metrics for post-trade reviews.",
      "Trigger circuit breakers when edge turns negative three ticks in a row.",
    ],
  },
  {
    title: "Monte Carlo Scenario Simulator",
    description:
      "Produce risk scenarios across thousands of correlated paths with pluggable factor models and GPU acceleration.",
    longDescription:
      "Overview: architect a scenario generator that feeds shocks into strategies, producing VaR-style distributions and stress narratives.",
    implementationSteps: [
      "Model correlated Brownian motions or jump-diffusion factors with Cholesky or PCA loading.",
      "Implement fast RNG pipelines (Philox, XORWOW, Sobol) with batching for CPU/GPU.",
      "Allow pluggable payoff/strategy callbacks that consume simulated paths.",
      "Aggregate risk metrics (VaR, CVaR, tail scenarios) with visualization-ready JSON.",
      "Persist seeds and configuration for deterministic reruns during audits.",
    ],
    learningOutcomes:
      "Real-World Quant Application: Risk desks at BlackRock run Monte Carlo engines nightly to quantify cross-portfolio stress under liquidity crunches.",
    techStack: ["GPU", "Monte Carlo", "Risk"],
    tasks: [
      "Implement correlated path generation with configurable covariance.",
      "Add plug-in callbacks for pricing/strategy evaluation per path.",
      "Compute VaR/CVaR and percentile stats across simulations.",
      "Persist seeds/config to rerun exact stress scenarios.",
      "Visualize tail scenarios for reporting.",
    ],
  },
  {
    title: "Execution Cost Analyzer",
    description:
      "Analyze venue-level routing costs, queue positions, and slippage to recommend smarter execution slices.",
    longDescription:
      "Overview: build analytics that ingest fills, queue estimates, and microstructure stats to surface where orders should be routed next.",
    implementationSteps: [
      "Collect detailed fill logs including venue, queue depth, spread, and realized slippage.",
      "Estimate queue position decay using exchange-provided order IDs or synthetic models.",
      "Compute cost curves for participation rates versus realized spread capture.",
      "Generate venue recommendations with confidence scores and explainability notes.",
      "Render interactive dashboards to compare strategy variants.",
    ],
    learningOutcomes:
      "Real-World Quant Application: Execution teams at Kraken or Virtu rely on cost analyzers to tune smart-order routers and minimize venue fees.",
    techStack: ["Analytics", "Routing", "C++20"],
    tasks: [
      "Ingest historical fill logs and enrich with market context.",
      "Estimate queue position or time-to-fill metrics per venue.",
      "Compute realized spread capture by order type and participation rate.",
      "Rank venues with recommendations based on recent performance.",
      "Export a daily report for traders with actionable guidance.",
    ],
  },
];

async function seedRoadmap() {
  await prisma.roadmapNode.deleteMany();
  await prisma.roadmapNode.createMany({
    data: ROADMAP_SEED.map((node) => ({
      id: node.id,
      title: node.title,
      category: node.category,
      parentId: node.parentId,
      longDescription: node.longDescription,
      implementationSteps: JSON.stringify(node.implementationSteps),
      learningOutcomes: node.learningOutcomes,
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
        longDescription: project.longDescription,
        implementationSteps: JSON.stringify(project.implementationSteps),
        learningOutcomes: project.learningOutcomes,
        techStack: JSON.stringify(project.techStack),
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


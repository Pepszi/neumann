---
title: Why CAD data won't stay put
slug: why-CAD-data-wont-stay-put
order: 3
---

## Why CAD data won't stay put

### Reliable to eight nines still isn't reliable enough across a thousand-part assembly. The math of why.

It's hard to understand why keeping parametric CAD data intact between two updates is so challenging.

Think about this.

Let’s say your CAD system is extremely reliable: operations produce the same outputs for the same inputs 99.999999% of the time.

In a 1000-part assembly, where each part has 100 features, this means that 1 out of a thousand times, a feature tree rebuild will fail or produce different results.

The only solution? Guarantee that between updates, feature tree rebuilds are unnecessary, so the end results can be reloaded without reevaluation.

Why is that so hard?

Because it requires (decades) of backward compatibility. Geometry kernels do well here—Parasolid, for example, still supports geometry from 1986.

This connects to real customer problems: in manufacturing, products may need support for decades, making it critical to be able to access decades old CAD data, storing manufacturing documentation and geometry.

This would be relatively straightforward if the data representation were simply the geometry. But it’s not; it’s the feature tree, which defines the geometry as a sequence of operations, making the data representation essentially the implementation of the feature tree.

Storing the end result as "raw geometry" solves some of this, and it can guarantee that you can always restore the geometry at a very high success rate, but feature tree rebuilds might produce different outcomes.

So what can go wrong? Why is it so hard to guarantee 100% success rate? Computers are deterministic overall, aren't they?

Here are a few specific examples of what can go wrong.

---

1. Storing geometry in a container and using their unique ID or memory address to identify them. If there is an algorithm that uses "the first element" from a container that identifies objects based on the memory address, it's not guaranteed that "the first element" will be the same between two executions.
2. The result of optimization (minima/maxima search) algorithms often heavily rely on initial conditions. Guaranteeing the same initial conditions, yet achieving optimal results is extremely challenging.
3. The floating point behavior of different CPU architectures can be slightly different. Running the same numeric algorithm on an ARM CPU and an Intel CPU can lead to different results.

---

There are many more examples of course. Despite computers are deterministic, it's extremely hard to write deterministic computational geometry code.

CAD is hard.
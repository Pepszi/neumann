---
title: Why your CAD is slow
slug: why-your-CAD-is-slow
order: 1
---

## Why Your CAD is Slow

### So why is your CAD slow? Because it’s not using all your CPU cores, right? — No.

So what are the typical issues that make your CAD slow? There are two main reasons:

1. Computational geometry is inherently difficult, and computers struggle with boundary representation, the math under every CAD, CAM, and CAE.
2. Advanced workflows demand infinite scalability.

Let’s elaborate on these.

#### Computational Geometry is Hard

Boundary representation, the mathematical foundation of every CAD system, is well known to be a fundamentally flawed mathematical concept (see chapter *“What is Boundary Representation”* below). Creating a truly robust and fast boundary representation engine (AKA a geometry kernel) is not just hard but literally impossible on the current mathematical foundations. That’s why you have the exact same robustness, performance, and scalability issues across every CAD system. Not because the CAD developers are not smart enough, but because you can’t build a robust CAD on broken math. There are a few different issues that are impossible to overcome on the current mathematical foundations:

---

1. No inherent guarantees: There are no inherent guarantees for the validity of geometry in the underlying math, which makes it very easy to create broken geometry and makes it impossible to guarantee robustness.
2. Fundamentally single-core: Boundary representation algorithms are fundamentally single-core, which means the performance of a geometry engine (and a CAD system) cannot be increased simply by throwing more compute at it. You can buy the most advanced, highest-end workstation with 50 cores, and a single core will process the geometry most of the time.
3. Compounding tolerances: Working with complex surfaces inevitably introduces numerical tolerances in the geometry. These numerical tolerances compound, dramatically increasing the complexity of geometry operations and decreasing their robustness.

---

### Advanced Workflows Demand Infinite Scalability

Software engineer thinks: “Oh, this list will never contain more than a few hundred items; it’s perfectly fine if I use this $O(N^2)$ algorithm.”
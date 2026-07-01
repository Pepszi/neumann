---
title: Why your CAD is slow
slug: why-your-CAD-is-slow
order: 1
---

## Why Your CAD is Slow

### So why is your CAD slow? Because it’s not using all your CPU cores, right? — No.

So what are the typical issues that make your CAD slow? There are two main reasons:

---

1. Computational geometry is inherently difficult, and computers struggle with boundary representation, the math under every CAD, CAM, and CAE.
2. Advanced workflows demand infinite scalability.

---

Let’s elaborate on these.

#### Computational Geometry is Hard

Boundary representation, the mathematical foundation of every CAD system, is well known to be a fundamentally flawed mathematical concept (see chapter “What is Boundary Representation” below). Creating a truly robust and fast boundary representation engine (AKA a geometry kernel), is not just hard but literally impossible on the current mathematical foundations. That’s why you have the exact same robustness, performance and scalability issues across every CAD system. Not because the CAD developers are not smart enough, but because you can’t build a robust CAD on broken math. There are a few different issues that are impossible to overcome on the current mathematical foundations:

---

1. No inherent guarantees: There are no inherent guarantees for the validity of geometry in the underlying math, which makes it very easy to create broken geometry and makes it impossible to guarantee robustness.
2. Fundamentally single-core: Boundary representation algorithms are fundamentally single-core, which means the performance of a geometry engine (and a CAD system) cannot be increased simply by throwing more compute at it. You can buy the most advanced, highest-end workstation with 50 cores, and a single core will process the geometry most of the time.
3. Compounding tolerances: Working with complex surfaces inevitably introduces numerical tolerances in the geometry. These numerical tolerances compound, dramatically increasing the complexity of geometry operations and decreasing their robustness.

---

#### Advanced Workflows Demand Infinite Scalability

Software engineer thinks: “Oh, this list will never contain more than a few hundred items; it’s perfectly fine if I use this O(N^2) algorithm.” User does: “Let me just use this feature in a completely unexpected way and fill up that list with 4,500 items.”

CAD does: Takes 17 seconds to respond to a click.  
Solution: The software engineer replaces the algorithm with an O(log(N)) algorithm.

#### Another example:

Software engineer thinks: “It’s totally impossible that a few hundred bodies would need a lot of memory.”

User does: “Let me just load these super funky bodies with 98 super complex spline surfaces each and create a nice little pattern with 200 bodies.”

CAD does: Allocates 46 gigabytes of memory, swaps it out to background storage, and crashes the entire operating system.

Solution: The software engineer finds a more efficient way to tessellate funky spline surfaces and implements Level of Detail (LoD) and smarter memory management.

Of course, similar issues are typically the source of slowdowns in most software. The problem with CAD is that these issues are more common because users (rightfully) expect unlimited scalability, and geometry computations often produce some really extreme corner cases. The solution is to always assume that everything will be 100x larger than you expected, do everything incrementally, cache everything, be very smart about memory management, and expect the worst. There is no such thing as too many octrees. This is the exact kind of behavior that most software companies would consider over-engineering, but you simply can't over-engineer a CAD system. 

And the broken math? Well, that has to be fixed too.
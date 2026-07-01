---
title: Why you shouldn't write another b-rep kernel
slug: why-you-shouldnt-write-another-b-rep-kernel
order: 8
---

## Why you shouldn't write another b-rep kernel

### Every two years someone sets out to build a new CAD kernel. Here's how to think about it instead.

Every two years, the idea of creating a new CAD kernel resurfaces, but these teams always fail (at least since 1984) - even though it would be great if they succeeded. Here's how I would think about developing a "new" geometry kernel.

The main issue is that these teams approach the problem from the technology's perspective, rather than focusing on the customer's workflow.

B-rep is designed to implement workflows, and thanks to the maturity of current b-rep kernels (especially Parasolid), any customer workflow that can be solved using b-rep can be already handled by these kernels exceptionally well.

When I say exceptionally well, I mean pretty damn well. There's no potential for a 10x improvement here. Sure, you could make it a bit more robust or a little faster, but you won't achieve a 10x improvement in b-rep workflows due to the maturity of the existing kernels. The biggest issues with b-rep workflows today come come from applications that are built on the top of the kernels, and not from the kernels.

That being said, to figure out what the next geometry kernel should look like, it's essential to identify the workflows that are highly valuable but can't be handled well by b-rep.

It's also worth noting that b-rep has some excellent properties, such as parametric surfaces and topology. Topology is especially great because humans easily understand the concepts of faces and edges.

Developing a new kernel can't happen outside the existing ecosystem. Even if the new kernel uses a different representation, it must be somehow compatible with b-rep. Otherwise, adoption will be challenging. B-rep is the standard protocol for all workflows today.

If you want to solve all the b-rep workflows and even more to disrupt the b-rep world, you need something truly novel that resembles b-rep but isn't b-rep.

One of the biggest flaws to eliminate is the double bookkeeping intrinsic to b-rep. Since b-rep works with tolerances, the geometry and topology data are somewhat independent, requiring handling an endless amount of corner cases and inconsistencies that are the inevitable by-product of b-rep operations.

This double bookkeeping is at the root of many b-rep problems. You should look for a geometry representation that eliminates this issue. Implicits could be a great option, and @nTopology has done excellent work pioneering this technology.

If we could somehow add b-rep like structure to implicits, it could be a strong candidate for a next-generation kernel. You'd have infinite resolution, topology, the ability to run it directly on GPUs, real-time functionality, and extreme accuracy.

There are, of course, countless reasons to write another b-rep kernel: it's fun (I'd do it for fun!), legal considerations, etc. But for a real breakthrough, we need to focus on workflows and figure out how to build a better geometry tech stack to support more workflows.

Despite this, I'm rooting for everyone aiming to improve the world of computational geometry. However, I believe we should set more ambitious goals than just creating another b-rep kernel.
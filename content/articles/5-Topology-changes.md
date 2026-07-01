---
title: Topology changes
slug: topology-changes
order: 5
---

## Topology changes

### Watch the most robust kernel in the world quietly do the wrong thing — and learn why it has no choice.

Topology changes make CAD geometry fragile.

“We just need to lock in a bunch of engineers into a room, and they’ll write a new b-rep CAD engine in 3 years!”

Welp. No.

Besides the many other reasons I tweeted about before, here is another one that I only briefly mentioned so far: topology changes. It’s probably one of the biggest bottlenecks of building a robust b-rep engine.

A topology change means that during a modeling operation, not only the geometry (shape) of the faces and the edges change, but also the connectivity graph of the faces and edges: which are the faces that are connected to each other. Topology changes are happening quite frequently, pretty much with every boolean operation, or when a fillet is overflowing, the thickness of a shell operation is changed, etc.

But it’s just math, right?

Well, this is the problem, that it’s not just math. You red that right. There is no universal formula for implementing these topology changes, and for every single case, there is a different implementation in a geometry kernel. Yes, really. And because there are an unlimited number of topology change variants, kernels are trying to do their best, and implementing a good enough solution for a large number of combinations, and then pattern match all the cases into the implemented variants. If a kernel implements a large number of variants, the user will percieve it as robustness. If not, then the user will percieve it as fragility.

Arguably the most robust b-rep kernel on the market today is Parasolid. That’s not just because the Parasolid team has so many incredible mathematicians, but because over the decades Parasolid has been fed by zettabytes of customer data, and the Parasolid team one by one implemented hundreds or thousands of different variants of topology changes for every operation.

However, by nature, it can’t be perfect. Here are a few examples where Parasolid, the most robust b-rep engine does funky things for (relatively basic!) topology changes.

The behavior below is intentional: when the blend starts to overflow around the cutout, it suddenly expands to the neighbouring edge. However, at the end something strange happends: at an arbitrary number, the fillet radius cannot be increased further. Why? Because that particular case is not implemented.

## MISSING VIDEO

So what happens if we slightly modify this geometry, and add a bit of a material after the hole? Until the fillet reaches the bottom edge, things work as expected. But as soon as the blend overflows, Parasolid decides to just “eat” the hole and the added material, and just adds a blend. Is this intentional behavior? 100% not. Probably there is a similar, reasonable case, where this behavior makes sense, and based on the fillet algorithm’s topology change pattern matcher this belongs to that category, and Parasolid just decides to use that implementation for this case as well.

## MISSING VIDEO

What happens if we blend a different edge? Well - again something unexpected. To a certain point, the fillet behaves quite reasonably, but as soon as the top edge reaches the coutout’s inner edge, the fillet’s behavior drastically changes. Is it reasonable? I guess there are use cases where this is a reasonable behavior. If I wanted to model a geometry like this, would I approach it this way? 100% not, because it’s a completely unexpected behavior.

Same geometry, but let’s see how the chamfer algorithm behaves. As soon as the chamfer reaches the inner edge of the cutout, the algorithm switches to a different implementation, and the chamfer’s extension over the edge starts to behave very differently, aggressively “eating up” the rest of the body.

Another case, where I’d definitely not expect the blend to start removing material from the neighbouring pins.

But what happens if we increase the height of the neighbouring pin? Well, Parasolid skips that one, but keeps removing material from the next ones Again: probably for a similar topology configuration this behavior makes sense, it doesn't really make sense for this particular one - yet the pattern matcher picks this algorithm for this configuration.

But what happens if we willet the higher one? Well.

So far we only worked with planes and cylindrical surfaces (canonical geometry). As you can imagine, things are getting even harder with splines. In this case not just the topology changes are challanging, but creating the right surface for larger radii is also a very difficult problem. Not surprisingly b-rep can’t really handle it.

Parasolid is a fantastic b-rep engine. The problem is b-rep, not Parasolid. You could reproduce very similar issues with every b-rep kernel, like PTC Granite, Dassault Systemes CGM or Autodesk’s ShapeManager. Engineers learned to live with the fragility of b-reps, and to work around these issues over the decades. However, globally, the negative impact of these issues is measured in the range of hundreds of billions annually, due to the faulty geometry and wasted engineering centuries at larger companies.  

It’s 2026. We should do better.
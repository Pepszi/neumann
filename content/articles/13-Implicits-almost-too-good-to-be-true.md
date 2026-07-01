---
title: Implicits — almost too good to be true
slug: implicits-almost-too-good-to-be-true
order: 13
---

## Implicits — almost too good to be true

### There's a representation that's robust, precise, fast, and built for GPUs. It might change everything. Almost.

If there is anything that could replace and disrupt the b-rep ecosystem, it will be implicits/Signed Distance Fields. It would completely change the world of engineering software. Here is why

---

- I wrote a lot about b-reps before, and why it doesn’t make sense to write yet another b-rep kernel:
- It’s basically about covering a zillion corner cases, which has been done by all the commercial kernels
- Because of that, reaching industrial grade robustness takes a decade.
- But you still miss the application layer and the ecosystem integration, so what’s the point then?
- B-reps are intrinsically broken due to the double book keeping of the separate data structures of topology and geometry.

---

However, there is a magical representation, that’s almost too good to be true…

Meet implicit geometry - or Signed Distance Fields (SDF).

While b-reps describe geometry with their boundaries defined as surfaces and curves, SDFs describe geometry with a function S(x,y,z):

---

- Positive values: Outside the shape.
- Negative values: Inside the shape.
- Zero values: Exactly on the surface of the shape.
- Encodes both distance and orientation information (sign indicates inside/outside).

---

Implicits have some magical properties:

---

1. they can be directly rendered (ray traced!!!) on a GPU without tessellation
2. many operations that are insanely hard with b-reps are literally free for SDFs. For example an offset is simply just adding a number to the function. A boolean is simply a min/max function of two SDFs, for example a union is max(S1, S2). These operations literally cannot fail, unlike in b-rep kernels, that are famous of their lack of robustness.
3. because of this they are insanely fast. These operations are not only O(1) operations, but they are literally just appending an arithmetic operation. Imagine a feature tree with 10000 steps, where you can change or drag a parameter, and the entire thing updates real time.
4. they can describe infinitesimally detailed geometry, and insanely complex geometry structures, where b-rep just dies.
5. the memory consumption of the geometry representation is literally <1% of a similar b-rep especially for complex geometries.

---

So why are implicits not taking over the world?

---

- actually I think they will eventually
- implicits don’t have topology like b-rep. The concept of faces/edges don’t exist, and because of that the implicit workflows are very different compared to legacy CAD workflows.
- however there are already fantastic results in production, using the leading implicit modeler, @nTopology. @nTopology is an implicit CAD system specifically designed for ultra high end applications, like designing heat exchangers for space rockets and lightweighting drone parts in the defense industry. However, nTop is specifically focused on designing things that are impossible to design with b-reps, like lattice structures, where implicits truly excel. These applications are extremely high value applications, but not mainstream, partly because these parts need to be 3D printed, often from metal.

---

What needs to happen for implicits to go mainstream?

Someone needs to figure out how to create a workflow with impicits that is suitable for legacy workflows. This can be done either by redefining workflows with implicits or by figuring out how to make implicits behave like b-reps (but without bringing in all the crap that comes with b-reps). The former is an formidable go-to-market challenge, as it requires the entire industry to relearn CAD. The latter is a formidable technical challenge, as it is an insanely hard computational geometry problem, and it’s not even certain if it is doable.

What will a world look like if someone cracks this problem?

---

- assemblies with a million unique parts seamlessly running on an iPad
- parametric parts with 10,000 features updating real time when parameters change
- million part assemblies opening up in an instant on any computer
- no geometry operations will fail ever again. No non-manifold body errors, no failed booleans or shells. Everything will just work.
- real time simulations using physics AI models and SDF based physics solvers, like Monte Carlo or shifted boundary methods
- real time ray traced visualization of large geometries
- CAD data shrinks by 99%

---

Almost too good to be true, isn’t it?
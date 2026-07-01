---
title: What a geometry kernel actually is
slug: what-a-geometry-kernel-actually-is
order: 6
---

## What a geometry kernel actually is

### If all the math lives in the kernel, why are two CAD systems on the same kernel so different?

So what exactly is a geometry kernel?

If all the math is done by the geometry kernel, what’s the difference between two CAD systems that run on the same kernel? A lot!

First, let’s understand the scope of a geometry kernel, where it ends, and where the application layer starts.

A geometry kernel is responsible for (surprise!) performing the geometry operations in a CAD system. There are very few high-quality kernels in the world: Parasolid (Siemens, used in NX, Shapr3D, SOLIDWORKS, Solid Edge), ACIS (Dassault, now mostly obsolete), CGM (Dassault, used in CATIA), Granite (PTC), and ShapeManager (Autodesk’s fork of ACIS). A kernel is the heart and soul of a CAD system; without a top-tier geometry kernel, it’s not possible to create a high-performing CAD system. These kernels are based on boundary representation, representing 3D geometry with parametric curves and surfaces (not just a bunch of triangles). To better understand what a kernel does, here are a few examples of typical kernel functionalities:

---

- Interpolate a spline on a list of points.
- Create an extruded solid body from a 2D profile in the (x0, y0, z0) direction.
- Create a lofted body between a list of profiles with specified continuity constraints for the first and last curve.
- Split a body with a given surface.
- Calculate the intersection, union, or subtraction of multiple bodies.
- Tessellate bodies (convert them into a bunch of triangles).
- After performing an operation, the kernel will specify what happened to each topology (e.g., split, deleted, extended).
- Provide a way to incrementally undo/redo geometry changes.
- And a lot more. A high end kernel has thousands of API calls, and each API call has many many parameters.

---

So, what’s not included in a kernel that a CAD system has to handle? Here are a few examples:

---

- A constraint solver for sketch and assembly constraints.
- Data management.
- Data exchange (importers/exporters).
- Rendering.
- User interface.
- 2D drawings (though kernels support associativity between drawings and geometry).
- Assemblies (though kernels support an assembly implementation).
- Most importantly: parametric history.

---

The last point has significant consequences: this is why parametric history is not transferable between two CAD systems, even if they use the same kernel. Parametric history is an application-level implementation, so two different CAD vendors would need to implement the exact same parametric history on top of the kernel to be compatible at the history level.

Is this because CAD vendors are trying to lock you into their products? Even if they are, that’s not why history isn’t implemented at the kernel level. Geometry is just math, and it can be objectively determined what to expect from a geometry operation. However, parametric history is subjective and depends on the vendor’s product decisions. There are countless product decisions to be made, many nuances in the naming algorithm (which assigns unique IDs to each topology and is crucial for the robustness of a history implementation), memory management, caching, error handling, and more.

That said, the kernel matters a lot. Typically, if you perform the same operations in two different CAD systems running on the same kernel, you’ll get the exact same geometry, bit by bit. There are exceptions, though. For example, SOLIDWORKS has its own fillet implementation and doesn’t use Parasolid fillets for historical reasons. In Shapr3D, we also made some changes to the Parasolid fillet algorithm; for instance, in G2 setback blends, we replaced the default Parasolid corner blends with a much nicer surface. However, the robustness of the CAD system and the quality of the geometry largely depend on the kernel. The kernel can also impact performance; a well-written CAD system will spend around 50-60% of CPU time in the kernel during a full feature tree re-evaluation, with the rest spent in the application. Thus, the application-level code is also crucial for the performance of the CAD system.



But kernels can be only as good as the math they’re based on… And the math is flawed.


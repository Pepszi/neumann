---
title: Why feature trees break
slug: why-feature-trees-break
order: 2
---

## Why feature trees break

### Your tree didn't turn red because you did something wrong. It broke because of how CAD identifies an edge.

When your feature tree breaks, it’s often due to issues with the naming algorithm. Yet, most CAD designers don’t understand what naming is and how it works.

When you create a parametric feature tree, it generates a linear sequence of operations that define the geometry. To change the geometry, you go back to an operation, change a parameter, and “replay” the subsequent operations.

However, there is a problem.

Every operation takes edges, faces, or bodies as inputs. These geometries are recalculated every time the operations are reevaluated. For a CAD system to consistently identify a geometry, it must define a strategy to assign consistent unique IDs to every single edge, face, and body. This strategy is called the “naming algorithm.”

So, how does it work?

I often see people think that a CAD system might try to identify geometry based on similarities in size and shape after a feature tree update. For example, when we create a cylinder and apply a fillet on the top edge, after updating the cylinder’s radius and height, the CAD system could try to find a circular edge on the updated cylinder that’s the closest in location and size to the original filleted edge and apply the fillet on that edge.

This would be a terrible idea. Why?

Because the user’s original intent was to place that fillet on the cylinder’s top edge. If the location of the cylinder changes in a way that the bottom edge moves to where the original top edge was, the fillet will be applied to the bottom edge. That’s definitely not what we wanted.

So instead of using geometric similarities to identify elements, CAD systems use the parametric history of the geometry to assign unique IDs to them.

The root elements, which are usually 2D sketches, get unique names assigned to them when they are created. By extruding, lofting, sweeping, or revolving a profile, the new geometry will create easily distinguishable elements:

---

1. A bottom face
2. A top face
3. Side faces

---

The bottom and top faces will get names like “bottom face of the extrusion of rootProfileX,” and the side faces will get names like “side face2 of the extrusion of rootProfileX,” where face2 means that the face was generated from the second edge of the profile. The same logic applies to subsequent operations, except that they might refer to these generated names instead of "rootProfileX." It’s a bit like when royals are referred to with their entire lineage: King Jack, the son of Jane, the daughter of Jim.

Now that we have names for all the faces, let’s see how edges are named. In boundary representation, a solid body’s edge is simply the intersection of two faces. Thus, the name of an edge is “shared edge of face1 and face2.” Sounds super simple, right?

Haha, nope.

Unfortunately, even in simple cases, two faces might have multiple intersections. For example, imagine a cylinder with a cylindrical hole punched through it perpendicularly. The two cylindrical surfaces will have two intersections. So what can a CAD system do in this case? A lot of heuristics. More sophisticated CAD systems will use parameters, relative locations, and other information to assign a unique ID to both edges, but unfortunately, there is no perfect solution.

Naming is a major source of broken feature trees. Here are a few examples of what can go wrong with naming:

---

1. You refer to an offset face in an operation. The offset value changes, and the face splits into two faces. Now we have two faces where we used to have one. Which one should get the original name?
2. You use a filleted edge’s curve to constrain a sketch. The radius of the fillet changes, and the edge disappears. Bam, you have a broken reference.
3. You cut a cylindrical hole into a sphere and apply a fillet on one of the intersections. You move the cylinder a bit, and as you are moving it, the fillet magically appears on the other edge, then jumps back and forth. Unfortunately, the heuristics in this case didn’t work very well.

---

Fortunately, it’s often quite easy to avoid these situations. By understanding how naming works, you can consciously plan your parametric feature tree to create a robust feature tree that rarely breaks.

But for more advanced cases? What if I want a parametric operation that “fillets every edge that separates a drafted face from a non-drafted face”? What if I want a parametric operation that “shells a part to 1.2mm, except where wall thickness would drop below 0.8mm after shelling - there, locally thickens it”? Now every more complex parametric behavior that goes beyond the complexity of what’s possible to express with lineage based naming is impossible to implement in today’s CAD systems. But advanced workflows demand more robustness, and more complexity at the same time. How could we address that?
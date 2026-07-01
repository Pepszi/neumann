---
title: Boundary representation
slug: boundary-representation
order: 4
---

## Boundary representation

### The democracy of geometry: the worst representation there is — except for all the others that have been tried.

Boundary representation is the democracy of 3D CAD: it’s the worst form of geometry representation except for all those other forms that have been tried from time to time.

So what is b-rep? Why is it so great and so terrible at the same time?

B-rep is the mathematical foundation of how CAD systems represent geometry. B-rep represents shapes as parametric curves and surfaces that are connected to each other.

Unfortunately, parametric surfaces [s(u, v)=…] don’t necessarily have boundaries and don’t have a way to represent holes, like a plane (infinite in the u and v parameters) or a cylindrical surface (periodic in the v parameter, infinite in the u parameter) or a sphere (periodic in both parameters). B-rep solves this by adding boundaries and holes defined as curves laying on the surfaces. A face is a set of curves (that define the boundaries and the holes of the surface) and a single surface (on which the curves lay), and an edge is a curve segment of the boundary of the face (a trimmed curve, laying on the surface as part of the outer boundary or the inner hole).

Example 1: A finite cylindrical face is a cylindrical surface with two circles at the top and bottom of the cylinder, laying perfectly on the cylindrical surface.

Example 2: A square with a circular hole in the middle is a plane, bounded by four lines laying on the plane, and a circle laying on the plane in the middle of the square.

In these cases, all the edges (the boundaries of the faces) are so-called open edges because they are not connected to other faces. In other words, we have open sheet bodies, not solids. To create a solid body, we often need to connect multiple faces unless we have a closed surface, like a torus or a sphere. When two faces are connected, an edge is the intersection of the two surfaces.

B-rep has some excellent properties:

The parametric surfaces and curves are extremely accurate and can be used for manufacturing high-precision parts. The concept of faces and edges is natural and easily understood by humans, providing not only topology and geometry but also an interaction model to select and manipulate geometry. Operations like “make this edge rounded” or “move this face by 2mm” align with how humans think.

And b-rep has some… absolutely terrible properties that are intrinsic to the representation and not possible to overcome:

Nothing in this representation guarantees that the topology and the geometry will be consistent. A few examples:

---

- I can create a square with a circular hole where the curve of the hole overlaps with the boundary of the square, creating faulty geometry. I can create a face structure where one of the four lines of a square is missing, so the boundary of the square is invalid. I can create a face where the boundary of a hole or the outer boundary of the face is self-intersecting.
- I can create a body that consists of two cubes connected only through one shared edge, creating a zero-thickness region (non-manifold geometry) that cannot exist in the physical world. Tolerances. Since b-rep works with floating-point numbers and numerical algorithms, equality is defined with tolerances: two points, curves, and surfaces are the same if they are closer than a small number (typically 10^-6 meter or less). This means that a b-rep kernel needs to maintain two separate data structures: the topology (what is connected to what) and the geometry. While the two data structures are independent, what they represent is not. Thus, the kernel continuously needs to do double bookkeeping of two complex data sets. Welcome to b-rep hell.

---

So the issue is that there is nothing in the representation itself that guarantees that the geometric data makes sense. The role of a b-rep kernel (like Parasolid) is to ensure that every single operation creates consistent, high-quality data. These issues make writing a kernel a bit like self-driving cars: it’s fairly easy to get to 99%, but the remaining 1% takes forever. Why? Because to get to 99.99999% robustness, you need millions of users running into all the (combinations) of the above-mentioned use cases, reporting those issues, then implementing workarounds one by one for each of them. There is no easy or quick way to achieve that—yet boundary representation has become the industry standard for manufacturing in the last 50 years. Thus, creating a kernel for an alternative representation would come with insurmountable challenges.

Is it even possible?
---
title: The hidden tax of data exchange
slug: the-hidden-tax-of-data-exchange
order: 7
---

## What a geometry kernel actually is

### What actually happens when you export a file and open it somewhere else. It's worse than you think.

A deep dive on CAD data exchange... What happens when you export a file and import it to another CAD system? Why is it that one format might work when the other format doesn’t for the same geometry?

Welcome to the world of data translation.

So what is data translation? Why does it matter? Why is it hard? Why is it so fragile?

I wrote about different CAD file formats before. TLDR; a CAD format can contain metadata, a feature tree, geometry (boundary representation), and other application-specific information. Feature tree translation (transferring the design history from one CAD to another) is virtually impossible to implement in a robust way, although there are products that do this - but I would not rely on this in a production environment. So data translation typically means transferring:

---

1. Geometry defined as boundary representation
2. Metadata
3. Other application-specific data

---

Translating application-specific data and metadata is typically not very different from translating any other kind of data between two applications. There may or may not be a 1-1 mapping between the two systems, and the data translator will try to do its best to create a good mapping between the two. For example, one CAD system might support layers, the other CAD system doesn’t support layers but supports folders. In this case, it’s a quite reasonable decision to map layers into folders if the typical use cases of folders in CAD2 and layers in CAD1 are similar.

The real tricky part is translating geometry. And again, just like with many other things in CAD, the problem is boundary representation.

Boundary representation defines geometry with its boundaries as parametric curves and surfaces. There are two fundamental problems with translating boundary representation data:

---

1. Topology and geometry are represented separately in b-rep (which is pretty much the source of all evil in b-rep). Topology (what is connected with what) is defined by the CAD system’s geometry kernel based on the geometry and tolerances. B-rep as a mathematical concept does not define how to manage tolerances, it depends on the kernel. For example, CAD1 is running on Kernel1, CAD2 is running on Kernel2. Kernel1 uses 10^-5 meters as a tolerance for equality, Kernel2 uses 10^-6 meters. CAD1 creates a cube, where the end points of the three lines in a corner are 0.5 * 10^-5 meters away from each other, which in Kernel1 means that they are at the same point. When we export this cube to CAD2, if we just directly map the Kernel1 geometry to Kernel2 geometry, our solid cube ends up being a set of disconnected faces according to the geometry, but the topology still says that it’s a solid body. This will force Kernel2 to do all sorts of magic (called geometry healing) to make topology and geometry consistent. It can either blow up our cube and turn it into 6 separate faces, or it can try to manipulate the geometry to turn it into a solid object in the world of Kernel2. Either way, we will end up with different geometry, which can cause all sorts of manufacturing errors. Now, this is an extremely simple example, just imagine what happens when there are 6 spline surfaces connecting at a single vertex. A large part of writing data translators is about finding workarounds for these kinds of problems.
2. B-rep as a mathematical concept defines that the geometry is defined by parametric curves and surfaces, but it doesn’t limit what kind of curves and surfaces those could be. A completely generic implementation could decide that every curve and surface will be defined as NURBS at the cost of a huge performance, accuracy and memory penalty. Hence high-end kernels have many different surface and curve representations. For example, surfaces can be planes, cylinders, splines, conical surfaces, and in some high-end kernels, like Parasolid, even meshes. While there is a significant overlap between the types of surfaces and curves that different kernels can represent, there are always exceptions, and some neutral CAD formats limit the type of surfaces and curves further. A data translator needs to find a way to map these missing surface and curve types to each other, and often the only way is to fit a NURBS surface or curve on the geometry as a common representation. However, fitting always comes with inaccuracies and other unintended manufacturing issues.

---

And the worst part? All of these fixes and workarounds often go without any warnings, the CAD system just silently messes up the geometry. That being said: the best way to move data between two CAD systems is to avoid data translation. If you want to pick the right format, read my other thread about picking the right CAD format for data exchange.
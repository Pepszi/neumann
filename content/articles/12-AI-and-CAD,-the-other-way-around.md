---
title: AI and CAD, the other way around
slug: AI-and-CAD-the-other-way-around
order: 12
---

## AI and CAD, the other way around

### Forget text-to-CAD. The real AI opportunity in manufacturing runs in the opposite direction.

New CAD thread: AI+CAD (but the other way around)

I have written extensively about the difficulties of using Large Language Models (LLMs) and boundary representation (B-rep) geometry to generate text-based 3D models. While I strongly believe LLMs will fundamentally transform the world of CAD, we haven't seen anything so far that is meaningful beyond producing basic cubes with holes. Frankly, we won't see true breakthroughs in this space as long as we rely on B-rep combined with LLMs.

However, we are seeing another very exciting direction for AI among our customers: training models on geometry and synthetic data (such as physics simulations) derived from that geometry. The neural network is then used to identify optimal solutions for engineering problems or to generate new geometry entirely.

This direction has the potential to fulfill the long-standing promise of generative design, parametric part optimization, and automated part generation based on engineering constraints. Making this work at scale is the holy grail of manufacturing.

But again, doing this on the current technology stack - namely, B-rep geometry engines - is extremely difficult to automate and scale. The fragility and the shortcomings of B-rep engines is the current bottleneck to build truly groundbreaking AI workflows for manufacturing geometry.

---

1. Building Infinitely Robust Parametric Models is Impossible with B-reps

---

B-reps are inherently fragile. Local operations like fillets, face offsets, and shelling are especially prone to errors. This makes it virtually impossible to build a complex parametric model with 20 inputs that successfully updates across every single parameter combination. Unfortunately, that flawless automation is exactly what you need to generate vast datasets for training neural networks.

Another issue is how current CAD systems handle selection intent. Selection intent is typically expressed through topology tracking, meaning a selection set is identified by its lineage in the feature tree. This causes immediate rebuild errors whenever the topology changes. While you can make these behaviors somewhat more robust by using feature-based selections, they are still incredibly limited.

Example: Imagine you are designing a complex parametric mold, and you want to fillet "every edge that separates a drafted face from a non-drafted face." Expressing this kind of behavior in today’s CAD systems in a robust, parametric way is extremely difficult, if not impossible.

#### The Differentiability Problem

B-rep-based parametric models tend to jump around during parametric updates like Rachael Gunn (Raygun), the Australian Olympic breakdancer, did in her performance. They produce completely unpredictable, non-continuous changes. Neural networks hate datasets where changes are non-continuous and non-differentiable.

Achieving differentiability - or even getting close to it - is impossible using B-reps. Even if you somehow manage to make your B-rep behave nicely, the sketch constraint solvers will inevitably mess up your training data.

#### The Need for Robust, High-Performance Loss Functions

Evaluating B-reps is slow and fragile. Training models on large datasets requires extremely robust, lightning-fast loss functions; otherwise, your computational training costs will skyrocket.

#### Code-Friendliness (or Lack Thereof)

LLMs are great at generating code, but they are terrible at working around B-rep quirks. Code-based geometry generation is arguably a powerful way to create large training sets, and LLMs could theoretically help with that.

However, an LLM will always struggle with the unpredictability of B-reps. Even if the LLM's generated code is logically correct, the B-rep kernel might still fail to compute the geometry. This failure pushes the LLM down completely unpredictable execution paths, ultimately triggering hallucinations.
---
title: The CAD company I built that failed
slug: the-CAD-company-I-built-that-failed
order: 10
---

## The CAD company I built that failed

### Fifteen years ago I co-founded a company on the idea that CAD should be code. It failed. Here's what it taught me.

A while ago, I co-founded another CAD company, five years before starting Shapr3D and 15 years before I founded Neumann. The founding thesis of that company was that CAD should be like coding. Unfortunately, it failed miserably after a few years.

Here’s the story and a demo video from 2011

A friend of mine (one of the most brilliant people I know, Peter Varo, a software engineer turned industrial designer) approached me in 2009 and said:

"CAD sucks. Grasshopper is a good idea, but we should make coding the fundamental language of CAD, and it should work both ways: we should automatically generate the code as the user models."

At the time, it sounded very reasonable, so the next week, we started working on the concept. So many opportunities: easier version control, like git! Full control over the geometry! Better collaboration! Software engineering workflows for CAD! What's not to like?!

So we defined the language and even built a visual code editor (see below) on top of the language. In parallel, we tried to figure out how to automatically generate code for "regular" modeling.

We worked on the problem for two years, and each week our solution became more and more complex.

We completely lost sight of the customer’s workflow and focused on solving a problem that nobody really had. After a couple of years, I left, and the company went out of business a year later.

Here’s what we learned:

---

1. No matter what you do to make "code CAD" work, eventually, you'll run into the same issues that are currently solved by feature trees (because the two problems are identical, not because you are dumb). The biggest issue with "code CAD" is identifying and referencing topology. There's, of course, room for improvement in topology identification, but it’s not a 10x workflow improvement, and the problems it solves are usually uncommon.
2. Visual programming makes writing code harder, not easier. Sure, nodes are cool, especially for demos. It’s actually harder to learn than writing text using a good text editor. And when it comes to modifying existing code, a visual programming language makes it 10x harder.
3. The code-to-modeling direction is quite straightforward, but it ends up becoming a feature tree for the reasons mentioned above. The modeling-to-code direction doesn’t have a great solution. Eventually, you either generate a feature tree or build very specific patterns for certain workflows, but again, those are super niche.
4. There are a few use cases where this approach had real advantages over a feature tree, like managing and generating patterns and large numbers of objects programmatically. This makes sense, but only for a very small subset of workflows and companies.
5. This approach introduces substantial additional complexity without any real workflow gains. We should have worked closely with a well-defined set of customers and built a solution for their specific problems, instead of trying to solve the abstract problem of "CAD should be like code." That was a problem only we had.
6. There are a lot of problems that this approach could solve, if every mechanical engineer would be a software engineer too, but coding is hard. If coding was easy, would that completely change what’s possible to do with CAD as code? Well, we have AI now, that’s really good at writing code…


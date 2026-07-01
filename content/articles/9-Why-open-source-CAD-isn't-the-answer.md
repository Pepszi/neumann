---
title: Why open-source CAD isn't the answer
slug: why-open-source-CAD-isnt-the-answer
order: 9
---

## Why open-source CAD isn't the answer

### Valid complaints, wrong conclusion. Why there's no production-grade FOSS CAD — and probably won't be.

Concluding the previous FOSS CAD convo, here is my summary…

---

- Every now and then, someone suggests that FOSS (free open-source software) CAD should be the future of CAD because:
- CAD is expensive.
- Vendors lock in customers with proprietary formats.
- Customers could fix bugs and improve functionality.
- CAD is generally terrible, but FOSS CAD will be amazing.

---

These conclusions are wrong, even if they stem from valid observations.

FOSS CAD is not a feasible solution to some of the very real problems that CAD has, and it's no accident that there isn’t a production-grade FOSS CAD available. Here's why

---

1. The biggest issue with CAD today isn’t cost, it's clunkiness. FOSS software often struggles with creating high-quality user experiences. Yes, there are exceptions, but they’re exceptions. There’s a high likelihood that FOSS CAD would end up with the same clunky UX as legacy CAD systems.
2. Building a FOSS CAD would require creating a full b-rep kernel from scratch. There are only a few hundred people in the world with the expertise to work on a b-rep kernel, and it would take around 30-40 of them at least five years to develop a usable version. I know many of these folks, and they usually prefer working on novel problems. Convincing them to develop yet another b-rep kernel would be a tough sell.
3. Let’s assume you somehow manage to assemble an amazing team of computational geometry PhDs and secure the necessary funding (hundreds of millions of dollars). Congratulations, you’ve just created a brand-new CAD system that is completely outside the current ecosystem. Are you also planning to build simulation, CAM, etc., from scratch? If your tool is incompatible with existing systems, nobody will use it—not even for free—because the cost of incompatibility is exponentially higher than the cost of the CAD software itself.
4. Okay, you solve the ecosystem problem. You build a CAD stack that’s fully embedded in the existing CAD ecosystem. Congrats! You’ve now spent 10 years building another CAD system with the same issues as every other one, because it received less feedback from real-world use cases. Sure, it might be cheaper, and third parties could contribute to it, but the complexity of CAD technologies means that only a small number of people could actually make meaningful contributions.
5. Well, at least we’d have cheaper CAD, right? While it’s possible we could do better in terms of pricing, I believe that the free market and continued innovation are already addressing this.
6. Data lock-in isn’t a real problem. When Daimler switched from CATIA to NX, they archived all their data in JT format. According to them, the switch was more of a people issue than a technological one.

---

- I believe we should focus on solving the actual problems, such as:
- Making CAD more accessible
- Developing pricing that aligns with the value provided to different customer segments, from SMBs to enterprises
- Treating industry-standard CAD components as infrastructure.


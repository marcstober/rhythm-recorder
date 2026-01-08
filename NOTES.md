# Alternate CSS

```html
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
/>
```

# Some other info I got from Copilot when researching charts (didn't use any of these)

Here’s the clearest, most grounded comparison of **Frappe Charts**, **Chart‑Ease**, **MinimalBarChart**, and **Observable Plot**, using the factual material from the search results about Observable Plot.

---

# ⭐ **Short Answer**

**Observable Plot is in a completely different category from the “minimal chart libraries.”**  
It’s not a “chart type” library at all — it’s a **layered grammar‑of‑graphics system** built for **exploratory data analysis**, with transforms, faceting, projections, and composable marks.

If you want:

-   **Minimal, quick bar charts** → Frappe Charts / Chart‑Ease
-   **Expressive, analytical, composable visualizations** → Observable Plot

---

# 🔍 **What Observable Plot Actually Is (Based on the Sources)**

From the official documentation and GitHub repo:

-   Plot is _“a JavaScript library for exploratory data visualization”_
-   It uses **layered geometric marks** instead of chart types (e.g., `Plot.rectY`, `Plot.dot`, `Plot.line`)
-   It includes **scales, transforms, and facets** for analytical workflows
-   It supports **GeoJSON and projections** for maps
-   It is built by the **same team as D3** and uses D3 under the hood
-   It implements a **grammar of graphics** approach with a concise but expressive API

This makes Plot much closer to **Vega-Lite** or **ggplot2** than to Chart.js or Frappe.

---

# 📊 **Comparison Table**

| Feature         | Frappe Charts      | Chart‑Ease                | MinimalBarChart     | **Observable Plot**                                  |
| --------------- | ------------------ | ------------------------- | ------------------- | ---------------------------------------------------- |
| Rendering       | SVG                | SVG                       | DOM/SVG hybrid      | **SVG**                                              |
| Philosophy      | Simple chart types | Lightweight web component | Ultra-minimal       | **Grammar of graphics**                              |
| Complexity      | Very low           | Very low                  | Extremely low       | **Medium–high**                                      |
| Best For        | Quick dashboards   | Minimal embeds            | Teaching DOM basics | **Exploratory data analysis**                        |
| Chart Types     | Predefined         | Predefined                | Only bar/scatter    | **No chart types — marks**                           |
| Transforms      | None               | None                      | None                | **Built-in transforms (binning, rolling, grouping)** |
| Faceting        | No                 | No                        | No                  | **Yes**                                              |
| Projections     | No                 | No                        | No                  | **Yes (GeoJSON + D3 projections)**                   |
| Learning Curve  | Very easy          | Very easy                 | Very easy           | **Moderate**                                         |
| Customizability | Limited            | Medium                    | Low                 | **Extremely high**                                   |

---

# 🧠 **How to Think About the Difference**

## **1. Observable Plot is not a “chart library”**

Plot doesn’t have “bar chart,” “line chart,” etc.  
It has **marks** (rectangles, dots, lines) that you layer to _construct_ a bar chart.

This gives you:

-   More control
-   More expressiveness
-   More analytical power

But it also means:

-   More to learn
-   More code for simple cases

---

## **2. Plot is built for _analysis_, not dashboards**

Plot’s design is explicitly for **exploratory data visualization**.  
It shines when you need to:

-   Bin data
-   Aggregate on the fly
-   Facet by categories
-   Layer multiple marks
-   Transform data without preprocessing

Minimal libraries don’t do any of this.

---

## **3. Plot is built on D3 — but much simpler**

Plot gives you D3-level power with a much more concise API.  
If you ever want to teach students the conceptual foundations of visualization (scales, marks, transforms), Plot is a beautiful bridge.

---

# 🎯 **Which Should _You_ Use, Marc?**

Given your teaching style and your interest in:

-   making complex ideas accessible,
-   reproducible workflows,
-   semantic clarity,
-   and showing students how visualization _works_…

### **Observable Plot is the most aligned with your pedagogical goals.**

It lets you:

-   demonstrate the grammar-of-graphics model,
-   show how transforms and scales operate,
-   build visualizations that _explain themselves_,
-   and avoid the “black box” feeling of chart-type libraries.

But if your goal is:

-   “I just need a minimal bar chart in 30 seconds,”  
    then **Frappe Charts** or **Chart‑Ease** is still the right tool.

---

# If you want, I can also:

-   write a side‑by‑side code comparison (Plot vs Frappe vs Chart‑Ease),
-   show how to build the _same_ bar chart in all four libraries,
-   or help you choose a teaching‑friendly example for your students.

Just tell me which direction you want to explore.

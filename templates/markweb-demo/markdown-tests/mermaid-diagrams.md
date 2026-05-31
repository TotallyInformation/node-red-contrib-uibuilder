---
title: Mermaid Diagrams
description: Markweb automatically loads the Mermaid library which allows you to create various diagram types using a simple text-based syntax.
status: complete
since: "v7.7.0, 2026-05-07"
---

Mermaid diagrams are included in your Markdown using the following syntax:

````
```mermaid
journey
    title Example User Journey - Working from Home
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me
```
````

Though only 1 example is show above, several are included below to test out Mermaid's various diagram types and features.

Markweb uses the default "dark" theme.

See the [Mermaid documentation](https://mermaid.ai/open-source/intro/) for more details on the syntax and features available.

Mermaid diagram rendering is the exception to the Markweb rule of rendering on the Server rather than in the client browser.
This is because Mermaid uses various browser APIs not available in the Node.js environment.
If you see the raw text instead of the diagram, check the browser console for errors related to Mermaid rendering.
It is likely that the pre-built Mermaid library is not being loaded correctly, or that you have an error in your Mermaid syntax.

---

```mermaid
journey
    title Example User Journey - Working from Home
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me
```
```mermaid
gantt
    title A Gantt Chart
    dateFormat YYYY-MM-DD
    section Section
        A task          :a1, 2014-01-01, 30d
        Another task    :after a1, 20d
    section Another
        Task in Another :2014-01-12, 12d
        another task    :24d
```
```mermaid
---
config:
  pie:
    textPosition: 0.5
  themeVariables:
    pieOuterStrokeWidth: "5px"
---
pie showData
    title Key elements in Product X
    "Calcium" : 42.96
    "Potassium" : 50.05
    "Magnesium" : 10.01
    "Iron" :  5
```
```mermaid
---
title: Example Git Commit Chart
---
gitGraph
   commit
   commit
   branch develop
   checkout develop
   commit
   commit
   checkout main
   merge develop
   commit
   commit
```
```mermaid
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
```

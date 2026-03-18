---
created: 2026-03-18 13:32:08
updated: 2026-03-18 13:48:39
---
### `logStack` - Logs the stack trace details to the console in a readable format :id=logStack

This function generates a stack trace of the current execution point and logs it to the console in a readable format. Each object in the array represents a stack frame and contains details such as the function name, source file name, line number, and column number. This can be useful for debugging and understanding the flow of your code, especially when dealing with complex and deeply nested functions.

> [!TIP]
> The [`stack`](client-docs/functions#stack) function is a related function that returns the stack trace details as an array of objects for further processing.

#### Example output

> [!NOTE]
> Each browser creates very different stack trace formats because they are not currently part of the JavaScript standard. The `stack` function normalizes these different formats into a consistent structure. However, the exact details available may vary depending on the browser and its support for stack trace information.
> 
> The `raw` property contains the original stack trace line as a string, which can be useful for logging or debugging purposes.
>
> Note that the stack trace output for Safari browsers is pretty much useless as it does not provide function names or line/column numbers. It only provides the source function name.

```
Call stack: (3) [{…}, {…}, {…}]
```

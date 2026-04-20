---
created: 2026-03-18 13:32:08
updated: 2026-03-18 13:48:30
---
### `stack` - Returns an array of stack trace details for the current execution point :id=stack

This function generates a stack trace of the current execution point and returns it as an array of objects. Each object in the array represents a stack frame and contains details such as the function name, source file name, line number, and column number. This can be useful for debugging and understanding the flow of your code, especially when dealing with complex and deeply nested functions.

> [!TIP]
> The [`logStack`](client-docs/functions#logStack) function is a related function that logs the stack trace details to the console in a readable format for convenience.

#### Example output

> [!NOTE]
> Each browser creates very different stack trace formats because they are not currently part of the JavaScript standard. The `stack` function normalizes these different formats into a consistent structure. However, the exact details available may vary depending on the browser and its support for stack trace information.
> 
> The `raw` property contains the original stack trace line as a string, which can be useful for logging or debugging purposes.
>
> Note that the stack trace output for Safari browsers is pretty much useless as it does not provide function names or line/column numbers. It only provides the source function name.

```json
[
    {
        "functionName": "myFunction",
        "fileName": "app.js",
        "lineNumber": 10,
        "columnNumber": 15,
        "raw": "   at myFunction (app.js:10:15)"
    },
    {
        "functionName": "anotherFunction",
        "fileName": "app.js",
        "lineNumber": 20,
        "columnNumber": 5,
        "raw": "   at anotherFunction (app.js:20:5)"
    },
    ...
]
```

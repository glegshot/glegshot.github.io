---
title: Variable Mysteries And Secret of Hoisting
author: Sreekumar T
keywords: javascript, variables, var, let, const, hoisting, pitfalls
---

#  Variable Mysteries And Secret of Hoisting

As I transitioned from backend development to  full stack role, I naturally attempted to apply my Java skills while coding in JavaScript.

I was surprised when I encountered a certain piece of code.

Consider below snippet

```javascript
console.log(number); // Outputs: undefined, why didn't this throw an error?
var number = 10;
console.log(number); // Outputs: 5
```

It seemed odd. Even though the variable `number` was declared later, it was possible to access it before hand the code didn't crash; it just showed `undefined`.

Searching out for a possible answer, I found that JavaScript does something called hoisting with `var`.

In JavaScript, hoisting is a behavior where variable and function declarations are moved to the top of their containing scope during the compile phase, before the code is executed. This means that regardless of where a variable or function is declared within a scope, it is as if it is declared at the top of that scope.

In the above example,
even though `number` is logged before it is declared and assigned a value, the code doesn't produce an error. This is because during compilation, the variable declaration `var number` is hoisted to the top of its scope, effectively making it equivalent to:


```javascript
var number;
console.log(number); // Outputs: undefined
number = 5;
console.log(number); // Outputs: 5
```

Also to note that function declarations are also hoisted. For example:

```javascript
sayHello(); // Outputs: "Hello, world!"

function sayHello() {
  console.log("Hello, world!");
}
```

Here, the function `sayHello` is called before its declaration, but it still works because the function declaration is hoisted to the top of its scope.

However, it's important to note that only the declarations are hoisted, not the initializations. For example:

```javascript
console.log(number); // Outputs: undefined
var number = 10;
```

In this case, the variable `number` is hoisted to the top of its scope, but its initialization (`number = 10`) remains in place. This is why `number` is `undefined` when logged before its initialization.

Once `var` confusion was cleared, I then discovered another keywords `let` and `const`, which where relatively newer things in JavaScript:

Now, consider below example:

```javascript
console.log(number); // This throws an error "Cannot access 'number' before initialization".
let number = 10;
console.log(number); // Never executed since error thrown above
```

`let` behaves differently. It doesn't get hoisted and throws an error if you try to use it before giving it a value.

Let's see `const`:

```javascript
const number = 10;
console.log(number); // Shows 10, as expected.
number = 20; // Oops, error! Says "Assignment to constant variable."
```


`const` is straightforward. Once you give it a value, it's locked in place. This is synonymous to the `final` keyword used in Java for constant declaration.

To summarize, `var` gets hoisted, `let` stays where it is declared and complains if accessed early, and `const` is like `let` but doesn't change its value once initialized.  
Just a glimpse into the quirks of JavaScript as you navigate from Java.

Understanding hoisting is critical and will certainly help developers avoid unexpected behavior and write more predictable code.  

Thank you for your time.  
Hope this article was helpful :D
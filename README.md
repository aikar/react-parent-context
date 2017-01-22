# React Parent Context
## What and Why
React has a [Context API](https://facebook.github.io/react/docs/context.html), 
however it is marked as "Not Public" and "May Break at any time".

However, the ability it provides to access your parents state is invaluable to a lot of design.

Rather than using a volatile API, React Parent Context provides an API that provides some of the same
benefits of using the official React Context API, but with less leg work defining Context Type maps.

This form of sharing state instead of using properties removes the need to waterfall a property down,
avoiding passing it to intermediate components that have no understanding of the data being passed.


## Usage
You need an instance of ReactParentContext for all API's. A global instance is provided as:
```javascript
const context = ReactParentContext.getGlobalContext();
```

A component that provides itself as a context must call 
```javascript
context.provideContext("SomeIdentifier", this);
// or
context.provideContext(this);
```

Children components will then need to call:
```javascript
// in constructor:
this.contextRetriever = context.obtainRetriever();

// then in constructor (preferred) or onRender 
const context = this.contextRetriever.getContext("SomeIdentifier");
// or
const context = this.contextRetriever.getContext(SomeClass);
```

## Example
See [examples.jsx](examples/example.jsx) for an example on how to use this system.
A game with a player list is a great example. What if your player list is part of another component tree?

The "normal way" to do this would be to pass a reference to the array of the players to the component, 
but if your Player List is potentially 5 layers deep, with multiple wrapping components, it could be quite a lot
of passing properties around, and especially with passing to properties that have no understanding of what to do
with a list of players.


## License
react-parent-context (c) Daniel Ennis (Aikar) 2017-present.

react-parent-context is licensed [MIT](https://tldrlegal.com/license/mit-license). See [LICENSE](LICENSE)


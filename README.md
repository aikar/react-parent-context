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
ReactParentContext has only been tested using ES6 Module Syntax with Webpack. 
```javascript
import ReactParentContext from "react-parent-context";
```

If you use CommonJS, you will need to do:
```javascript
var ReactParentContext = require('react-parent-context').ReactParentContext;
```
Using it as a plain JavaScript file is not supported (And if you're developing React, you likely aren't doing that anuways :)


You need an instance of ReactParentContext for all API's. A global instance is provided as:
```javascript
const context = ReactParentContext.getGlobalContext();
```

A component that provides itself as a context must call 
```javascript
context.provideContext(this);
// or use a custom identifier
context.provideContext("SomeIdentifier", this);
```

It is also possible to provide another context other than your component object:
```javascript
context.provideContext(this, {otherContext: 42});
// or use a custom identifier
context.provideContext("SomeIdentifier", this, {otherContext: 42});
```



Children components will then need to call:
```javascript
// MUST BE IN CONSTRUCTOR AND NOT RENDER:
this.contextRetriever = context.obtainRetriever();

// then in constructor (preferred) or in render() 
const context = this.contextRetriever.getContext("SomeIdentifier");
// or
const context = this.contextRetriever.getContext(SomeClass);
```

If the context can not be found, an error will be thrown. It is expected that if you are using this API, you are
expecting a context. 

If you do have a use case for optional context, simply wrap the retriever call in a try/catch.

## Example
See [examples.jsx](examples/example.jsx) for an example on how to use this system and some test suites for validating
its functionality.

A game with a player list is a great example. What if your player list is part of another component tree?

In our example, the Game object only references a PlayerPanel. It doesn't know what PlayerPanel is going to do,
nor does it care. The only thing it knows a player panel wants is the players current name.
 
The PlayerPanel then has a player list structure.

The "normal way" to do this would be to pass a reference to the array of the players to the PlayerPanel, 
but if your Player List is potentially 5 layers deep, with multiple wrapping components, it could be quite a lot
of passing properties around, and especially with passing to properties that have no understanding of what to do
with a list of players.

This lets us avoid passing state to intermediate components who do not need it.

## Developer Setup
To build this project, I have only tested NodeJS v6. 
Yarn Package Manager is preferred.

Source is transpiled with Babel before deployment
```
yarn install
npm run example
```


## License
react-parent-context (c) Daniel Ennis (Aikar) 2017-present.

react-parent-context is licensed [MIT](https://tldrlegal.com/license/mit-license). See [LICENSE](LICENSE)


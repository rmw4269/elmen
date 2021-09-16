# elmen
small JS library for creating and nesting HTML elements and other nodes

## introduction
This library was developed to streamline the process of defining and modifying HTML elements by enhancing it with function chaining and intuitive nesting. I started this code one day to give me less of a headache.

## example
I want to create a `ul` element with a number of bullets defined by an input. Here’s a custom function that could be written to generate it:
```javascript
function makeList(...items) {
	return new Elmen("ul").withClasses("item-list").withAttributes({start: 0}).withChildren(
		items.map(item => new Elmen("li").withChildren(item))
	).done();
}
```
With an input of a few `String`s, I can generate this:
```html
<ul class="item-list" start="0">
	<li>potatos</li>
	<li>carrots</li>
	<li>pie</li>
</ul>
```
Because of how general the function is, I could even pass in elements like so:
```javascript
makeList(
	new Elmen("i").withChildren("Escherichia Coli"),
	"sea stars",
	new Elmen("a").withAttributes({href: "https://Wikipedia.org/wiki/Simian"}).withChildren(
		"infraorder ",
		new Elmen("i").withChildren("Simiiformes")
	),
	new Elmen("span").withCSS([["text-transform", "uppercase"], ["font-variant-caps", "unicase"]]).withChildren("tardigrade")
);
```
to generate this HTML:
```html
<ul class="item-list" start="0">
	<li><i>Escherichia Coli</i></li>
	<li>sea stars</li>
	<li><a href="https://Wikipedia.org/wiki/Simian">infraorder <i>Simiiformes</i></a></li>
	<li><span style="text-transform: uppercase; font-variant-caps: unicase;">tardigrade</span></li>
</ul>
```
This can be expanded to *much* more complex applications.

## contributing
If you have questions, concerns, or ideas for this project, *please* reach out to me via email or pull request!

## documentation

Any function whose name starts with “with” returns the same `Elmen` object from which the function was called, so they can be chained together.

```javascript
let test = new Elmen("span");
test.withChildren("Hello, World!").withClasses("fancy"); // returns test
```

### Elmen(elementOrTagName)

This constructor creates a new `Elmen` instance, using a pre-existing element or constructing a new one. The argument can be one of three things.
* An Elmen will have its related element copied to the new instance.
* A string will be [interpreted as a tag name](https://developer.Mozilla.org/docs/Web/API/Document/createElement) for a new element.
* An HTML element will be linked with the new Elmen and be the target of all actions.

### get()

This simply returns the associated element.

### done()

This returns the associated element and finalizes it, removing its link to the element.

### withAttributes(attributes)
*alias: withAttribute*

This applies the attributes to the element. The enumerable properties of the argument are assigned as attributes to the element, where the property name corresponds to the attribute name and the property value corresponds to the attribute value.

For example, this code generates the following HTML:
```javascript
new Elmen("h1").withAttributes({id: "top"}).done()
```

```html
<h1 id="top"></h1>
````

### withClasses(...classes)
*alias: withClass*

This adds the given classes to the element’s [classList](https://developer.Mozilla.org/docs/Web/API/Element/classList).

### withCSS(styleDeclaration)
*aliases: withStyle, withStyles*

This adds to the element the given CSS styles as inline styles. The argument may be formatted in one of three ways.

#### CSSStyleDeclaration
A [CSSStyleDeclaration](https://developer.Mozilla.org/docs/Web/API/CSSStyleDeclaration) will have its properties copied over.

#### 2‑D array
Each element in the argument is interpreted as a property. For example, this array corresponds to the following CSS declaration:
```javascript
[
	["color", "red"],
	["font-size", "1.5em", "important"],
	["display", "block !important"],
	["--custom-property", 12, ""]
]
```

```css
{
	color: red;
	font-size: 1.5em !important;
	display: block !important;
	--custom-property: 12;
}
```

#### token list
All arguments given are treated as an array; the items in the array are pulled from the front and used to assemble a 2‑D array as specified above, with every two arguments describing the property name and the value, respectively.
**Please note that this is the slowest option, as it uses one level of recursion and extra processing. It is not recommended to use this option to set many properties at once.**
For example, the following code generates the same styles as previously shown:
```javascript
new Elmen(a).withCSS(
	"color", "red",
	"font-size", "1.5em !important",
	"display", "block !important",
	"--custom-property", 12
).done()
```

### withChildren(...children)
*alias: withChild*

This [appends](https://developer.Mozilla.org/docs/Web/API/Node/appendChild) the provided children, in order, to the element. Children may be any combination of `String`s, [`Node`](https://developer.Mozilla.org/docs/Web/API/Node)s, or `Elmen`s. Any `null` and `undefined` values are ignored; if verbosity is high, then an [info](https://developer.Mozilla.org/docs/Web/API/Console/info) message is sent to the console for each of these.
Arguments given as `String`s, booleans, numbers, or [`BigInt`](https://developer.Mozilla.org/docs/Glossary/BigInt)s (with or without wrappers) are converted to [text `Node`](https://developer.mozilla.org/en-US/docs/Web/API/Text)s, and `Elmen`s are finalized to their respective elements. Any [`Symbol`](https://developer.Mozilla.org/docs/Glossary/Symbol), function, or object not mentioned will throw an error.

### withListeners(...listeners)
*alias: withListener*

This registers event listeners to the element. Each argument must follow the format of the `options` argument of the native [`addEventListener()`](https://developer.Mozilla.org/docs/Web/API/EventTarget/addEventListener). Two additional properties must be given to the object; `type` is a `String` describing the [event type](https://developer.Mozilla.org/docs/Web/Events), and `listener` is the function called when the event is fired. The arguments are not mutated, so they can be reused. This is all simply a way of compressing the concept of an event listener and its configuration into one object. Here’s an example of a valid argument:
```javascript
{
	type: "click",
	capture: false,
	once: false,
	passive: true,
	listener: (event => console.log("Hello, world!"))
}
```

### withActions(...functions)
*alias: withAction*

This runs the provided functions, in order, on the element. Each function takes in only the element as an argument. If [`typeof`](https://developer.Mozilla.org/docs/Web/JavaScript/Reference/Operators/typeof) reports that an argument is not a function, then an error is thrown.

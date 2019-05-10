# elmen
small JS library for creating and nesting HTML elements and other nodes
## introduction
This library was developed to streamline the process of defining and modifying HTML elements by enhancing it with function chaining and intuitive nesting. I started this code one day to give me less of a headache.
## example
I want to create a `ul` element with a number of bullets defined by an input. Here’s the function to generate it:
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

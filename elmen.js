class Elmen {

	/**
	 * This creates a new {@linkcode Elmen} instance, using a pre-existing element or constructing
	 * a new one.
	 * @param {HTMLElement | String} elementOrTagName element to use or HTML tag name for the
	 * element to create
	 */
	constructor(elementOrTagName) {
		Object.defineProperty(this, "finalized", {
			configurable: true,
			enumerable: false,
			value: false,
			writable: true
		});
		if (elementOrTagName instanceof String || typeof elementOrTagName === "string") {
			elementOrTagName = document.createElement(elementOrTagName);
		} else if (elementOrTagName instanceof Elmen) {
			elementOrTagName = elementOrTagName._element;
		}
		if (Elmen.verbosity <= Elmen.VERBOSITY.NO_CHECKS || elementOrTagName instanceof HTMLElement) {
			Object.defineProperty(this, "_element", {
				configurable: true,
				enumerable: false,
				value: ((elementOrTagName instanceof Elmen) ? elementOrTagName._element : elementOrTagName),
				writable: false
			});
		} else {
			throw `The given argument is not a tag name, an HTMLElement, or an Elmen; it is a ${typeof elementOrTagName}.`;
		}
	}

	/**
	 * This is a getter for the element and does nothing else.
	 * @returns {HTMLElement} the element
	 * @see Elmen#done
	 */
	get() {
		return this._element;
	}

	/**
	 * This is a getter for the element. However, this also finalizes (sets
	 * {@linkcode Elmen#finalized} to {@code true}) this {@linkcode Elmen}, removing its link to the
	 * element.
	 * @returns {HTMLElement} the element
	 * @see Elmen#finalized
	 * @see Elmen#get
	 */
	done() {
		let out = this._element;
		delete this._element;
		Object.defineProperty(this, "finalized", {
			configurable: false,
			enumerable: false,
			value: true,
			writable: false
		});
		return out;
	}

	/**
	 * This adds the given attributes to the element. The enumerable properties of the argument
	 * are assigned as attributes to the element, where the property name corresponds to the
	 * attribute name and the property value corresponds to the attribute value.
	 * @param {Object} attributes object whose enumerable properties properties are used as
	 * 	attributes
	 * @returns this {@linkcode Elmen}
	 */
	withAttributes(attributes) {
		if (Elmen.verbosity <= Elmen.VERBOSITY.NO_CHECKS || typeof attributes != "object") {
			throw "The argument must be an object whose enumerable properties represent the desired attributes to be applied.";
		}
		for (let attributeName of Object.getOwnPropertyNames(attributes)) {
			let attributeValue = attributes[attributeName];
			this._element.setAttribute(attributeName, (attributeValue == undefined || attributeValue == null) ? "" : attributeValue);
		}
		return this;
	}

	/**
	 * This adds the given classes to the element’s {@linkcode HTMLElement#classList}.
	 * @param {...String} classes classes to add
	 * @returns this {@linkcode Elmen}
	 */
	withClasses(...classes) {
		this._element.classList.add(...classes);
		return this;
	}

	/**
	 * This adds CSS styles defined by `styleDeclaration` to the element. The argument must be
	 * <ul>
	 * 	<li>a `styleDeclaration`</li>
	 * 	<li>an array of two-element or three-element arrays, each array specifying the property
	 * 			name, property value, and optionally the property’s priority
	 * 			<p>The lengths may be mixed. If a two-element array has a property value ending in
	 * 					“ !important”, then it will be extracted into the priority.</p></li>
	 * 	<li>a variable number of arguments, with each pair specifying a property as in the array method
	 * 			<p>The number of arguments must be divisible by two, or an exception will be
	 * 					thrown. This argument structure is slowest, because it is restructured to a 2-D array
	 * 					that is then recursively passed into {@linkcode Elmen#withCSS}.</p></li>
	 * </ul>
	 * This method never deletes CSS properties.
	 * @param {CSSStyleDeclaration | String[][] | ...String} styleDeclaration styles to add
	 * @returns this {@linkcode Elmen}
	 */
	withCSS(styleDeclaration) {
		if (styleDeclaration instanceof CSSStyleDeclaration) {
			if (this._element.style.length == 0) {
				this._element.style = style;
			} else {
				let propertyName;
				for (let index = 0; index < styleDeclaration.length; index++) {
					propertyName = styleDeclaration.item(index);
					this._element.style.setProperty(propertyName, styleDeclaration.getPropertyValue(propertyName), styleDeclaration.getPropertyPriority(propertyName));
				}
			}
		} else if (Array.isArray(styleDeclaration)) {
			for (let property of styleDeclaration) {
				let priority = undefined;
				if (property.length > 2) {
					priority = property[2];
				} else if (String(property[1]).endsWith(" !important")) {
					priority = "important";
					property[1] = property[1].substring(0, property[1].length - " !important".length);
				}
				this._element.style.setProperty(property[0], property[1], priority);
			}
		} else {
			let tokens = Array.from(arguments);
			let properties = [];
			if (tokens.length % 2 == 0) {
				if (Elmen.verbosity >= Elmen.VERBOSITY.HIGH) {
					console.group(`interpreting tokens as property-value pairs${String.fromCodePoint(0x2026)}`);
				}
				while (tokens.length >= 2) {
					properties.push([tokens.shift(), tokens.shift()]);
				}
			} else {
				throw "CSS properties need to be defined as property-value pairs. Otherwise, use a 2-D array.";
			}
			if (Elmen.verbosity >= Elmen.VERBOSITY.HIGH) {
				console.table(properties.map(prop => { return {property: prop[0], value: prop[1]}; }));
				console.groupEnd();
			}
			return this.withCSS(properties);
		}
		return this;
	}

	/**
	 * This appends the provided children, in order, to the element. Children may be any
	 * combination of {@linkcode String}s, {@linkcode Node}s, or {@linkcode Elmen}s. Null
	 * and undefined values are automatically stripped.
	 * {@code String}s are converted to string {@code Node}s, and {@linkcode Elmen}s are
	 * {@linkcode Elmen#done finalized} to their respective elements.
	 * @param {...String | Node | Elmen} children children to append
	 * @returns this {@linkcode Elmen}
	 */
	withChildren(...children) {
		if (Array.isArray(children)) {
			children = children.flat();
		}
		for (let child of children) {
			if (child !== null && child !== undefined) {
				let childType = typeof child;
				if (!(child instanceof Node)) {
					if (child instanceof Elmen) {
						child = child.done();
					} else if (child instanceof String || childType === "string") {
						child = new Text(child);
					} else if (
						Elmen.verbosity <= Elmen.VERBOSITY.NO_CHECKS
						|| child instanceof Number
						|| childType == "number"
						|| child instanceof Boolean
						|| childType == "boolean"
						|| child instanceof BigInt
						|| childType == "bigint"
					) {
						child = new Text(String(child));
					} else {
						throw `The child type “${childType}” is unsupported or cannot be converted into a text node. Supported types are:${[].map(type => `• ${type}`).join("\n")}`;
					}
				}
				this._element.appendChild(child);
			} else if (Elmen.verbosity >= Elmen.VERBOSITY.HIGH) {
				console.info(`${child === null ? "A null" : "An undefined"} child was skipped.`);
			}
		}
		return this;
	}

	/**
	 * This attaches event listeners, in order, to the element. Each argument must follow the
	 * format of the {@code options} argument of {@linkcode EventTarget#addEventListener}, but
	 * with two additional properties:
	 * <ul>
	 * 	<li>{@code type} whose value is equivalent to the {@code type} argument of
	 * 				{@linkcode EventTarget#addEventListener}</li>
	 * 	<li>{@code listener} whose value is equivalent to the {@code listener} argument of
	 * 				{@linkcode EventTarget#addEventListener}</li>
	 * </ul>
	 * @param {...Object} listeners data about the event listeners to attach
	 * @returns this {@linkcode Elmen}
	 */
	withListeners(...listeners) {
		let options;
		for (let config of listeners) {
			if (Elmen.verbosity > Elmen.VERBOSITY.NO_CHECKS) {
				if (!config.type) {
					throw "No type was given for the listener. Ensure that the “type” property is present.";
				}
				if (!config.listener) {
					throw "No listener was defined for the configuration. Ensure that the “listener” property is present and is a function."
				}
				if (typeof config.listener !== "function") {
					throw `The listener provided in the “listener” property is not a function; it is a ${typeof config.listener}.`
				}
			}
			options = Object.assign(Object.create(null), config);
			delete options.type;
			delete options.listener;
			this._element.addEventListener(config.type, config.listener, options);
		}
		return this;
	}

	/**
	 * This runs the provided functions, in order, on the element. Each function takes in only the element as an argument.
	 * @param {...function} functions functions to run on the element
	 * @returns this {@linkcode Elmen}
	 */
	withActions(...functions) {
		for (let func of functions) {
			if (typeof func != "function") {
				throw `The action provided is not a function; it is a ${typeof func}.`;
			}
			func.apply(globalThis, [this._element]);
		}
		return this;
	}
};

verbosityEnum: {
	let verbosities = {
		HIGH: 1,
		DEFAULT: 0,
		NO_CHECKS: -1
	}

	/**
	 * This is the static enumerator for the different levels of verbosity. Setting
	 * {@linkcode Elmen#verbosity} to `NO_CHECKS` causes some assertions to be skipped
	 * over while processing input arguments. This slightly speeds up execution while
	 * providing less helpful error messages.
	 */
	Object.defineProperty(Elmen, "VERBOSITY", {
		configurable: false,
		enumerable: true,
		value: Object.freeze(verbosities),
		writable: false
	});
}

/**
 * This is the current verbosity level of {@linkcode Elmen} as a whole. This does not
 * affect whether or not the code fails, just how useful and detailed the console and
 * error messages are.
 */
Object.defineProperty(Elmen, "verbosity", {
	configurable: false,
	enumerable: true,
	value: Elmen.VERBOSITY.DEFAULT,
	writable: true
});

[
	["withAttribute", "withAttributes"],
	["withClass", "withClasses"],
	["withStyles", "withCSS"],
	["withStyle", "withStyles"],
	["withChild", "withChildren"],
	["withListener", "withListeners"],
	["withAction", "withActions"]
].forEach(alias => {
	Elmen.prototype[alias[0]] = Elmen.prototype[alias[1]];
});

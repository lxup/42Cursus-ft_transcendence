export class Component extends HTMLElement {
	#rendered;
	constructor() {
		super();
		this.#rendered = false;
	}

	connectedCallback() {
		if (!this.#rendered) {
			this.render();
			this.#rendered = true;
		}
	}

	disconnectedCallback() {
		this.innerHTML = "";
		this.#rendered = false;
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}

	adopterCallback() {
		this.render();
	}

	/**
	 * @brief Content for the component
	 */
	content() {
		return "";
	}

	/**
	 * @brief Style for the component
	 */
	style() {
		return "<style></style>";
	}

	/**
	 * @brief Render the component
	 */
	render() {
		this.innerHTML = this.style() + this.content();
	}
}
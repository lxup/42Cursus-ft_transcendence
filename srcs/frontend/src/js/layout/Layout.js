import { Component } from "../Component.js";

export class Layout extends HTMLElement {
	constructor() {
		super();
	}

	content() {
		return (`
			<p>This is the layout</p>
		`);
	}

	style() {
		return (`
			<style>
				p {
					color: blue;
				}
			</style>
		`);
	}

	appendChild(child) {
		if (!(child instanceof HTMLElement)) {
			throw new TypeError("child must be an instance of HTMLElement");
		}

		this.appendChild(child);
	}
}

customElements.define("layout-element", Layout);
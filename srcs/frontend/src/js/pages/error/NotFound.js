import { Component } from "../../utils/Component.js";

export class NotFound extends Component {
	constructor() {
		super("main-layout");
	}
	content() {
		// this.classList.add("d-flex");
		// this.classList.add("h-100");
		// this.classList.add("justify-content-center");
		// this.classList.add("align-items-center");
		return (`
			<div class="d-flex flex-column justify-content-center align-items-center h-100">
				<h1>ERROR 404</h1>
			</div>
		`);
	}
	style() {
		return (`
			<style>
			</style>
		`);
	}
}

customElements.define("not-found-page", NotFound);
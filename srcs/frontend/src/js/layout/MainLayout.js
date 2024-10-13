import { Component } from "../utils/Component.js";

export class MainLayout extends Component {
	constructor() {
		super();
		this.classList.add("d-flex");
		this.classList.add("h-100");
	}
	content() {
		return (`
			<sidebar-component></sidebar-component>
			<div class="container-fluid p-0">
				<header-component></header-component>
				<main class="container-fluid p-2">
					${this.childrens()}
				</main>
			</div>
		`);
	}
}

customElements.define("main-layout", MainLayout);
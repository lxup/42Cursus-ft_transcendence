import { Component } from "../../utils/Component.js";

export class Header extends Component {
	content() {
		return (`
			<header class="w-100 bg-secondary-subtle d-flex justify-content-between align-items-center p-2">
				<header-left-side></header-left-side>
				<header-right-side></header-right-side>
			</header>
		`);
	}
}

customElements.define("header-component", Header);
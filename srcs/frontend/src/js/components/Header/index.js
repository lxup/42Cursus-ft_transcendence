import { Component } from "../../Component.js";

export class Header extends Component {
	content() {
		return (`
			<header>
				<h1>Header</h1>
				<p>This is the header</p>
			</header>
		`);
	}
	style() {
		return (`
			<style>
				header {
					background-color: #f0f0f0;
					padding: 10px;
					margin-bottom: 10px;
				}
			</style>
		`);
	}
}

customElements.define("header-component", Header);
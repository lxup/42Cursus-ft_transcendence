import { Component } from "../../Component.js";

export class Home extends Component {
	constructor() {
		super();
	}
	content() {
		return (`
			<h1>Home</h1>
			<p>This is the home page</p>
		`);
	}
	style() {
		return (`
			<style>
				h1 {
					color: red;
				}
			</style>
		`);
	}
}

customElements.define("home-page", Home);
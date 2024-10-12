import { Router, Route } from "./Router.js";

import "./pages/index.js";
import "./components/index.js";

export class App {
	#app;
	#router;
	constructor() {
		this.#app = document.getElementById("app");
		this.#router = new Router(this.#app, [
			new Route("/", "home-page"),
		]);
		window.router = this.#router;
		document.title = "Transcendence";
		this.#router.init();
		// this.#router.push("/home/1");
	}
}

const app = new App();
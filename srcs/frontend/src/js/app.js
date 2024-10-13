import { Router, Route } from "./utils/Router.js";

import "./pages/index.js";
import "./components/index.js";
import "./layout/index.js";

export class App {
	#app;
	#router;
	constructor() {
		this.#app = document.getElementById("app");
		this.#router = new Router(this.#app, [
			new Route("/", "home-page"),
			new Route("/search", "search-page"),
			new Route("", "not-found-page"),
		]);
		window.router = this.#router;
		document.title = "Transcendence";
		this.#router.init();
		// this.#router.push("/home/1");
	}
}

const app = new App();
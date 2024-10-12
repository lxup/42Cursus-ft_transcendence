/**
 * @file router.js
 * @brief Router for the frontend
 * @version 1.0
 * 
 * Router for the frontend
 */
export class Router {
	#app;
	/**
	 * @type {Route[]}
	 */
	#routes = [];
	/**
	 * @brief Constructor for the Router class
	 * @param {Object} app - The app object
	 * @param {Array} routes - The routes for the router
	 */
	constructor(app, routes = []) {
		if (Router.instance) { // Singleton
			return Router.instance;
		}
		Router.instance = this;

		this.#app = app;
		this.#routes = routes;

		window.addEventListener("popstate", this.#handlePopState.bind(this));
	}

	/* -------------------------------- Handlers -------------------------------- */

	#handlePopState(event) {
		console.log(`Pop state: ${window.location.pathname}`);
	}

	/* ---------------------------------- Utils --------------------------------- */

	/**
	 * @brief find matching route
	 * @param {String} path - The path for the route
	 * @returns {Route} - The matching route
	 */
	#findMatchingRoute(path) {
		return this.#routes.find((route) => route.pathRegex.test(path));
	}

	/**
	 * @brief Set the parameters for the component
	 * @param {HTMLElement} component - The component to set the parameters for
	 * @param {Route} route - The route to set the parameters for
	 */
	static #setParams(component, route) {
		console.log(`Setting params for ${JSON.stringify(route.params)}`);
	}


	/**
	 * @brief Load the route
	 * @param {Route} route - The route to load
	 */
	#loadRoute(route) {
		if (!route) {
			console.error("Route not defined");
			return;
		}
		if (!(route instanceof Route)) {
			throw new TypeError("Route must be an instance of Route");
		}
		console.log(`Loading route: ${route}`);
		const component = document.createElement(route.component);
		Router.#setParams(component, route);
		this.#app.innerHTML = "";
		this.#app.appendChild(component);
		return component;
	}

	/* -------------------------------- Methods -------------------------------- */

	init() {
		const path = window.location.pathname;
		const route = this.#findMatchingRoute(path);
		if (!route) {
			console.error("Route not found");
			return;
		}

		// Update history (don't forget to add the search params)
		window.history.replaceState({}, "", path + window.location.search);

		return this.#loadRoute(route);
	}

	/**
	 * @brief Navigate to a path
	 * @param {String} path - The path to navigate to
	 */
	push(path) {
		const pathRaw = path.split("?")[0];
		const route = this.#findMatchingRoute(pathRaw);
		if (!route) {
			console.error("Route not found");
			return;
		}

		// Update history
		if (window.location.pathname !== path) {
			window.history.pushState({}, "", path);
		}

		return this.#loadRoute(route);
	}

	/**
	 * @brief Add a route to the router
	 * @param {String} path - The path for the route
	 * @param {String} component - The component for the route
	 */
	addRoute(path, component) {
		if (typeof path !== "string") {
			throw new TypeError("Path must be a string");
		}
		if (typeof component !== "string") {
			throw new TypeError("Component must be a string");
		}

		this.#routes.push(new Route(path, component));
	}
}


export class Route {
	/**
	 * @brief Constructor for the Route class
	 * @param {String} path - The path for the route
	 * @param {String} component - The component for the route
	 */
	constructor(path, component) {
		// Check if path is a string
		if (typeof path !== "string") {
			throw new TypeError("Path must be a string");
		}
		// Check if component is a string
		if (typeof component !== "string") {
			throw new TypeError("Component must be a string");
		}

		this.path = path;
		this.component = component;
		this.params = [];
		this.pathRegex = null;

		this.#parseParams();
		this.#createPathRegex();
	}

	/**
	 * @brief Parse the parameters for the route
	 */
	#parseParams() {
		const match = this.path.match(/:\w+/g);
		if (match) {
			this.params = match.map((param) => param.slice(1));
		}
	}

	/**
	 * @brief Create a regex for the path
	 */
	#createPathRegex() {
		this.pathRegex = new RegExp(`^${this.path.replace(/:\w+/g, "(\\w+)")}$`);
	}
}

export function getRouter() {
	return Router.instance;
}
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
	 * @type {Function[]}
	 */
	#middleware = [];
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

	/* ------------------------------- Middleware ------------------------------- */

	/**
	 * @brief Use a middleware
	 * @param {Function} middleware - The middleware to use
	 */
	use(middleware) {
		if (typeof middleware !== "function") {
			throw new TypeError("Middleware must be a function");
		}
		this.#middleware.push(middleware);
	}

	/* -------------------------------- Handlers -------------------------------- */

	#handlePopState(event) {
		const route = this.#findMatchingRoute(document.location.pathname);
		if (!route) {
			console.error("Route not found");
			return;
		}
		this.#loadRoute(route);
	}

	/* ---------------------------------- Utils --------------------------------- */

	/**
	 * @brief find matching route
	 * @param {String} path - The path for the route
	 * @returns {Route} - The matching route
	 */
	#findMatchingRoute(path) {
		const route = this.#routes.find((route) => route.pathRegex.test(path));
		if (route) {
			Router.#setParamsValues(route, path);
		}
		// Return the route or the default route (empty path)
		return route || this.#routes.find((route) => route.path === "");
	}

	/**
	 * @brief Set the values for the parameters
	 * @param {Route} route - The route to set the values for
	 * @param {String} path - The path to set the values for
	 */
	static #setParamsValues(route, path) {
		if (!(route instanceof Route)) {
			throw new TypeError("Route must be an instance of Route");
		}
		if (typeof path !== "string") {
			throw new TypeError("Path must be a string");
		}

		const values = path.match(route.pathRegex);
		if (values) {
			values.shift();
			route.params.forEach((param, index) => {
				Router.#setParamValue(route, param.name, values[index]);
			});
		}
	}

	/**
	 * @brief Set the value for a given parameter
	 * @param {Route} route - The route to set the value for
	 * @param {String} id - The id to set the value for
	 * @param {String} value - The value to set
	 * 
	 */
	static #setParamValue(route, id, value) {
		if (!(route instanceof Route)) {
			throw new TypeError("Route must be an instance of Route");
		}
		if (typeof id !== "string") {
			throw new TypeError("Id must be a string");
		}
		if (typeof value !== "string") {
			throw new TypeError("Value must be a string");
		}

		const param = route.params.find((param) => param.name === id);
		if (param) {
			param.value = value;
		}
	}

	/**
	 * @brief Set the parameters for the component
	 * @param {HTMLElement} component - The component to set the parameters for
	 * @param {Route} route - The route to set the parameters for
	 */
	static #setParams(component, route) {
		console.log(`Setting params for ${JSON.stringify(route)}`);
		if (!(component instanceof HTMLElement)) {
			throw new TypeError("Component must be an instance of HTMLElement");
		}
		if (!(route instanceof Route)) {
			throw new TypeError("Route must be an instance of Route");
		}

		route.params.forEach((param) => {
			component.setAttribute(param.name, param.value);
		});
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
		/**
		 * @type {Object[]}
		 * @property {String} name - The name of the parameter
		 * @property {String} value - The value of the parameter
		 * @example
		 * [
		 * 	{
		 * 		name: "id",
		 * 		value: "1"
		 * 	}
		 * ]
		 */
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
			this.params = match.map((param) => {
				return {
					name: param.substring(1),
					value: null
				};
			});
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
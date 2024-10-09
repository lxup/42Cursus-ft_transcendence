document.addEventListener("click", (e) => {
	const { target } = e;
	if (!target.matches("nav a")) {
		return;
	}

	e.preventDefault();
	route();
});

const routes = {
	404: {
		page: "/pages/404.html",
		title: "",
		description: "",
	},
	"/": {
		page: "/pages/index.html",
		title: "",
		description: "",
	},
	"/login": {
		page: "/pages/login.html",
		title: "",
		description: "",
	},
	"/signup": {
		page: "/pages/signup.html",
		title: "",
		description: "",
	},
};

const route = (event) => {
	event = event || window.event;
	event.preventDefault();

	window.history.pushState({}, "", event.target.href);
	urlLocationHandler();
};

const urlLocationHandler = async () => {
	const location = window.location.pathname;
	if (location.length == 0) {
		location = "/";
	}

	const resolvedRoute = routes[location] || routes[404];
	const html = await fetch(resolvedRoute.page).then((res) => res.text());

	document.getElementById("content").innerHTML = html;
};

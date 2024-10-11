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

	if (location == "/signup") {
		handleFormSubmission();
	}
};

window.onpopstate = urlLocationHandler;
window.route = route;

urlLocationHandler();

const handleFormSubmission = () => {
	const signUpForm = document.getElementById("signup-form");

	signUpForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const username = document.getElementById("username").value;
		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;

		const data = {
			username,
			email,
			password,
		};

		console.log(data);

		try {
			const resp = await fetch("/api/auth/register/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await resp.json();
			if (resp.ok) {
				console.log("success signup: ", result);
				alert("Signup successful: ", result);
			} else {
				alert("Signup failed: ", result);
				console.log("fail signup: ", result);
			}
		} catch (error) {
			console.log("Network error:", error);
			alert("oops! network error occured, try again later..");
		}
	});
};

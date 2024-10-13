import { Component } from "../../utils/Component.js";

export class HeaderRightSide extends Component {
	content() {
		return (`
			<p>@loup</p>
		`);
	}
}

customElements.define("header-right-side", HeaderRightSide);
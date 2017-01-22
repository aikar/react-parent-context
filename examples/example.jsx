import ContextManager from "../react-parent-context";
import React from "react";
import ReactDOM from "react-dom";

const context = ContextManager.getGlobalContext();

class Game extends React.Component {
	constructor(props, ctx) {
		super(props, ctx);

		this.state = {
			players: ["Charlie", "Bob"]
		};
		context.provideContext(this);
		context.provideContext("Game-Other", this);
		context.setGlobalState("Foo", 42);
	}

	addPlayer(player) {
		const players = this.state.players.slice(0);
		players.push(player);
		this.setState({players: players});
	}

	removePlayer(player, idx) {
		idx = idx || this.state.players.indexOf(player);
		if (idx !== -1) {
			const players = this.state.players.slice(0);
			players.splice(idx, 1);
			this.setState({players: players});
		}
	}

	render() {
		return <div>
			<input id="input-box" />
			<button onClick={() => {
				this.addPlayer(document.getElementById("input-box").value)
			}}>Add Player</button>
			<PlayerList />
		</div>;
	}
}

class PlayerList extends React.Component {
	constructor(props, ctx) {
		super(props, ctx);
		this.contextRetriever = context.obtainRetriever();
	}

	render() {
		const game = this.contextRetriever.getContext(Game);
		const gameOther = this.contextRetriever.getContext("Game-Other");
		const globalState = context.getGlobalState("Foo");
		let errMsg = "";
		let errMsg2 = "";
		try {
			this.contextRetriever.getContext("Invalid");
		} catch (e) {
			errMsg = e.message;
		}
		try {
			this.contextRetriever.getContext(Game, 2);
		} catch (e) {
			errMsg2 = e.message;
		}
		return <div>
			<h2>Player List</h2>
			<ul>{
				game.state.players.map((player, i) => (
					<li key={i+player}>
						<button onClick={() => game.removePlayer(player, i)}>[X]</button>
						<span style={{marginLeft: 5}}>{player}</span>
					</li>
				))
			}</ul>
			Game Objects match: {game === gameOther ? "true" : "false"}<br />
			Should be 42: {globalState}<br />
			Got Expected Error Message: {errMsg === "Could not find context for Invalid" ? "true" : "false"}<br />
			Got Expected Error Message2: {errMsg2 === "Could not find context for Game" ? "true" : "false: " + errMsg2}<br />
		</div>
	}
}


ReactDOM.render(<Game />, document.getElementById("root"));


import ContextManager from "../src/ReactParentContext";
import React from "react";
import ReactDOM from "react-dom";

const context = ContextManager.getGlobalContext();

["componentWillMount", "componentDidMount", "componentWillUnmount", 'render'].forEach((key) => {
	React.Component.prototype[key] = function() {
		console.log((this.othername || this.constructor.name) + ": " + key);
	}
});
class Game extends React.Component {
	constructor(props, ctx) {
		super(props, ctx);

		this.state = {
			players: ["Charlie", "Bob"]
		};
		this.playerName = "Charlie";
		console.log("Game Providing Context");
		context.provideContext(this);
		//context.provideContext("Game-Other", this);
		//context.provideContext("Test1", this);
		//context.provideContext("Test2", this, "Some Other Value");
		context.setState("Foo", 42);
	}

	addPlayer(player) {
		const players = this.state.players.slice(0);
		players.push(player);
		this.setState({players: players});
	}

	removePlayer(player, idx) {
		idx = idx !== undefined  && idx < this.state.players.length ? idx : this.state.players.indexOf(player);
		if (idx !== -1) {
			const players = this.state.players.slice(0);
			players.splice(idx, 1);
			this.setState({players: players});
		}
	}

	render() {
		console.log("Game Render");
		return <div>
			{/*<input id="input-box" />

			<button onClick={() => {
				this.addPlayer(document.getElementById("input-box").value)
			}}>Add Player</button>

			<PlayerPanel currentPlayer={this.playerName} />*/}

			<Test val="1">
				<Test val="2">
					<Test val="3">
						<TestValidate depth="1" expected="3" />
						<TestValidate depth="2" expected="2" />
						<TestValidate depth="3" expected="1" />
						<TestValidate depth="4" expected="error" />
					</Test>
					<Test val="4">
						<TestValidate depth="1" expected="3" />
					</Test>
				</Test>
				<Test val="5">
					<Test val="6">
						<TestValidate depth="1" expected="6" />
						<TestValidate depth="2" expected="5" />
						<Test val="7">
							<TestValidate depth="1" expected="7" />
							<TestValidate depth="4" expected="1" />
						</Test>
					</Test>
					<Test val="8">
						<TestValidate depth="1" expected="8" />
						<TestValidate depth="2" expected="5" />
					</Test>
				</Test>
			</Test>
			<Test val="9">
				<TestValidate depth="1" expected="9" />
				<TestValidate depth="2" expected="error" />
			</Test>
		</div>;
	}
}
class TestValidate extends React.Component {
	constructor(props) {
		super(props);
		this.contextRetriever = context.obtainRetriever();
	}
	render() {
		super.render();
		let val;
		try {
			val = this.contextRetriever.getContext(Test, this.props.depth).props.val;
		} catch (e) {
			val = "error";
		}
		console.log("VALIDATE", this.props.depth, this.props.expected, val, (this.props.expected == val ? "" : " BAD"), this.contextRetriever.contexts);
		return <span style={{color: this.props.expected == val ? "green" : " red"}}>
			Test Depth {this.props.depth}: {val} == {this.props.expected}<br />
		</span>
	}
}
let testID = 1;
class Test extends React.Component {
	constructor(props) {
		super(props);
		this.id = testID++;
		this.othername = "test - " + this.id + " - " + props.val;
		//console.log("Test " + this.id + " CTOR ");
		context.provideContext(this);
	}

	render() {
		super.render();
		//console.log("Test " + this.id + " Render", this.props);
		return <div>
			{this.props.children}
		</div>;
	}
}

class PlayerPanel extends React.Component {
	render() {
		return <div>
			<h2>Hello, {this.props.currentPlayer}</h2>
			<PlayerList />
		</div>;
	}
}

class PlayerList extends React.Component {
	constructor(props, ctx) {
		super(props, ctx);

		this.contextRetriever = context.obtainRetriever();
		console.log("PlayerList Obtain Retriever", this.contextRetriever);
	}

	render() {
		console.log("PlayerList Render", this.contextRetriever);
		const game = this.contextRetriever.getContext(Game);
		const gameOther = this.contextRetriever.getContext("Game-Other");
		const globalState = context.getState("Foo");
		const test1 = this.contextRetriever.getContext("Test1");
		const test2 = this.contextRetriever.getContext("Test2");

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
			<h3>Run some tests</h3>
			Game Objects match: <b>{game === gameOther ? "true" : "false"}</b><br />
			Test1 == Game Object: <b>{test1 === game ? "true" : "false"}</b><br />
			Test2 == "Some Other Value": <b>{test2 === "Some Other Value" ? "true" : "false"}</b><br />
			State Key for "Foo" == 42: <b>{globalState === 42 ? "true" : "false"}</b><br />
			Got Expected Error Message: <b>{errMsg === "Could not find context for Invalid" ? "true" : "false"}</b><br />
			Got Expected Error Message2: <b>{errMsg2 === "Could not find context for Game" ? "true" : "false: " + errMsg2}</b><br />
		</div>
	}
}


ReactDOM.render(<Game />, document.getElementById("root"));


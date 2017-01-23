import React from "react";

const orig = React.createElement;

let currentContext;
React.createElement = function() {
	console.log("createElement", currentContext);
	return orig.apply(this, Array.prototype.slice.apply(arguments));
};
export class ContextManager {
	/**
	 * @param {ReactParentContext} context
	 * @param {React.Component} component
	 * @returns {ContextManager}
	 */
	static bindManager(context, component) {
		if (component[context._symbol] instanceof ContextManager) {
			return component[context._symbol];
		} else {
			const bind = new ContextManager(context, component);
			Object.defineProperty(component, context._symbol, {
				enumerable: false,
				configurable: false,
				writable: false,
				value: bind
			});
			return bind;
		}
	}

	contexts;
	unwinds = {};

	/**
	 * @param {ReactParentContext} context
	 * @param {React.Component} component
	 */
	constructor(context, component) {
		const contexts = this.contexts = context.contexts;
		const self = this;

		const renderOrig = component.render;
		component.render = function() {
			currentContext = component;
			return renderOrig.apply(this, Array.prototype.slice.call(arguments));
		};
		const prev = component.componentDidMount;
		component.componentDidMount = function() {


			self.unwinds = {};
			//if (typeof prev === 'function') {
				const ret = prev.apply(this, Array.prototype.slice.call(arguments));
				console.log(ret);
				return ret;
			//}
		}
	}

	unwind() {
		for (const id of Object.keys(self.unwinds)) {
			for (let i = 0; i < self.unwinds[id]; i++) {
				let pop = contexts[id].pop();
				console.log("pop", id, pop.othername);
			}
			if (contexts[id].length < 1) {
				delete contexts[id];
			}
		}
	}

	provide(id, context) {
		const contexts = this.contexts;
		if (!contexts[id]) {
			contexts[id] = [];
		}
		contexts[id].push(context);
		console.log("push", id, context.othername);
		if (!this.unwinds[id]) {
			this.unwinds[id] = 0;
		}
		this.unwinds[id]++;
	}
}
export default ContextManager;


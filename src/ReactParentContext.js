import ReactReconciler from "react-dom/lib/ReactReconciler";
import ContextRetriever from "./ContextRetriever";
const validate = require('./validate');
const cloneContext = require('./cloneContext');

/**
 * Provides children components in a React App to access their parent context.
 *
 * As an implementation detail, the children can only access the parents context if they were rendered in the same "tick"
 *
 * You should always retrieve a context retriever in the components constructor and store it, then use it in render.
 */
export default class ReactParentContext {
	static globalContext;

	/**
	 * Provides a global context manager.
	 * @returns {ReactParentContext}
	 */
	static getGlobalContext() {
		if (!ReactParentContext.globalContext) {
			ReactParentContext.globalContext = new ReactParentContext();
		}
		return ReactParentContext.globalContext;
	}

	/**
	 * The current context state
	 * @type {Object.<string, Array.<*>>}
	 */
	contexts = {};
	/**
	 * Map of Global States (K/V Map)
	 * @type {Object.<string, *>}
	 */
	globalStates = {};

	constructor() {
		const origRecon = ReactReconciler.mountComponent;
		const self = this;
		ReactReconciler.mountComponent = function() {
			const prevContexts = self.contexts;
			self.contexts = cloneContext(prevContexts);
			const ret = origRecon.apply(this, Array.prototype.slice.apply(arguments));
			self.contexts = prevContexts;
			return ret;
		};
	}

	/**
	 * Retrieves a single persistent state for this specific context manager
	 * @param id {string}
	 * @returns {*}
	 */
	getState(id) {
		validate.validateIdentifier(id);

		return this.globalStates[id];
	}

	/**
	 * Sets a single persistent state for this specific context manager
	 * @param id {String}
	 * @param state {Object=}
	 * @returns {*}
	 */
	setState(id, state) {
		validate.validateIdentifier(id);

		if (!state) {
			throw new Error("Please specify a state")
		}

		const previous = this.globalStates[id];
		this.globalStates[id] = state;
		return previous;
	}

	/**
	 * Obtains a context retriever for the current component tree. This should only be called in the components
	 * constructor and stored as a property on the object to be used later in render.
	 *
	 * @returns {ContextRetriever}
	 */
	obtainRetriever() {
		return new ContextRetriever(this.contexts);
	}

	/**
	 * Provides a context for children to access.
	 * @param id {string, React.Component} Identifier or the Context. If the Component is provided as id, the
	 *                                     Component's constructor name will be used instead.
	 * @param component {React.Component=} The React Component to expose
	 * @param context {*=} If exposing something different than the component itself, the context to expose
	 * @return {void}
	 */
	provideContext(id, component, context) {
		const validated = validate.validate(id, component);
		id = validated.id;
		component = validated.component;
		context = context || component || id;

		const contexts = this.contexts;
		if (!contexts[id]) {
			contexts[id] = [];
		}
		contexts[id].push(context);
	}
}

module.exports.ReactParentContext = ReactParentContext;

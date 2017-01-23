const assign = require('object-assign');
const process = require('process');

/**
 * Provides children components in a React App to access their parent context.
 *
 * As an implementation detail, the children can only access the parents context if they were rendered in the same "tick"
 *
 * You should always retrieve a context retriever in the components constructor and store it, then use it in render.
 */
export default class ReactParentContext {
	/**
	 * @type {Object.<string, Array.<*>>}
	 */
	contexts = {};
	scheduledUnwind = false;
	/**
	 * @type {Object.<string, *>}
	 */
	globalStates = {};

	static globalContext = new ReactParentContext();

	/**
	 * Provides a global context manager.
	 * @returns {ReactParentContext}
	 */
	static getGlobalContext() {
		return ReactParentContext.globalContext;
	}

	/**
	 * Retrieves a single persistent state for this specific context manager
	 * @param id {string}
	 * @returns {*}
	 */
	getState(id) {
		ReactParentContext._validateIdentifier(id);

		return this.globalStates[id];
	}

	/**
	 * Sets a single persistent state for this specific context manager
	 * @param id {String}
	 * @param state {Object=}
	 * @returns {*}
	 */
	setState(id, state) {
		ReactParentContext._validateIdentifier(id);

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
	 * @param id {string, Object} Identifier or the Context. If context is provided as id, the constructors name will be used instead.
	 * @param component {React.Component=} The React Component to expose
	 * @param context {*=} If exposing something different than the component itself, the context to expose
	 * @return {void}
	 */
	provideContext(id, component, context) {
		const validated = ReactParentContext._validate(id, component);
		id = validated.id;
		component = validated.component;
		context = context || component || id;


		if (!this.contexts[id]) {
			this.contexts[id] = [];
		}

		this.contexts[id].push(context);
		if (!this.scheduledUnwind) {
			this.scheduledUnwind = true;
			const self = this;
			process.nextTick(function() {
				self.scheduledUnwind = false;
				self.contexts = {};
			});
		}
	}

	/**
	 * Validates an incoming id and component, handling Function > Name for ID conversion
	 * Validates the properties are valid or throws Error.
	 *
	 * @private
	 * @param id
	 * @param component=
	 * @param dontValidateComponent=
	 * @returns {{id: string, component: *}}
	 */
	static _validate(id, component, dontValidateComponent) {
		if (!component && id && typeof id !== 'string') {
			if (dontValidateComponent && typeof id === 'function' && id.name) {
				id = id.name;
			} else {
				if (typeof id.constructor === 'function' && id.constructor.name) {
					component = id;
					id = id.constructor.name;
				}
			}
		}

		if (!dontValidateComponent && (!component || !component.isReactComponent)) {
			throw new Error("Please supply a React Component!");
		}

		ReactParentContext._validateIdentifier(id);
		return {id, component};
	}

	/**
	 * @param id
	 * @private
	 */
	static _validateIdentifier(id) {
		if (!id || typeof id !== 'string') {
			throw new Error("Invalid ID specified: " + id);
		}
	}

}
export class ContextRetriever {
	/**
	 * @type {Object.<string, Array>}
	 */
	contexts = {};
	constructor(contexts) {
		// Clone base keys
		this.contexts = assign({}, contexts);
		for (const key of Object.keys(this.contexts)) {
			this.contexts[key] = this.contexts[key] && this.contexts[key].slice(0);
		}
	}

	/**
	 * @param {String,Object} id Identifier to look up context. If Object is passed, the constructors name will be used instead.
	 * @param {Number=} depth Depth up the stack to look up if multiple parents provide the same context.
	 * @returns {*}
	 */
	getContext(id, depth=1) {
		depth = parseInt(depth > 0 ? depth : 1);
		const validated = ReactParentContext._validate(id, null, true);
		id = validated.id;

		const context = this.contexts[id];
		if (!context || context.length < depth) {
			throw new Error("Could not find context for " + id);
		}

		return context[context.length - depth];
	}
}
module.exports.ReactParentContext = ReactParentContext;

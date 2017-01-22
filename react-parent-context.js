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
	 *
	 * @param id {string,Object}
	 * @returns {*}
	 */
	getGlobalState(id) {
		const validated = ReactParentContext.validateContext(id, null, true);
		id = validated.id;
		return this.globalStates[id];
	}

	/**
	 *
	 * @param id {String,Object}
	 * @param context {Object=}
	 * @returns {*}
	 */
	setGlobalState(id, context) {
		const validated = ReactParentContext.validateContext(id, context);
		id = validated.id;
		context = validated.context;

		const previous = this.globalStates[id];
		this.globalStates[id] = context;
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
	 * @param context {object=} The context to provide to the respective identifier.
	 * @return {void}
	 */
	provideContext(id, context) {
		const validated = ReactParentContext.validateContext(id, context);
		id = validated.id;
		context = validated.context;

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
	 * Validates an incoming id and context, handling Function > Name for ID conversion
	 * Validates the properties are valid or throws Error.
	 *
	 * @param id
	 * @param context=
	 * @param dontValidateContext=
	 * @returns {{id: string, context: *}}
	 */
	static validateContext(id, context, dontValidateContext) {
		if (!context && id && typeof id !== 'string') {
			if (dontValidateContext && typeof id === 'function' && id.name) {
				id = id.name;
			} else {
				if (typeof id.constructor === 'function' && id.constructor.name) {
					context = id;
					id = id.constructor.name;
				}
			}
		}

		if (!context && !dontValidateContext) {
			throw new Error("Please supply a context");
		}

		ReactParentContext.validateIdentifier(id);
		return {id, context};
	}

	static validateIdentifier(id) {
		if (!id  || typeof id !== 'string') {
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
		const validated = ReactParentContext.validateContext(id, null, true);
		id = validated.id;

		const context = this.contexts[id];
		if (!context || context.length < depth) {
			throw new Error("Could not find context for " + id);
		}

		return context[context.length - depth];
	}
}
module.exports.ReactParentContext = ReactParentContext;

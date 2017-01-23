const validate = require('./validate');
const cloneContext = require('./cloneContext');

export default class ContextRetriever {
	/**
	 * @type {Object.<string, Array>}
	 */
	contexts = {};
	constructor(contexts) {
		// Clone base keys
		this.contexts = cloneContext(contexts);
	}

	/**
	 * @param {String,Object} id Identifier to look up context. If Object is passed, the constructors name will be used instead.
	 * @param {Number=} depth Depth up the stack to look up if multiple parents provide the same context.
	 * @returns {*}
	 */
	getContext(id, depth=1) {
		depth = parseInt(depth > 0 ? depth : 1);
		const validated = validate.validate(id, null, true);
		id = validated.id;

		const context = this.contexts[id];
		if (!context || context.length < depth) {
			throw new Error("Could not find context for " + id);
		}

		return context[context.length - depth];
	}
}

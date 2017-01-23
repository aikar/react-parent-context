
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
export function validate(id, component, dontValidateComponent) {
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

	if (!dontValidateComponent && (!component || !component.isReactComponent || !component.render)) {
		throw new Error("Please supply a React Component!");
	}

	validateIdentifier(id);
	return {id, component};
}

/**
 * @param id
 * @private
 */
export function validateIdentifier(id) {
	if (!id || typeof id !== 'string') {
		throw new Error("Invalid ID specified: " + id);
	}
}

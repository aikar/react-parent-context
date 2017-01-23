const assign = require('object-assign');

module.exports = function cloneContext(context) {
	context = assign({}, context);
	for (const key of Object.keys(context)) {
		context[key] = context[key] && context[key].slice(0);
	}
	return context;
};

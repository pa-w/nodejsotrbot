function Layer () {
}
var Base = require ("../base");
Layer.prototype = Object.create (Base.prototype);
Layer.prototype.constructor = Layer;

module.exports = Layer;

import DS from 'ember-data';
import config from './../config/environment';

export default DS.RESTAdapter.extend({
	host: config.APP.API_HOST,
	namespace: 'api'
});
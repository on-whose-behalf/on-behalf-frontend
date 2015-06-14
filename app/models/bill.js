// Bill
import DS from 'ember-data';

var attr 	= DS.attr;

var Bill = DS.Model.extend({
	official_title: attr('string')
});

export default Bill;

import Ember from 'ember';

export default Ember.Controller.extend({

	triggerSearch: function(){
		var query = this.get('model.query');
		this.set('address', query);
		if(query && this.checkIsZipcode(query)){
			this.search();
		}
	}.observes('model.query'),

	// Attributes
	legislators: [],
	address: null,

	zipcodeRegex: /(^\d{5}$)|(^\d{5}-\d{4}$)/,

	selectedRep: function(){
		return this.get('legislators').findBy('isSelected', true);
	}.property('legislators.@each.isSelected'),

	// Events
	actions: {
		actionSearch: function(){
			var address = this.get('address');
			if( address && this.checkIsZipcode(address) ){
			  this.transitionToRoute('search', address);
			}
		},
		actionClearSelection: function(){
			this.clearSelection();
		}
	},

	search: function(){
		var _this = this,
			address = this.get('model.query');

		this.set('isLoading', true);

		_this.clearSelection();
		var legislators = this.store.find('legislator', {
			address: address
		});

		this.set('legislators', legislators);

		legislators.then( function() {
			_this.set('isLoading', false);

			if (!legislators.get('length')) {
				_this.set('isZipcode', false);
				return;
			}

			legislators.set('firstObject.isSelected', true);
		});
	},

	clearSelection: function(){
		var prevSelection = this.get('legislators').findBy('isSelected', true);

		if ( prevSelection ) {
			prevSelection.set('isSelected', false);
		}
	},

	checkIsZipcode: function(value){
		return this.get('zipcodeRegex').test(value);
	}
});

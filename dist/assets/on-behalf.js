define("on-behalf/adapters/application", 
  ["ember-data","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var DS = __dependency1__["default"];

    __exports__["default"] = DS.RESTAdapter.extend({
      host: "http://localhost:3000",
      namespace: "api"
    });
  });
define("on-behalf/app", 
  ["ember","ember/resolver","ember/load-initializers","on-behalf/config/environment","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Resolver = __dependency2__["default"];
    var loadInitializers = __dependency3__["default"];
    var config = __dependency4__["default"];

    Ember.MODEL_FACTORY_INJECTIONS = true;

    var App = Ember.Application.extend({
      modulePrefix: config.modulePrefix,
      podModulePrefix: config.podModulePrefix,
      Resolver: Resolver
    });

    loadInitializers(App, config.modulePrefix);

    __exports__["default"] = App;
  });
define("on-behalf/components/base-modal", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Snagged from http://ember.guru/2014/master-your-modals-in-ember-js
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Component.extend({
      show: (function () {
        this.$(".modal").show();
      }).on("didInsertElement"),

      actions: {
        done: function () {
          this.sendAction("close");
        }
      }
    });
  });
define("on-behalf/components/legislator-list-item", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Component.extend({
      tagName: "li",
      classNameBindings: [":legislator", "legislator.isSelected:selected"],
      legislator: null,

      click: function () {
        this.sendAction();
        this.get("legislator").set("isSelected", true);
      }
    });
  });
define("on-behalf/components/search-bar", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Snagged from http://ember.guru/2014/master-your-modals-in-ember-js
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Component.extend({
      address: null,
      zipcodeRegex: /(^\d{5}$)|(^\d{5}-\d{4}$)/,

      isZipcode: (function () {
        var address = this.get("address");
        if (!address || !address.length) {
          return true;
        }
        return this.get("zipcodeRegex").test(address);
      }).property("address"),

      actions: {
        actionSearch: function () {
          var address = this.get("address");
          if (address && this.get("isZipcode")) {
            this.sendAction("action", address);
          }
        }
      }
    });
  });
define("on-behalf/controllers/index", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Controller.extend({

      // Attributes
      legislators: [],
      address: null,

      isZipcode: (function () {
        return this.get("zipcodeRegex").test(this.get("address"));
      }).property("address"),

      zipcodeRegex: /(^\d{5}$)|(^\d{5}-\d{4}$)/,

      // Events
      actions: {
        actionSearch: function () {
          var address = this.get("address");
          if (address && this.get("isZipcode")) {
            this.transitionToRoute("search", this.get("address"));
          }
        }
      }
    });
  });
define("on-behalf/controllers/search", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Controller.extend({

      triggerSearch: (function () {
        var query = this.get("model.query");
        this.set("address", query);
        if (query && this.get("isZipcode")) {
          this.search();
        }
      }).observes("model.query"),

      // Attributes
      legislators: [],
      address: null,

      isZipcode: (function () {
        return this.get("zipcodeRegex").test(this.get("address"));
      }).property("address"),

      zipcodeRegex: /(^\d{5}$)|(^\d{5}-\d{4}$)/,

      selectedRep: (function () {
        return this.get("legislators").findBy("isSelected", true);
      }).property("legislators.@each.isSelected"),

      // Events
      actions: {
        actionSearch: function () {
          var address = this.get("address");
          if (address && this.get("isZipcode")) {
            this.transitionToRoute("search", this.get("address"));
          }
        },
        actionClearSelection: function () {
          this.clearSelection();
        }
      },

      search: function () {
        var _this = this,
            address = this.get("model.query");

        if (!this.get("isZipcode")) return;
        this.set("isLoading", true);

        _this.clearSelection();
        var legislators = this.store.find("legislator", {
          address: address
        });

        this.set("legislators", legislators);

        legislators.then(function () {
          _this.set("isLoading", false);

          if (!legislators.get("length")) {
            _this.set("isZipcode", false);
            return;
          }

          legislators.set("firstObject.isSelected", true);
        });
      },

      clearSelection: function () {
        var prevSelection = this.get("legislators").findBy("isSelected", true);

        if (prevSelection) {
          prevSelection.set("isSelected", false);
        }
      },

      checkIsZipcode: function (value) {
        return this.get("zipcodeRegex").test(value);
      }
    });
  });
define("on-behalf/helpers/format-dollars", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Handlebars.makeBoundHelper(function (value) {
      value = Math.round(value).toString();

      var arr = value.split(""),
          index = arr.length - 3;

      for (; index > 0; index -= 3) {
        arr.splice(index, 0, ",");
      }

      return "$" + arr.join("");
    });
  });
define("on-behalf/initializers/export-application-global", 
  ["ember","on-behalf/config/environment","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var config = __dependency2__["default"];

    function initialize(container, application) {
      var classifiedName = Ember.String.classify(config.modulePrefix);

      if (config.exportApplicationGlobal) {
        window[classifiedName] = application;
      }
    };
    __exports__.initialize = initialize;

    __exports__["default"] = {
      name: "export-application-global",

      initialize: initialize
    };
  });
define("on-behalf/models/contributor", 
  ["ember-data","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Contributor
    var DS = __dependency1__["default"];

    var attr = DS.attr;

    var Contributor = DS.Model.extend({
      name: attr("string"),
      employee_amount: attr("number"),
      employee_count: attr("number"),
      total_amount: attr("number"),
      total_count: attr("number"),
      direct_amount: attr("number"),
      direct_count: attr("number")
    });

    __exports__["default"] = Contributor;
  });
define("on-behalf/models/industry", 
  ["ember-data","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Industry
    var DS = __dependency1__["default"];

    var attr = DS.attr;

    var Industry = DS.Model.extend({
      amount: attr("string"),
      name: attr("string"),
      count: attr("string"),

      displayName: (function () {
        return this.get("name").toLowerCase().capitalize();
      }).property("name")
    });

    __exports__["default"] = Industry;
  });
define("on-behalf/models/legislator", 
  ["ember-data","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Legislator
    var DS = __dependency1__["default"];

    var attr = DS.attr,
        hasMany = DS.hasMany;

    var Legislator = DS.Model.extend({
      birthday: attr("string"),
      first_name: attr("string"),
      last_name: attr("string"),
      state_name: attr("string"),
      state_rank: attr("string"),
      chamber: attr("string"),
      party: attr("string"),
      title: attr("string"),
      phone: attr("string"),
      contact_form: attr("string"),
      oc_email: attr("string"),
      website: attr("string"),
      youtube_id: attr("string"),
      twitter_id: attr("string"),
      term_start: attr("string"),
      term_end: attr("string"),
      office: attr("string"),

      contributors: hasMany("contributor"),
      industries: hasMany("industries"),

      fullName: (function () {
        return this.get("first_name") + " " + this.get("last_name");
      }).property("first_name", "last_name"),

      chamberTitle: (function () {
        return this.get("chamber") === "senate" ? "Senator" : "Representative";
      }).property("chamber"),

      fullTitle: (function () {
        var rank = this.get("state_rank"),
            chamberTitle = this.get("chamberTitle"),
            state = this.get("state_name").capitalize();

        rank = rank ? rank.capitalize() + " " : "";

        return rank + chamberTitle + " from " + state;
      }).property("chamber"),

      formattedChamber: (function () {
        return this.get("chamber").capitalize();
      }).property("chamber"),

      formattedParty: (function () {
        var partyChar = this.get("party");
        switch (partyChar) {
          case "R":
            return "Republican";
          case "D":
            return "Democrat";
          case "I":
            return "Independent";
          default:
            return "Other";
        };
      }).property("party"),

      termLength: (function () {
        var termStart = this.get("term_start"),
            dateArray = termStart.split("-"),
            string;

        string = getDateString(dateArray[1], dateArray[0]);

        return string;
      }).property("term_start"),

      termLeft: (function () {
        var termEnd = this.get("term_end"),
            dateArray = termEnd.split("-"),
            string;

        string = getDateString(dateArray[1], dateArray[0]);

        return string;
      }).property("term_end"),

      twitterLink: (function () {
        var twitterID = this.get("twitter_id"),
            fullLink;

        fullLink = "http://www.twitter.com/" + twitterID;

        return fullLink;
      }).property("twitter_id"),

      youtubeLink: (function () {
        var youtubeID = this.get("youtube_id"),
            fullLink;

        fullLink = "http://www.youtube.com/user/" + youtubeID;

        return fullLink;
      }).property("youtube_id"),

      emailLink: (function () {
        var email = this.get("oc_email"),
            fullLink;

        fullLink = "mailto:" + email;

        return fullLink;
      }).property("oc_email")
    });

    var getDateString = function (month, year) {
      var date = new Date(),
          yearOne = date.getFullYear(),
          monthOne = date.getMonth() + 1,
          monthTwo = month,
          yearTwo = year,
          years,
          months,
          string;

      years = Math.abs(yearOne - yearTwo);
      months = monthOne - monthTwo;

      if (months < 0) {
        years--;
        months += 12;

        string = years + " years ";
        string += months + " months";
      } else if (months > 0) {
        string = years + " years ";
        string += months + " months";
      } else {
        string = years + " years ";
      }

      return string;
    };

    __exports__["default"] = Legislator;
  });
define("on-behalf/models/location", 
  ["ember-data","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Location
    var DS = __dependency1__["default"];

    var attr = DS.attr;

    var Location = DS.Model.extend({
      address: attr("string"),
      latitude: attr("string"),
      longitude: attr("string")
    });

    __exports__["default"] = Location;
  });
define("on-behalf/router", 
  ["ember","on-behalf/config/environment","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";

    var Ember = __dependency1__["default"];
    var config = __dependency2__["default"];

    var Router = Ember.Router.extend({
      location: config.locationType
    });

    Router.map(function () {
      this.route("index", { path: "/" });
      this.route("search", { path: "/search/:query" });
    });

    Router.map(function () {
      this.resource("legislator", { path: "/legislator/:legislator_id" });
    });

    __exports__["default"] = Router;
  });
define("on-behalf/routes/about", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Route.extend({});
  });
define("on-behalf/routes/application", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Route.extend({
      actions: {
        showModal: function (name, content) {
          this.controllerFor(name).set("content", content);
          this.render(name, {
            into: "application",
            outlet: "modal"
          });
        },
        removeModal: function () {
          this.disconnectOutlet({
            outlet: "modal",
            parentView: "application"
          });
        }
      }
    });
  });
define("on-behalf/routes/index", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Route.extend({
      model: function (params) {
        return {
          query: params.query
        };
      }
    });
  });
define("on-behalf/routes/legislator", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Route.extend({});
  });
define("on-behalf/routes/search", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Route.extend({
      model: function (params) {
        return {
          query: params.query
        };
      }
    });
  });
define("on-behalf/serializers/legislator", 
  ["ember-data","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var DS = __dependency1__["default"];

    __exports__["default"] = DS.RESTSerializer.extend({
      primaryKey: "bioguide_id"
    });
  });
define("on-behalf/templates/about", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = '', stack1, helper, options;
      data.buffer.push("\n              <li>\n                <strong>");
      stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</strong><em>");
      data.buffer.push(escapeExpression((helper = helpers['format-dollars'] || (depth0 && depth0['format-dollars']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "total_amount", options) : helperMissing.call(depth0, "format-dollars", "total_amount", options))));
      data.buffer.push("</em>\n              </li>\n            ");
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = '', stack1, helper, options;
      data.buffer.push("\n              <li>\n                <strong>");
      stack1 = helpers._triageMustache.call(depth0, "displayName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</strong><em>");
      data.buffer.push(escapeExpression((helper = helpers['format-dollars'] || (depth0 && depth0['format-dollars']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "amount", options) : helperMissing.call(depth0, "format-dollars", "amount", options))));
      data.buffer.push("</em>\n              </li>\n            ");
      return buffer;
      }

      data.buffer.push("<section class=\"main-content\">\n  <div class=\"row\">\n    <h1>Who else do they represent?</h1>\n    <div class=\"colum\">\n      <div class=\"about\">\n        <h2>");
      stack1 = helpers._triageMustache.call(depth0, "selectedRep.fullName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</h2>\n        <p>\n          <h4>");
      stack1 = helpers._triageMustache.call(depth0, "selectedRep.fullTitle", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push(" (");
      stack1 = helpers._triageMustache.call(depth0, "selectedRep.party", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push(")</h4>\n        </p>\n        <div class=\"colum\">\n          <h5>Top Contributors</h5>\n          <ul>\n            ");
      stack1 = helpers.each.call(depth0, "selectedRep.contributors", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n          </ul>\n        </div\n        ><div class=\"colum\">\n          <h5>Top Contributing Industries</h5>\n          <ul>\n            ");
      stack1 = helpers.each.call(depth0, "selectedRep.industries", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n          </ul>\n        </div>\n      </div>\n    </div>\n  </div>\n</section>");
      return buffer;
      
    });
  });
define("on-behalf/templates/application", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      
      data.buffer.push("On Behalf ");
      }

      data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "modal", options) : helperMissing.call(depth0, "outlet", "modal", options))));
      data.buffer.push("\n\n<header>\n  <nav>\n    <h2 id='title'> ");
      stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "index", options) : helperMissing.call(depth0, "link-to", "index", options));
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</h2>\n  </nav>\n</header>\n\n");
      stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      return buffer;
      
    });
  });
define("on-behalf/templates/components/base-modal", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1;


      data.buffer.push("<div class=\"modal background\">\n  <div class=\"contents\">\n    ");
      stack1 = helpers._triageMustache.call(depth0, "yield", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n  </div>\n</div>");
      return buffer;
      
    });
  });
define("on-behalf/templates/components/legislator-list-item", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1;


      data.buffer.push("<h2>");
      stack1 = helpers._triageMustache.call(depth0, "legislator.fullName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</h2>\n<h4>");
      stack1 = helpers._triageMustache.call(depth0, "legislator.formattedChamber", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</h4>");
      return buffer;
      
    });
  });
define("on-behalf/templates/components/search-bar", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

    function program1(depth0,data) {
      
      
      data.buffer.push("\n      <h5>Are you sure you typed that right?  Thats not a zipcode.</h5>\n    ");
      }

      data.buffer.push("<section>\n  <div ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'class': (":search isZipcode::invalid isSmall:small")
      },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">\n    <h1>Who represents me?</h1>\n    ");
      data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
        'action': ("actionSearch"),
        'placeholder': ("Enter your zipcode"),
        'value': ("address")
      },hashTypes:{'action': "STRING",'placeholder': "STRING",'value': "ID"},hashContexts:{'action': depth0,'placeholder': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
      data.buffer.push("\n    <i class=\"fa fa-search search-btn\" title=\"Search\" ");
      data.buffer.push(escapeExpression(helpers.action.call(depth0, "actionSearch", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
      data.buffer.push("></i>\n    ");
      stack1 = helpers.unless.call(depth0, "isZipcode", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n  </div>\n</section>");
      return buffer;
      
    });
  });
define("on-behalf/templates/components/typeahead-component", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

    function program1(depth0,data) {
      
      var buffer = '', stack1;
      data.buffer.push("\n	<ul class=\"typeahead-results\">\n		");
      stack1 = helpers.each.call(depth0, "displayOptions", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n	</ul>\n");
      return buffer;
      }
    function program2(depth0,data) {
      
      var buffer = '', stack1;
      data.buffer.push("\n			");
      stack1 = helpers.view.call(depth0, "typeahead-option", {hash:{
        'value': ("value")
      },hashTypes:{'value': "ID"},hashContexts:{'value': depth0},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["STRING"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n		");
      return buffer;
      }
    function program3(depth0,data) {
      
      var buffer = '', stack1;
      data.buffer.push("<span>");
      stack1 = helpers._triageMustache.call(depth0, "displayName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</span>");
      return buffer;
      }

      data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
        'type': ("text"),
        'placeholder': ("Enter Address or Zipcode"),
        'valueBinding': ("value")
      },hashTypes:{'type': "STRING",'placeholder': "STRING",'valueBinding': "STRING"},hashContexts:{'type': depth0,'placeholder': depth0,'valueBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
      data.buffer.push("\n");
      stack1 = helpers['if'].call(depth0, "options.content.isLoaded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      return buffer;
      
    });
  });
define("on-behalf/templates/index", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      
      data.buffer.push("\n  <section class=\"main-content\">\n    <div class=\"row\"><h2>loading...</h2></div>\n  </section>\n");
      }

    function program3(depth0,data) {
      
      
      data.buffer.push("\n  <section class=\"main-content intro\">\n    <div class=\"about row\">\n      <div class=\"colum\">\n        <h1>We believe the government should represent its citizens.</h1>\n      </div>\n      <div class=\"colum\">\n        <p><strong>It is common knowledge</strong> that, often, our national lawmakers do not serve the American people, but rather, various corporate interests.</p>\n        <p>The goal of OnBehalf is to shine a light on corporations' influence on your representatives so that you can better interpret their actions. Eventually, we'd like to draw a direct correlation between a lawmaker's contributors and their voting habits.</p>\n      </div>\n    </div>\n  </section>\n");
      }

      data.buffer.push(escapeExpression((helper = helpers['search-bar'] || (depth0 && depth0['search-bar']),options={hash:{
        'address': ("address"),
        'action': ("actionSearch")
      },hashTypes:{'address': "ID",'action': "STRING"},hashContexts:{'address': depth0,'action': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "search-bar", options))));
      data.buffer.push("\n");
      stack1 = helpers['if'].call(depth0, "isLoading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      
    });
  });
define("on-behalf/templates/legislator", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = '', stack1, helper, options;
      data.buffer.push("\n            <li><strong>");
      stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</strong><em>");
      data.buffer.push(escapeExpression((helper = helpers['format-dollars'] || (depth0 && depth0['format-dollars']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "total_amount", options) : helperMissing.call(depth0, "format-dollars", "total_amount", options))));
      data.buffer.push("</em></li>\n          ");
      return buffer;
      }

      data.buffer.push("<section class=\"page legislator-page\">\n  <div class=\"row\">\n    <h1 class=\"title\">\n      ");
      stack1 = helpers._triageMustache.call(depth0, "model.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push(". ");
      stack1 = helpers._triageMustache.call(depth0, "model.first_name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push(" ");
      stack1 = helpers._triageMustache.call(depth0, "model.last_name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("  \n    </h1>\n     <h2 class=\"office\">\n      ");
      stack1 = helpers._triageMustache.call(depth0, "model.chamberTitle", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push(", ");
      stack1 = helpers._triageMustache.call(depth0, "model.state_name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push(" (");
      stack1 = helpers._triageMustache.call(depth0, "model.party", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push(")\n    </h2>\n  </div>\n  <section class=\"main-content\">\n    <div class=\"row\">\n      <div class=\"colum\">\n        <h5>Top Contributors</h5>\n        <ul>\n          ");
      stack1 = helpers.each.call(depth0, "model.contributors", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n        </ul>\n      </div>\n      <div class=\"colum\">\n        <h5>Detailed Info</h5>\n        <ul class=\"detailed-info\">\n          <li><strong>Time in Office:</strong><em>");
      stack1 = helpers._triageMustache.call(depth0, "model.termLength", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</em></li>\n          <li><strong>Time Left:</strong><em>");
      stack1 = helpers._triageMustache.call(depth0, "model.termLeft", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</em></li>\n          <li><strong>Website:</strong><em><a ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'href': ("model.website")
      },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">");
      stack1 = helpers._triageMustache.call(depth0, "model.website", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</a></em></li>\n          <li><strong>Twitter:</strong><em><a ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'href': ("model.twitterLink")
      },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">");
      stack1 = helpers._triageMustache.call(depth0, "model.twitter_id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</a></em></li>\n          <li><strong>Youtube</strong><em><a ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'href': ("model.youtubeLink")
      },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">");
      stack1 = helpers._triageMustache.call(depth0, "model.youtube_id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</a></em></li>\n        </ul>\n        <h5>Contact</h5>\n        <ul>\n          <li><strong>Phone #:</strong><em>");
      stack1 = helpers._triageMustache.call(depth0, "model.phone", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</em></li>\n          <li><strong>Email:</strong><em><a ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'href': ("model.emailLink")
      },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">");
      stack1 = helpers._triageMustache.call(depth0, "model.oc_email", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</a></em></li>\n          <li><strong>Contact Form:</strong><em><a ");
      data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
        'href': ("model.contact_form")
      },hashTypes:{'href': "STRING"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
      data.buffer.push(">View Form</a></em></li>\n        </ul>\n      </div>\n    </div>\n  </section>\n</section>");
      return buffer;
      
    });
  });
define("on-behalf/templates/search", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      
      data.buffer.push("\n  <section class=\"main-content\">\n    <div class=\"row\"><h2>loading...</h2></div>\n  </section>\n");
      }

    function program3(depth0,data) {
      
      var buffer = '', stack1;
      data.buffer.push("\n  ");
      stack1 = helpers['if'].call(depth0, "legislators", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;
      }
    function program4(depth0,data) {
      
      var buffer = '', stack1, helper, options;
      data.buffer.push("\n    <section class=\"main-content\">\n      <div class=\"row\">\n        <h1>Who else do they represent?</h1>\n        <div class=\"colum\">\n          <ul class=\"legislator-list\">\n            ");
      stack1 = helpers.each.call(depth0, "legislator", "in", "legislators", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n          </ul\n          ><div class=\"legislator-detail\">\n            <h2>");
      stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "legislator", "selectedRep", options) : helperMissing.call(depth0, "link-to", "legislator", "selectedRep", options));
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</h2>\n            <p><h4>");
      stack1 = helpers._triageMustache.call(depth0, "selectedRep.fullTitle", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push(" (");
      stack1 = helpers._triageMustache.call(depth0, "selectedRep.party", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push(")</h4></p>\n            <div class=\"colum\">\n              <h5>Top Contributors</h5>\n              <ul>\n                ");
      stack1 = helpers.each.call(depth0, "selectedRep.contributors", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n              </ul>\n            </div\n            ><div class=\"colum\">\n              <h5>Top Contributing Industries</h5>\n              <ul>\n                ");
      stack1 = helpers.each.call(depth0, "selectedRep.industries", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n              </ul>\n            </div>\n          </div>\n        </div>\n      </div>\n    </section>\n  ");
      return buffer;
      }
    function program5(depth0,data) {
      
      var buffer = '', helper, options;
      data.buffer.push("\n              ");
      data.buffer.push(escapeExpression((helper = helpers['legislator-list-item'] || (depth0 && depth0['legislator-list-item']),options={hash:{
        'action': ("actionClearSelection"),
        'legislator': ("legislator")
      },hashTypes:{'action': "STRING",'legislator': "ID"},hashContexts:{'action': depth0,'legislator': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "legislator-list-item", options))));
      data.buffer.push("\n            ");
      return buffer;
      }

    function program7(depth0,data) {
      
      var stack1;
      stack1 = helpers._triageMustache.call(depth0, "selectedRep.fullName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      else { data.buffer.push(''); }
      }

    function program9(depth0,data) {
      
      var buffer = '', stack1, helper, options;
      data.buffer.push("\n                  <li>\n                    <strong>");
      stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</strong><em>");
      data.buffer.push(escapeExpression((helper = helpers['format-dollars'] || (depth0 && depth0['format-dollars']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "total_amount", options) : helperMissing.call(depth0, "format-dollars", "total_amount", options))));
      data.buffer.push("</em>\n                  </li>\n                ");
      return buffer;
      }

    function program11(depth0,data) {
      
      var buffer = '', stack1, helper, options;
      data.buffer.push("\n                  <li>\n                    <strong>");
      stack1 = helpers._triageMustache.call(depth0, "displayName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("</strong><em>");
      data.buffer.push(escapeExpression((helper = helpers['format-dollars'] || (depth0 && depth0['format-dollars']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "amount", options) : helperMissing.call(depth0, "format-dollars", "amount", options))));
      data.buffer.push("</em>\n                  </li>\n                ");
      return buffer;
      }

      data.buffer.push(escapeExpression((helper = helpers['search-bar'] || (depth0 && depth0['search-bar']),options={hash:{
        'address': ("address"),
        'action': ("actionSearch"),
        'isSmall': (true)
      },hashTypes:{'address': "ID",'action': "STRING",'isSmall': "BOOLEAN"},hashContexts:{'address': depth0,'action': depth0,'isSmall': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "search-bar", options))));
      data.buffer.push("\n");
      stack1 = helpers['if'].call(depth0, "isLoading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n\n");
      return buffer;
      
    });
  });
define("on-behalf/tests/adapters/application.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - adapters');
    test('adapters/application.js should pass jshint', function() { 
      ok(true, 'adapters/application.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/app.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - .');
    test('app.js should pass jshint', function() { 
      ok(true, 'app.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/components/base-modal.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - components');
    test('components/base-modal.js should pass jshint', function() { 
      ok(true, 'components/base-modal.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/components/legislator-list-item.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - components');
    test('components/legislator-list-item.js should pass jshint', function() { 
      ok(true, 'components/legislator-list-item.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/components/search-bar.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - components');
    test('components/search-bar.js should pass jshint', function() { 
      ok(true, 'components/search-bar.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/controllers/index.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - controllers');
    test('controllers/index.js should pass jshint', function() { 
      ok(false, 'controllers/index.js should pass jshint.\ncontrollers/index.js: line 18, col 46, Missing semicolon.\n\n1 error'); 
    });
  });
define("on-behalf/tests/controllers/search.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - controllers');
    test('controllers/search.js should pass jshint', function() { 
      ok(false, 'controllers/search.js should pass jshint.\ncontrollers/search.js: line 30, col 46, Missing semicolon.\ncontrollers/search.js: line 44, col 39, Expected \'{\' and instead saw \'return\'.\n\n2 errors'); 
    });
  });
define("on-behalf/tests/helpers/format-dollars.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - helpers');
    test('helpers/format-dollars.js should pass jshint', function() { 
      ok(true, 'helpers/format-dollars.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/helpers/resolver", 
  ["ember/resolver","on-behalf/config/environment","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Resolver = __dependency1__["default"];
    var config = __dependency2__["default"];

    var resolver = Resolver.create();

    resolver.namespace = {
      modulePrefix: config.modulePrefix,
      podModulePrefix: config.podModulePrefix
    };

    __exports__["default"] = resolver;
  });
define("on-behalf/tests/helpers/start-app", 
  ["ember","on-behalf/app","on-behalf/router","on-behalf/config/environment","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Application = __dependency2__["default"];
    var Router = __dependency3__["default"];
    var config = __dependency4__["default"];

    __exports__["default"] = function startApp(attrs) {
      var application;

      var attributes = Ember.merge({}, config.APP);
      attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

      Ember.run(function () {
        application = Application.create(attributes);
        application.setupForTesting();
        application.injectTestHelpers();
      });

      return application;
    }
  });
define("on-behalf/tests/models/contributor.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - models');
    test('models/contributor.js should pass jshint', function() { 
      ok(true, 'models/contributor.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/models/industry.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - models');
    test('models/industry.js should pass jshint', function() { 
      ok(true, 'models/industry.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/models/legislator.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - models');
    test('models/legislator.js should pass jshint', function() { 
      ok(false, 'models/legislator.js should pass jshint.\nmodels/legislator.js: line 62, col 6, Unnecessary semicolon.\nmodels/legislator.js: line 98, col 56, Missing semicolon.\nmodels/legislator.js: line 107, col 31, Missing semicolon.\n\n3 errors'); 
    });
  });
define("on-behalf/tests/models/location.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - models');
    test('models/location.js should pass jshint', function() { 
      ok(true, 'models/location.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/on-behalf/tests/helpers/resolver.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - on-behalf/tests/helpers');
    test('on-behalf/tests/helpers/resolver.js should pass jshint', function() { 
      ok(true, 'on-behalf/tests/helpers/resolver.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/on-behalf/tests/helpers/start-app.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - on-behalf/tests/helpers');
    test('on-behalf/tests/helpers/start-app.js should pass jshint', function() { 
      ok(true, 'on-behalf/tests/helpers/start-app.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/on-behalf/tests/test-helper.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - on-behalf/tests');
    test('on-behalf/tests/test-helper.js should pass jshint', function() { 
      ok(true, 'on-behalf/tests/test-helper.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/on-behalf/tests/unit/controllers/index-test.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - on-behalf/tests/unit/controllers');
    test('on-behalf/tests/unit/controllers/index-test.js should pass jshint', function() { 
      ok(true, 'on-behalf/tests/unit/controllers/index-test.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/on-behalf/tests/unit/routes/index-test.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - on-behalf/tests/unit/routes');
    test('on-behalf/tests/unit/routes/index-test.js should pass jshint', function() { 
      ok(true, 'on-behalf/tests/unit/routes/index-test.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/router.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - .');
    test('router.js should pass jshint', function() { 
      ok(true, 'router.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/routes/about.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - routes');
    test('routes/about.js should pass jshint', function() { 
      ok(true, 'routes/about.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/routes/application.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - routes');
    test('routes/application.js should pass jshint', function() { 
      ok(true, 'routes/application.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/routes/index.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - routes');
    test('routes/index.js should pass jshint', function() { 
      ok(true, 'routes/index.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/routes/legislator.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - routes');
    test('routes/legislator.js should pass jshint', function() { 
      ok(true, 'routes/legislator.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/routes/search.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - routes');
    test('routes/search.js should pass jshint', function() { 
      ok(true, 'routes/search.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/serializers/legislator.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - serializers');
    test('serializers/legislator.js should pass jshint', function() { 
      ok(true, 'serializers/legislator.js should pass jshint.'); 
    });
  });
define("on-behalf/tests/test-helper", 
  ["on-behalf/tests/helpers/resolver","ember-qunit"],
  function(__dependency1__, __dependency2__) {
    "use strict";
    var resolver = __dependency1__["default"];
    var setResolver = __dependency2__.setResolver;

    setResolver(resolver);

    document.write("<div id=\"ember-testing-container\"><div id=\"ember-testing\"></div></div>");

    QUnit.config.urlConfig.push({ id: "nocontainer", label: "Hide container" });
    var containerVisibility = QUnit.urlParams.nocontainer ? "hidden" : "visible";
    document.getElementById("ember-testing-container").style.visibility = containerVisibility;
  });
define("on-behalf/tests/unit/controllers/index-test", 
  ["ember","ember-qunit","on-behalf/tests/helpers/start-app"],
  function(__dependency1__, __dependency2__, __dependency3__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var test = __dependency2__.test;
    var moduleFor = __dependency2__.moduleFor;
    var startApp = __dependency3__["default"];

    var App;

    moduleFor("controller:index", "Unit - IndexController", {
      setup: function () {
        App = startApp();
      },
      teardown: function () {
        Ember.run(App, App.destroy);
      }
    });

    test("it has a controller", function () {
      var controller = this.subject();

      ok(controller, "The controller does not exist.");
    });

    test("it asks store for results", function () {
      expect(1);
      var controller = this.subject();

      controller.store = App.__container__.lookup("store:main");

      controller.set("addressValue", 60645);
      controller.send("actionSearch");

      andThen(function () {
        ok(controller.get("results.isFulfilled") === false, "The results havent been requested.");
      });
    });
  });
define("on-behalf/tests/unit/routes/index-test", 
  ["ember-qunit","on-behalf/tests/helpers/start-app"],
  function(__dependency1__, __dependency2__) {
    "use strict";
    var test = __dependency1__.test;
    var moduleFor = __dependency1__.moduleFor;
    var startApp = __dependency2__["default"];

    var App;

    moduleFor("route:index", "Unit - IndexRoute", {
      setup: function () {},
      teardown: function () {}
    });

    test("it has a model", function () {
      var route = this.subject(),
          model = JSON.stringify(route.model());

      ok(model === "{}", "The model should be empty.");
    });
  });
define("on-behalf/tests/views/typeahead-option.jshint", 
  [],
  function() {
    "use strict";
    module('JSHint - views');
    test('views/typeahead-option.js should pass jshint', function() { 
      ok(false, 'views/typeahead-option.js should pass jshint.\nviews/typeahead-option.js: line 12, col 39, \'$\' is not defined.\n\n1 error'); 
    });
  });
define("on-behalf/views/typeahead-option", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.View.extend({

      // Attributes
      tagName: "li",
      classNames: ["typeahead-result"],
      attributeBindings: "value:value",

      // Events
      click: function (e) {
        this.get("parentView").select($(e.currentTarget).attr("value"));
      }
    });
  });
/* jshint ignore:start */

define('on-behalf/config/environment', ['ember'], function(Ember) {
  var prefix = 'on-behalf';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("on-behalf/tests/test-helper");
} else {
  require("on-behalf/app")["default"].create({});
}

/* jshint ignore:end */
//# sourceMappingURL=on-behalf.map
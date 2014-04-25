define(['backbone', 'jquery', 'underscore', 'when-ready-for-group', 'aspic'], function (Backbone, $, _, whenListReady) {

    var AsyncDataModel = Backbone.AspicModel.extend({

        initialize: function () {
            var _this = this;
            
            if (!this.promiseInitData) {
                throw 'AsyncDataModel -> initialize. In descendant not specify @promiseInitData field';
            }

            this.set('onInit', $.Deferred());
            
            this.promiseInitData().done(function () {
                _this._handlingData.apply(_this, arguments);
            });
        },

        // -------------------------------------------------

        _handlingData: function () {
            this.onInit().resolve(this);
        },

        // -------------------------------------------------

        whenReady: function (handler) {
            this.onInit().done(handler);
        },

        // -------------------------------------------------

        isReady: function () {
            return this.onInit().state() == 'resolved';
        },

        // -------------------------------------------------

        getWhenReadyDeferred: function () {
            return this.onInit();
        }
        
    });


    var AsyncDataCollection = Backbone.Collection.extend({
        
        _prop: {
            onInit: $.Deferred()
        },

        // -------------------------------------------------

        initialize: function (itemsData, promiseInitData) {
            var _this = this;
            
            if (!promiseInitData) {
                throw 'AsyncDataCollection -> initialize. In descendant not specify @promiseInitData field';
            }

            promiseInitData.done(function () {
                _this._handlingData.apply(_this, arguments);
            });
        },
        
        // -------------------------------------------------

        _handlingData: function (data) {
            var initingData = _.map(data, function(item) {
                return {
                    promiseInitData: $.Deferred().resolve(item)
                };
            });
            this.add(initingData);
            this._prop.onInit.resolve(this);
        },
        
        // -------------------------------------------------

        whenReady: function (handler) {
            this._prop.onInit.done(handler);
        }
        
    });
    
    // --------------

    return {
        AsyncDataModel: AsyncDataModel,
        AsyncDataCollection: AsyncDataCollection
    };
});
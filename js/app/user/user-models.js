define(['backbone', 'underscore', 'jquery', 'user-tasks', 'async-data-models', 'aspic'], function (Backbone, _, $, tasks, Models) {

    var User = Models.AsyncDataModel.extend({

        initialize: function () {
            this.set({
                expire: -1,
                mid:  -1,
                secret:  -1,
                sid:  -1,
                sig:  -1,
                isAuth: -1,
                changeStatusHandler: $.Callbacks()
            });

            Models.AsyncDataModel.prototype.initialize.apply(this, arguments);
        },

        // -------------------------------------------------

        _handlingData: function (data) {
            this._applyNewData(data);

            Models.AsyncDataModel.prototype._handlingData.apply(this, arguments);
        },

        // -------------------------------------------------

        changeStatus: function (data) {
            this._applyNewData(data);

            this.changeStatusHandler().fire(this, data);
        },

        // -------------------------------------------------

        onChangeStatus: function (handler) {
            this.changeStatusHandler().add(handler);
        },

        // -------------------------------------------------

        _applyNewData: function (data) {
            if(data.session){
                data = data.session;

                this.set(data);
                this.isAuth(true);
            } else{
                this.isAuth(false);
            }
        }
    });


    // --------------

    return {
        User: User
    };
});
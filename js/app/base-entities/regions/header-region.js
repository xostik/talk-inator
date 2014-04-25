define(['abstract-region', 'underscore', 'user', requirePaths['header-region.tpl'], 'router'], function(Region, _, user, tpl, router){
    var HeaderRegion = Region.extend({
        tagName: 'header',

        id: 'header',

        template: _.template(tpl),

        events:{
            'click #vk_auth button': 'auth'
        },

        initialize: function(){
            var _this = this;
            this.prop = {};
            this.prop.user = user.getCurrentUser();

            this.prop.user.onChangeStatus(function(u, data){
                if(u.isAuth()){
                    _this.showGreeting(data.first_name);
                    _this.hideAuth();
                }else{
                    _this.showAuth();
                }
            });

            this.prop.user.whenReady(function(u){
                if(u.isAuth()){
                    _this.hideAuth();
                }else{
                    _this.showAuth();
                }

                /*VK.Widgets.Auth('vk_auth', {width: '200px', onAuth: function(data) {
                    _this.prop.user.changeStatus(data);
                } });*/
            });
        },

        hideAuth: function(){
            $('#vk_auth').hide();
        },

        showAuth: function(){
            $('#vk_auth').show();
        },

        showGreeting: function(name){
            $('#user-greeting')
                .html('Здорово что зашел, ' + name)
                .show()
                .delay(2000)
                .fadeOut(500);
        },

        auth: function(){
            VK.Auth.login(function(r){
              debugger;
            }, 16 | 131072 | 128);
        },

        destroy: function(){
            this.$el.off();
        },

        render: function(){
            this.$el.html(this.template({}));
            return this.$el;
        }

    });

    HeaderRegion.prototype.regionName = 'header-region';

    return HeaderRegion;
});


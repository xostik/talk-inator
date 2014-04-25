define(['abstract-layout', 'underscore', requirePaths['simple-layout.tpl'], 'inheritance'], function( Layout, _, tpl ){
    var SimpleLayout = function(){
        _.superClass( SimpleLayout, this );

        this.$root = $( _.template( tpl )( {} ) );

        this.regionList = {
            //'some-region-name': undefined|regionInstance, ...
            'singleton-region': undefined
        };
    };

    _.inherit( SimpleLayout, Layout );

    SimpleLayout.prototype.layoutName = 'simple-layout';

    return SimpleLayout;
});
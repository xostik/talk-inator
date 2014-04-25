define(['backbone', 'jquery'], function(Backbone, $){

    var currentLayout = undefined;

    // ----------------------------

    function updateLayout( newLayoutData ){
        var layout;
        if( !currentLayout ){
            layout = createLayoutByLayoutData( newLayoutData );
            enableLayout( layout );
        }else{
            if( newLayoutData.layout.prototype.layoutName != currentLayout.layoutName ){
                currentLayout.destroy();

                layout = createLayoutByLayoutData( newLayoutData );
                enableLayout( layout );
            }else{
                var difference = regionListsDifference( currentLayout.regions(), newLayoutData.regions),
                    regionsList;
                currentLayout.disableRegions( difference );

                difference = regionListsDifference( newLayoutData.regions, currentLayout.regions() );
                regionsList = createListOfRegionsByListOfClasses( difference );
                currentLayout.enableRegions( regionsList );
            }
        }
    }

    // ----------------------------

    function enableLayout( layout ){
        $( '#base-layout-wrap' )
            .html( layout.render() );

        currentLayout = layout;
    }

    // --------------

    function regionListsDifference( r1, r2 ){
         var result = {};

        for( var k in r1 ){
            if( !r2[k] || !isEqualRegions(r2[k], r1[k]) ){
                result[k] = r1[k];
            }
        }

        return result;
    }

    // --------------

    function isEqualRegions(r1, r2){
        return regionViewName(r1) == regionViewName(r2) && regionModelHash(r1) == regionModelHash(r2);
    }

    // --------------

    function regionModelHash(region){
        return region.model.cid;
    }

    // --------------

    function regionViewName(region){
        if(isBackboneView(region)){
            return region.regionName;
        }else{
            return region.view.prototype.regionName;
        }
    }

    // --------------

    function isBackboneView(obj){
          return obj instanceof Backbone.View;
    }

    // --------------

    function createLayoutByLayoutData( layoutData ){
        var layout = new layoutData.layout(),
            regionList = createListOfRegionsByListOfClasses( layoutData.regions );
        layout.enableRegions(regionList);
        return layout;
    }

    // --------------

    function createListOfRegionsByListOfClasses( classes ){
        var regionList = {},
            view,
            model;

        for( var k in classes ){
            model = classes[k].model;
            view = new classes[k].view({model: model});
            view.model = model;
            regionList[k] = view;
        }

        return regionList;
    }

    // --------------

    return {
        currentLayout: currentLayout,
        updateLayout: updateLayout
    };
});
define([], function(){
    var AbstractLayout = function(){
        this.$root = $('<div></div>');

        this.regionList = {
            //'some-region-name': undefined|regionInstance, ...
        };
    };

    AbstractLayout.prototype.layoutName = 'abstract-layout';

    // --------------------

    AbstractLayout.prototype.regions = function(){
        var result = {};
        for(var k in this.regionList){
            if(this.regionList[k]){
                result[k] = this.regionList[k];
            }
        }
        return result;
    };

    // --------------------

    AbstractLayout.prototype.destroy = function(){
        var notEmptyRegions = this.regions();
        for(var k in notEmptyRegions){
            notEmptyRegions[k].destroy();
        }

        this.$root.remove();
    };

    // --------------------

    AbstractLayout.prototype.enableRegions = function(regions){
        for(var k in regions){
            if(!this.regionList.hasOwnProperty(k)){
                throw "AbstractLayout.enableRegions - wrong region name: " + k;
            }

            if(this.regionList[k]){
                this.regionList[k].destroy();
            }

            this.regionList[k] = regions[k];

            this.renderRegion(k);
        }
    };

    // --------------------

    AbstractLayout.prototype.disableRegions = function(regions){
        for(var k in regions){
            if(!this.regionList.hasOwnProperty(k)){
                throw "AbstractLayout.enableRegions - wrong region name: " + k;
            }

            if(this.regionList[k]){
                this.regionList[k].destroy();
            }
        }
    };


    // --------------------

    AbstractLayout.prototype.render = function(){
        return this.$root;
    };

    // --------------------

    AbstractLayout.prototype.renderRegion = function(regionName){
        $('#'+regionName, this.$root)
            .html(this.regionList[regionName].render());
    };

    // --------------------

    return AbstractLayout;
});
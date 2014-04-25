define(['jquery'], function ($) {

    function allItems(items, handler) {
        var defferedItems = [];
        for (var i = 0, ii = items.length; i < ii; i++) {
            defferedItems.push(items[i].getWhenReadyDeferred());
        }
        $.when.apply($, defferedItems)
            .done(handler);
    }

    // --------------

    return {
        allItems: allItems
    };
});

define(['jquery'], function($){

    function getCurrentUserData(){
        var userDataPromise = $.Deferred();

        VK.Auth.getLoginStatus( function(response){
            userDataPromise.resolve(response);
        });

        return userDataPromise;
    }

    // --------------

    return {
        getCurrentUserData: getCurrentUserData
    };
});
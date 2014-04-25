define(['backbone', 'jquery', 'user-models', 'user-tasks'], function(Backbone, $, Models, task){

    var currentUser;

    // --------------

    function getCurrentUser(){
        if(!currentUser){
            var promiseUserData = task.getCurrentUserData();
            currentUser = new Models.User({
                promiseInitData: promiseUserData
            });
        }

        return currentUser;
    }

    // --------------

    return {
        getCurrentUser: getCurrentUser
    };
});
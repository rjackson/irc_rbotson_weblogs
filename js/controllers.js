'use strict';

/* Controllers */
var friendlifyDbRows = function dbToPanes(rows) {
    var output = {};
    for (var i = 0; i < rows.length; i++) {
        if (!output[rows[i].key]) output[rows[i].key] = {};
        if (!output[rows[i].key].messages) output[rows[i].key].messages = [];
        if (!output[rows[i].key].userWidth) output[rows[i].key].userWidth = 0;

        // Parse data from DB into a {timestamp, user, message} format for Angular to play with.
        var data = dataParse(rows[i].doc);
        output[rows[i].key].messages.push(data);
        if (data.rawUser.length + 1 > output[rows[i].key].userWidth) output[rows[i].key].userWidth = data.rawUser.length + 1;

    }
    return output;
};
var LogTabsCtrl = function ($scope, cornercouch) {
    $scope.database = cornercouch("http://localhost:5984", "JSONP").getDB("rbotson_irc_log");
    $scope.database.query("past24hrs", "past24hrs", {include_docs:true, descending:true}).then(function (){
        $scope.panes = friendlifyDbRows($scope.database.rows);
    });
    // $scope.database.$watch("rows", function(oldVal, newVal){
    // });
};
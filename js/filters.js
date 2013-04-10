'use strict';

/* Filters */

angular.module('myApp.filters', []).
    filter('formatUnixTimestamp', function(){
        // Adapted from JonathonK of StackOverflow. http://stackoverflow.com/a/2315478
        return function(input) {
            var dt = new Date(input * 1000);

            var hours = dt.getHours();
            var minutes = dt.getMinutes();
            var seconds = dt.getSeconds();

            // the above dt.get...() functions return a single digit
            // so I prepend the zero here when needed
            if (hours < 10)
             hours = '0' + hours;

            if (minutes < 10)
             minutes = '0' + minutes;

            if (seconds < 10)
             seconds = '0' + seconds;

            return hours + ":" + minutes + ":" + seconds;
        };
    });
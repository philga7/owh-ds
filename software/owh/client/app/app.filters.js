(function(){
    'use strict';
    angular
        .module('owh.filters', [])
        .filter('ToUpperCase', function() {
            return function(input) {
                input = input || '';
                return input.toUpperCase();
            };
        })
        .filter('ToLowerCase', function() {
            return function(input) {
                input = input || '';
                return input.toLowerCase();
            };
        })
        .filter('GenderTitle', function() {
            return function(input) {
                input = input || '';
                if(input === 'F') return 'Female';
                if(input === 'M') return 'Male';
                return input;
            };
        });
}());

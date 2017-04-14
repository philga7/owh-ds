(function(){
    'use strict';
    angular
        .module('owh')
        .service('mapService', mapService);

    mapService.$inject = ['$rootScope', '$timeout', 'utilService', 'leafletData', 'shareUtilService', '$translate'];

    //service to provide utilities for leaflet geographical map
    function mapService($rootScope, $timeout, utilService, leafletData, shareUtilService, $translate) {
        var service = {
            updateStatesDeaths: updateStatesDeaths,
            addExpandControl: addExpandControl,
            addShareControl: addShareControl
        };
        return service;

        /*
         Update mapData
         */
        function updateStatesDeaths(primaryFilter, data, totalCount, mapOptions) {
            var years = getSelectedYears(primaryFilter);
            //update states info with trials data
            var stateDeathTotals = [];
            angular.forEach($rootScope.states.features, function(feature){
                var state = utilService.findByKeyAndValue(data.states, 'name', feature.properties.abbreviation);
                if (utilService.isValueNotEmpty(state)){
                    if(primaryFilter.key === 'deaths') {
                        stateDeathTotals.push(state['deaths']);
                    }
                    if(primaryFilter.key === 'bridge_race') {
                        stateDeathTotals.push(state['bridge_race']);
                    }
                    feature.properties.years = years;
                    feature.properties.totalCount = state['deaths']; /*+ (Math.floor((Math.random()*10)+1))*100000;*/
                    feature.properties.sex = state.sex;
                    feature.properties['bridge_race'] = state['bridge_race'];
                }
            });
            var minMaxValueObj = utilService.getMinAndMaxValue(stateDeathTotals);
            angular.extend(primaryFilter.mapData, {
                mapMaxValue : minMaxValueObj.maxValue,
                mapMinValue : minMaxValueObj.minValue
            });
            //update legend values on filtering..
            if (mapOptions.selectedMapSize==="big") {
                angular.extend(primaryFilter.mapData, {
                    legend: generateLegend(minMaxValueObj.minValue, minMaxValueObj.maxValue)
                });
            }
            angular.extend(primaryFilter.mapData, {
                geojson: {
                    data: $rootScope.states,
                    style: getStyleFunction(primaryFilter)
                },
                mapTotalCount: totalCount
            });

        }

        function getSelectedYears(primaryFilter) {
            var yearFilter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', 'current_year');
            if (yearFilter) {
                return utilService.isValueNotEmpty(yearFilter.value) ? yearFilter.value : utilService.getValuesByKey(yearFilter.autoCompleteOptions, 'title');
            }
        }

        //generate labels for map legend labels
        function getLabels(minValue, maxValue) {
            return utilService.generateMapLegendLabels(minValue, maxValue);
        }

        //return legend configuration parameters
        function generateLegend(minValue, maxValue){
            return {
                position: 'bottomleft',
                colors: ['#190032','#270053','#3f007d','#54278f','#6a51a3','#807dba','#9e9ac8','#bcbddc','#dadaeb','#efedf5','#fcfbfd'],
                labels: getLabels(minValue, maxValue)
            }
        }

        //get map feature colors
        function getColor(d, ranges) {
            // var ranges = utilService.generateMapLegendRanges(sc.filters.selectedPrimaryFilter.mapData.mapMinValue,
            //     sc.filters.selectedPrimaryFilter.mapData.mapMaxValue);
            return d > ranges[10] ? '#190032' :
                d > ranges[9]  ?  '#270053':
                d > ranges[8]  ?  '#3f007d':
                d > ranges[7]  ?  '#54278f':
                d > ranges[6]  ?  '#6a51a3':
                d > ranges[5]  ?  '#807dba':
                d > ranges[4]  ?  '#9e9ac8':
                d > ranges[3]  ?  '#bcbddc':
                d > ranges[2]  ?  '#dadaeb':
                d > ranges[1]  ?  '#efedf5': '#fcfbfd';
        }

        //return map feature styling configuration parameters
        function getStyleFunction(primaryFilter) {
            var ranges = utilService.generateMapLegendRanges(primaryFilter.mapData.mapMinValue,
                primaryFilter.mapData.mapMaxValue);
            return function style(feature) {
                var total = feature.properties['bridge_race'];
                return {
                    fillColor: getColor(total, ranges),
                    weight: 0.8,
                    opacity: 1,
                    color: 'black',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }
        }

        function addExpandControl(mapOptions, primaryFilter) {
            return L.Control.extend({
                options: {
                    position: 'topright'
                },
                onAdd: function (map) {
                    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom fa fa-expand fa-2x purple-icon');
                    container.onclick = function (event) {
                        if (mapOptions.selectedMapSize === "small") {
                            mapOptions.selectedMapSize = "big";
                            resizeUSAMap(true, primaryFilter);
                            angular.element(container).removeClass('fa-expand');
                            angular.element(container).addClass('fa-compress');
                        } else if (mapOptions.selectedMapSize === "big") {
                            mapOptions.selectedMapSize = "small";
                            resizeUSAMap(false, primaryFilter);
                            angular.element(container).removeClass('fa-compress');
                            angular.element(container).addClass('fa-expand');
                        } else {
                            mapOptions.selectedMapSize = "small";
                            resizeUSAMap(false, primaryFilter);
                            angular.element(container).removeClass('fa-compress');
                            angular.element(container).addClass('fa-expand');
                        }
                    };
                    return container;
                }
            });
        }

        function resizeUSAMap(isZoomIn, primaryFilter) {
            leafletData.getMap().then(function(map) {
                if(isZoomIn) {
                    map.zoomIn();
                    angular.extend(primaryFilter.mapData, {
                        legend: generateLegend(primaryFilter.mapData.mapMinValue, primaryFilter.mapData.mapMaxValue)
                    });
                } else {
                    primaryFilter.mapData.legend = undefined;
                    map.zoomOut();
                }
                $timeout(function(){ map.invalidateSize()}, 1000);
            });

        }

        function addShareControl() {
            return L.Control.extend({
                options: {
                    position: 'topright'
                },
                onAdd: function (map) {
                    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom fa fa-share-alt fa-2x purple-icon');
                    container.title = $translate.instant('label.share.on.fb');
                    container.onclick = function (event) {
                        angular.element(document.getElementById('spindiv')).removeClass('ng-hide');
                        leafletData.getMap().then(function (map) {
                            leafletImage(map, function (err, canvas) {
                                // sc.showFbDialog('chart_us_map', 'OWH - Map', canvas.toDataURL());
                                shareUtilService.shareOnFb('chart_us_map', 'OWH - Map', undefined, undefined, canvas.toDataURL());
                            });
                        });

                    };
                    return container;
                }
            });
        }

    }
}());

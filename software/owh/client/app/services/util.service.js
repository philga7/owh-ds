//TODO: change to utils.service.js and move to app/services
(function(){
    'use strict';
    angular
        .module('owh.services')
        .service('utilService', utilService);

    utilService.$inject = ['$dateParser', '$filter', '$translate', '$rootScope'];

    function utilService($dateParser, $filter, $translate, $rootScope){

        var service = {
            isValueNotEmpty : isValueNotEmpty,
            isValuesNotEmptyInArray: isValuesNotEmptyInArray,
            isDateString: isDateString,
            convertDateToString: convertDateToString,
            formatDateString: formatDateString,
            findByKey: findByKey,
            sortByKey: sortByKey,
            findByKeyAndValue: findByKeyAndValue,
            findIndexByKeyAndValue: findIndexByKeyAndValue,
            findAllByKeyAndValue: findAllByKeyAndValue,
            findAllNotContainsKeyAndValue: findAllNotContainsKeyAndValue,
            findAllByKeyAndValuesArray: findAllByKeyAndValuesArray,
            updateAllByKeyAndValue: updateAllByKeyAndValue,
            //prepareGroupedTableData: prepareGroupedTableData,
            numberWithCommas: numberWithCommas,
            getValueFromOptions: getValueFromOptions,
            //buildAPIQuery: buildAPIQuery,
            //prepareNestedAccordionData: prepareNestedAccordionData,
            concatenateByKey : concatenateByKey,
            getValuesByKey: getValuesByKey,
            getValuesByKeyExcludingKeyAndValue: getValuesByKeyExcludingKeyAndValue,
            getValuesByKeyIncludingKeyAndValue: getValuesByKeyIncludingKeyAndValue,
            prepareMixedTableData : prepareMixedTableData,
            //prepareYRBSTableData : prepareYRBSTableData,
            generateMapLegendLabels : generateMapLegendLabels,
            generateMapLegendRanges : generateMapLegendRanges,
            getMinAndMaxValue : getMinAndMaxValue,
            getSelectedAutoCompleteOptions: getSelectedAutoCompleteOptions
        };

        return service;

        // Util for finding a value is empty or not
        function isValueNotEmpty(value) {
            return angular.isDefined(value) && value !== null && !jQuery.isEmptyObject(value) &&
                (!angular.isString(value) || value != '');
        }

        // Util for finding a value is empty or not
        function isValuesNotEmptyInArray(value) {
            var notEmpty = false;
            if(isValueNotEmpty(value)) {
                angular.forEach(value, function(eachValue, index) {
                    if(notEmpty) {
                        return;
                    }
                    notEmpty = isValueNotEmpty(eachValue);
                });
            }
            return notEmpty;
        }

        // Util for finding a value is date or not
        function isDateString(value) {
            return !isNaN(Date.parse(value));
        }
        // Util for finding a value is empty or not
        function convertDateToString(date, format) {
            return $filter('date')(date, format);
        }
        // Util for finding a value is empty or not
        function formatDateString(dateString, inputFormat, outputFormat) {
            return this.convertDateToString($dateParser(dateString, inputFormat), outputFormat);
        }

        /**
         * Finds and returns the first object in array of objects by using the key and value
         * @param a
         * @param key
         * @param value
         * @returns {*}
         */
        function findByKeyAndValue(a, key, value) {
            for (var i = 0; i < a.length; i++) {
                if ( a[i][key] && a[i][key] === value ) {return a[i];}
            }
            return null;
        }

        /**
         * Finds and returns the first object index in array of objects by using the key and value
         * @param a
         * @param key
         * @param value
         * @returns {*}
         */
        function findIndexByKeyAndValue(a, key, value) {
            for (var i = 0; i < a.length; i++) {
                if ( a[i][key] && a[i][key] === value ) {return i;}
            }
            return -1;
        }


        function sortByKey(array, key, asc) {
            return array.sort(function(a, b) {
                var x = angular.isFunction(key) ? key(a) : a[key];
                var y = angular.isFunction(key) ? key(b) : b[key];
                if(asc===undefined || asc === true) {
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                }else {
                    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
                }
            });
        }

        /**
         * Finds and returns the first object in array of objects by using the key
         * @param a
         * @param key
         * @returns {*}
         */
        function findByKey(a, key) {
            for (var i = 0; i < a.length; i++) {
                if (a[i][key]) {return a[i];}
            }
            return null;
        }

        /**
         * Finds and returns all objects in array of objects by using the key and value
         * @param a
         * @param key
         * @param value
         * @returns {Array}
         */
        function findAllByKeyAndValue(a, key, value) {
            var result = [];
            for (var i = 0; i < a.length; i++) {
                if (a[i][key] === value) {
                    result.push(a[i]);
                }
            }
            return result;
        }

        /**
         * Finds and returns all objects in array of objects that not contains the key and value
         * @param a
         * @param key
         * @param value
         * @returns {Array}
         */
        function findAllNotContainsKeyAndValue(a, key, value) {
            var result = [];
            for (var i = 0; i < a.length; i++) {
                if (a[i][key] !== value) {
                    result.push(a[i]);
                }
            }
            return result;
        }

        /**
         * Finds and returns all objects in array of objects by using the key and value
         * @param a
         * @param key
         * @param values
         * @returns {Array}
         */
        function findAllByKeyAndValuesArray(a, key, values) {
            var result = [];
            for (var i = 0; i < a.length; i++) {
                if (values.indexOf(a[i][key]) >= 0 ) {
                    result.push(a[i]);
                }
            }
            return result;
        }

        /**
         * updates all objects in array of objects by using the key and value
         * @param a
         * @param key
         * @param value
         */
        function updateAllByKeyAndValue(a, key, value) {
            for (var i = 0; i < a.length; i++) {
                a[i][key] = value;
            }
        }

        /*function buildAPIQuery(filters) {
         return {
         query: prepareFilterQuery(filters),
         detail:0
         };
         }

         function prepareFilterQuery(filters) {
         var filter = {};
         var filterQuery = angular.copy(filters);
         angular.forEach(filterQuery, function(searchObject, index) {
         if( angular.isArray(searchObject.value) ){
         var emptyValueIndex = searchObject.value.indexOf('');
         if (emptyValueIndex > -1) {
         searchObject.value.splice(emptyValueIndex, 1);
         }
         }
         if ( isValueNotEmpty(searchObject.value) ) {
         filter[searchObject.queryKey] = {
         exact: searchObject.exact,
         primary: searchObject.primary,
         caseChange: searchObject.caseChange,
         queryKey: searchObject.queryKey,
         value: searchObject.value,
         type: searchObject.type
         };
         }
         });
         return filter;
         }*/

        function numberWithCommas(number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function getValueFromOptions(options, key, value, outputKey, defaultValue) {
            defaultValue = defaultValue ? defaultValue : value;
            var matchedOption;
            if(options) {
                matchedOption = findByKeyAndValue(options, key, value);
            }
            return matchedOption ? matchedOption[outputKey] : defaultValue;
        }

        /*function prepareNestedAccordionData(headers, data, countKey, totalCount, countLabel) {
         if(headers.length == 2) {
         return prepareBasicTableData(headers, data, countKey, totalCount, countLabel);
         }
         var accordionObject = {
         isAccordion: true,
         data: []
         };
         angular.forEach(headers, function(eachHeader, headerIndex) {
         var eachHeaderData = data[eachHeader.key];
         angular.forEach(eachHeaderData, function(eachData, index) {
         var eachAccordion = {};
         eachAccordion.headerTitle = eachHeader.title;
         eachAccordion.title = getValueFromOptions(eachHeader.autoCompleteOptions, 'key', eachData.name, 'title');
         eachAccordion.count = numberWithCommas(eachData[countKey]);
         eachAccordion.percentage = (eachData[countKey] / totalCount) * 100;
         eachAccordion.children = prepareNestedAccordionData(headers.slice(1), eachData, countKey, totalCount, countLabel);
         accordionObject.data.push(eachAccordion);
         });
         });
         return accordionObject;
         }*/
        /*function prepareBasicTableData(headers, data, countKey, totalCount, countLabel) {
         var tableObject = {
         isAccordion: false,
         data: [],
         headers: []
         };

         var headerData = data[headers[0].key];
         tableObject.headers.push(headers[0].title);
         angular.forEach(headers[1].autoCompleteOptions, function(eachOption) {
         tableObject.headers.push(eachOption.title);
         });
         tableObject.headers.push(countLabel);
         angular.forEach(headerData, function(eachData, index) {
         var eachTableRow = [];
         eachTableRow.push({
         title: getValueFromOptions(headers[0].autoCompleteOptions, 'key', eachData.name, 'title'),
         isCount: false
         });
         angular.forEach(headers[1].autoCompleteOptions, function(eachOption) {
         var count = getValueFromOptions(eachData[headers[1].key], 'name', eachOption.key, countKey, '0');
         eachTableRow.push({
         title: numberWithCommas(Number(count)),
         isCount: true,
         percentage: (Number(count) / totalCount) * 100
         });
         });
         eachTableRow.push({
         title: numberWithCommas(eachData[countKey]),
         isCount: true,
         percentage: (eachData[countKey] / totalCount) * 100
         });
         tableObject.data.push(eachTableRow);
         });
         return tableObject;
         }*/
        /*function prepareGroupedTableData(headers, data, countKey, totalCount, cssClass, headerStartIndex) {
         if(!cssClass) {
         cssClass = 'group';
         } if( !headerStartIndex ) {
         headerStartIndex = 0;
         }
         var tableData = [];
         angular.forEach(headers, function(eachHeader, headerIndex) {
         var eachHeaderData = data[eachHeader.key];
         angular.forEach(eachHeaderData, function(eachData, index) {
         var eachTableRow = {};
         var matchedOption;
         if(eachHeader.autoCompleteOptions) {
         matchedOption = findByKeyAndValue(eachHeader.autoCompleteOptions, 'key', eachData.name);
         }
         eachTableRow[eachHeader.key] = matchedOption ? matchedOption.title : eachData.name;
         eachTableRow[countKey] = eachData[countKey];
         eachTableRow[countKey + 'Percentage'] = (eachData[countKey] / totalCount) * 100;
         eachTableRow.cssClass = cssClass;
         eachTableRow.childCssClass = cssClass + ' ' + cssClass + '_' + index;
         if(headers.length > 1) {
         eachTableRow.allowCollapse = true;
         eachTableRow.collapsibleIndex = headerStartIndex;
         var nextHeader = headers[headerIndex + 1];
         $translate(nextHeader.title).then(function (translation) {
         eachTableRow[nextHeader.key] = eachData[nextHeader.key].length + ' ' + translation + 's'
         });
         }
         tableData.push(eachTableRow);
         tableData = tableData.concat(prepareGroupedTableData(headers.slice(1), eachData, countKey, totalCount, eachTableRow.childCssClass, headerStartIndex + 1, totalCount));
         });
         });
         return tableData;
         }*/
        function prepareMixedTableData(headers, data, countKey, totalCount, countLabel, calculatePercentage, calculateRowTotal) {
            var tableData = {
                headers: prepareMixedTableHeaders(headers, countLabel),
                data: []
            };
            tableData.data = prepareMixedTableRowData(headers.rowHeaders, headers.columnHeaders, data, countKey, totalCount, calculatePercentage, calculateRowTotal);
            return tableData;
        }

        function getSelectedAutoCompleteOptions(filter) {
            var filterValue = filter.value;
            if(angular.isArray(filterValue)) {
                return isValueNotEmpty(filterValue)
                    ? findAllByKeyAndValuesArray(filter.autoCompleteOptions, 'key', filter.value)
                    : filter.autoCompleteOptions
            } else {
                var selectedOption = findByKeyAndValue(filter.autoCompleteOptions, 'key', filterValue);
                return selectedOption.isAllOption
                    ? findAllNotContainsKeyAndValue(filter.autoCompleteOptions, 'isAllOption', true)
                    : [selectedOption];
            }

        }
        function prepareMixedTableHeaders(headers, countLabel) {
            var tableHeaders = [[]];
            var tableRowHeaders = [];
            var tableColumnHeaders = prepareMixedTableColumnHeaders(headers.columnHeaders);

            angular.forEach(headers.rowHeaders, function(eachRowHeader) {
                var  eachTableRowHeader = {
                    colspan: 1,
                    rowspan: tableColumnHeaders.headers.length > 0 ? tableColumnHeaders.headers.length : 1
                };
                //$translate(eachRowHeader.title).then(function (translation) {
                eachTableRowHeader.title = $filter('translate')(eachRowHeader.title);
                //});
                tableRowHeaders.push(eachTableRowHeader)
            });
            if(tableColumnHeaders.headers.length > 0) {
                tableHeaders = tableColumnHeaders.headers;
            }
            tableHeaders[0] = tableRowHeaders.concat(tableHeaders[0]);
            if(tableRowHeaders.length > 0 && countLabel) {
                tableHeaders[0].push({
                    title: countLabel,
                    colspan: 1,
                    rowspan: tableColumnHeaders.headers.length > 0 ? tableColumnHeaders.headers.length : 1
                });
            }
            //mark each data column header as isData to set alignment
            angular.forEach(tableColumnHeaders.headers, function(row, index) {
                var skip = (index === 0 ? headers.rowHeaders.length : 0);
                for(var i = skip; i < row.length; i++) {
                    row[i].isData = true;
                }
            });
            return tableHeaders;
        }
        function prepareMixedTableColumnHeaders(columnHeaders) {
            var tableColumnHeaderData = {
                totalColspan: 0,
                headers: []
            };
            if(columnHeaders.length > 0) {
                var eachColumnHeader = columnHeaders[0];
                tableColumnHeaderData.headers.push([]);
                angular.forEach(getSelectedAutoCompleteOptions(eachColumnHeader), function(eachOption, optionIndex) {
                    var colspan = 1;
                    if(columnHeaders.length > 1) {
                        var childColumnHeaderData = prepareMixedTableColumnHeaders(columnHeaders.slice(1));
                        colspan = childColumnHeaderData.totalColspan;
                        angular.forEach(childColumnHeaderData.headers, function(eachChildHeader, childHeaderIndex) {
                            if(optionIndex == 0) {
                                tableColumnHeaderData.headers.push([]);
                            }
                            tableColumnHeaderData.headers[childHeaderIndex + 1] = tableColumnHeaderData.headers[childHeaderIndex + 1].concat(eachChildHeader);
                        });
                    }
                    tableColumnHeaderData.headers[0].push({
                        title: eachOption.title,
                        colspan: colspan,
                        rowspan: 1
                    });
                    tableColumnHeaderData.totalColspan += colspan;
                });

            }
            return tableColumnHeaderData;
        }
        function prepareMixedTableRowData(rowHeaders, columnHeaders, data, countKey, totalCount, calculatePercentage, calculateRowTotal) {
            var tableData = [];

            if(rowHeaders && rowHeaders.length > 0) {
                var eachHeader = rowHeaders[0];
                var eachHeaderData = data[eachHeader.key];
                angular.forEach(eachHeader.autoCompleteOptions, function(matchedOption, index) {
                    var eachData = findByKeyAndValue(eachHeaderData, 'name', matchedOption.key);
                    if(!eachData) {
                        return;
                    }
                    /*});
                     angular.forEach(eachHeaderData, function(eachData, index) {
                     var matchedOption;
                     if(eachHeader.autoCompleteOptions) {
                     matchedOption = findByKeyAndValue(eachHeader.autoCompleteOptions, 'key', eachData.name);
                     }*/
                    var eachTableRow = {
                        title: matchedOption.title,
                        isCount: false,
                        rowspan: 1,
                        colspan: 1,
                        key: matchedOption.key,
                        iconClass: eachHeader.iconClass,
                        onIconClick: eachHeader.onIconClick
                    };
                    var childTableData = prepareMixedTableRowData(rowHeaders.slice(1), columnHeaders, eachData, countKey, totalCount, calculatePercentage, calculateRowTotal);
                    if(rowHeaders.length > 1 && calculateRowTotal) {
                        var totalArray = [];
                        totalArray.push({
                            title: 'Total',
                            isCount: false,
                            rowspan: 1,
                            colspan: childTableData[0].length - 1,
                            isBold: true
                        });
                        totalArray.push({
                            title: numberWithCommas(eachData[countKey]),
                            percentage: (Number(eachData[countKey]) / totalCount) * 100,
                            isCount: true,
                            rowspan: 1,
                            colspan: 1,
                            isBold: true
                        });
                        childTableData.push(totalArray);
                    }
                    eachTableRow.rowspan = childTableData.length;
                    childTableData[0].unshift(eachTableRow);
                    tableData = tableData.concat(childTableData);
                });
            } else {
                var columnData = prepareMixedTableColumnData(columnHeaders, data, countKey, totalCount, calculatePercentage);
                if(typeof data[countKey] !== 'undefined') {
                    var count = data[countKey];
                    var title = calculatePercentage ? numberWithCommas(Number(count)) : count;
                    columnData.push({
                        title: title,
                        percentage: calculatePercentage ? (Number(data[countKey]) / totalCount) * 100 : undefined,
                        isCount: calculatePercentage,
                        rowspan: 1,
                        colspan: 1,
                        isBold: true
                    });
                }
                tableData.push(columnData);
            }
            return tableData;
        }
        function prepareMixedTableColumnData(columnHeaders, data, countKey, totalCount, calculatePercentage) {
            var tableData = [];
            if(columnHeaders && columnHeaders.length > 0) {
                var eachColumnHeader = columnHeaders[0];
                var eachHeaderData = data[eachColumnHeader.key];
                var eachOptionLength = 0;
                angular.forEach(getSelectedAutoCompleteOptions(eachColumnHeader), function(eachOption, optionIndex) {
                    var matchedData = findByKeyAndValue(eachHeaderData, 'name', eachOption.key);
                    if(matchedData) {
                        if (columnHeaders.length > 1) {
                            var childTableData = prepareMixedTableColumnData(columnHeaders.slice(1), matchedData, countKey, totalCount, calculatePercentage);
                            eachOptionLength = childTableData.length;
                            tableData = tableData.concat(childTableData);
                        } else {
                            var count = matchedData[countKey];
                            eachOptionLength = 1;
                            var title = calculatePercentage ? numberWithCommas(Number(count)) : count;
                            tableData.push({
                                title: title,
                                percentage: calculatePercentage? (Number(count) / totalCount) * 100: undefined,
                                isCount: calculatePercentage,
                                rowspan: 1,
                                colspan: 1
                            });
                        }
                    } else {
                        if(eachOptionLength <= 0) {
                            eachOptionLength = getOptionDataLength(columnHeaders.slice(1));
                        }
                        tableData = tableData.concat(getArrayWithDefaultValue(eachOptionLength, {title: '0',percentage: 0,isCount: calculatePercentage}));
                    }
                });
            }
            return tableData;
        }
        function getOptionDataLength(columnHeaders) {
            var optionDataLength = 1;
            angular.forEach(columnHeaders, function(eachColumnHeader) {
                optionDataLength = optionDataLength * getSelectedAutoCompleteOptions(eachColumnHeader).length;
            });
            return optionDataLength;
        }
        function getArrayWithDefaultValue(length, defaultValue) {
            var defaultArray = [];
            for(var i = 0; i < length; i++) {
                defaultArray.push(defaultValue);
            }
            return defaultArray;
        }

        /**
         * Concatenate the array with key
         * @param data
         * @param key
         * @param delimiter
         * @returns {string}
         */
        function concatenateByKey(data, key, delimiter) {
            delimiter = delimiter || ', ';
            return getValuesByKey(data, key).join(delimiter);
        }

        /**
         * get the array with key
         * @param data
         * @param key
         * @returns {Array}
         */
        function getValuesByKey(data, key) {
            var values = [];
            for (var i = 0; i < data.length; i++) {
                values.push(data[i][key]);
            }
            return values;
        }

        /**
         * get the array with key
         * @param data
         * @param key
         * @param includeKey
         * @param includeValue
         * @returns {Array}
         */
        function getValuesByKeyIncludingKeyAndValue(data, key, includeKey, includeValue) {
            var values = [];
            for (var i = 0; i < data.length; i++) {
                if(data[i][includeKey] === includeValue) {
                    values.push(data[i][key]);
                }
            }
            return values;
        }

        /**
         * get the array with key
         * @param data
         * @param key
         * @returns {Array}
         */
        function getValuesByKeyExcludingKeyAndValue(data, key, excludeKey, excludeValue) {
            var values = [];
            for (var i = 0; i < data.length; i++) {
                if(data[i][excludeKey] != excludeValue) {
                    values.push(data[i][key]);
                }
            }
            return values;
        }


        /*function prepareYRBSTableData(data, headers, groupedFilter, yearFilter, aggKey, isAggAtStart) {
         var tableData = {
         headers: [[]],
         data : []
         };
         /!*tableData.headers[0].push({
         title: 'Year',
         colspan: 1,
         rowspan: 1
         });*!/
         var questionHeaders = findAllByKeyAndValue(headers, 'key', 'question');
         var otherHeaders = findAllNotContainsKeyAndValue(headers, 'key', 'question');
         groupedFilter.autoCompleteOptions = otherHeaders.concat(groupedFilter.autoCompleteOptions);
         groupedFilter.value = [];
         var columnHeaders = [groupedFilter];
         if(yearFilter.value.length > 1) {
         columnHeaders.push(yearFilter)
         }
         var selectedYears = getSelectedAutoCompleteOptions(yearFilter);
         var mixedTableHeaders = {
         rowHeaders: questionHeaders,
         columnHeaders: columnHeaders
         };
         tableData.headers = prepareMixedTableHeaders(mixedTableHeaders);
         var totalTablecolspan = 0;
         if(tableData.headers[0].length > 0) {
         angular.forEach(tableData.headers[0], function(eachHeader) {
         totalTablecolspan += eachHeader.colspan;
         })
         }
         angular.forEach(data.aggData, function(questions, questionCategory){
         var categoryRow = [];
         categoryRow.push({
         title: questionCategory,
         colspan: totalTablecolspan,
         rowspan:1,
         isBold: true
         });
         tableData.data.push(categoryRow);
         angular.forEach(questions, function(years, question){
         var eachTableRow = [];
         eachTableRow.push({
         title: question,
         colspan: 1,
         rowspan: 1
         });
         angular.forEach(selectedYears, function(eachYear) {
         angular.forEach(groupedFilter.autoCompleteOptions, function(eachOption){
         var data = years[eachYear.key] ? years[eachYear.key][eachOption.key] : '';
         eachTableRow.push({
         title: data,
         colspan:1,
         rowspan:1
         });
         });
         });
         tableData.data.push(eachTableRow);
         })
         });
         return tableData;
         }*/


        function getMinAndMaxValue(array) {
            var sortedArray = array.sort(function(a,b) {
                return a-b;
            });
            return { minValue: sortedArray[0], maxValue: sortedArray[sortedArray.length-1] }
        }

        //generate legend counters based on result
        function getLegendCounter(minValue, maxValue) {
            return (maxValue - minValue)/10;
        }

        function generateMapLegendRanges(minValue, maxValue) {
            var counter = getLegendCounter(minValue, maxValue);
            var counterRoundedValue = Math.round(counter/((counter<50)?50:100), 0)*100;
            var minRoundedValue = Math.round(minValue/100, 0)*100;
            var ranges = [];
            ranges.push(minRoundedValue);
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(function(option, index){
                ranges.push(minRoundedValue + (counterRoundedValue*index));
            });
            return ranges;
        }

        function generateMapLegendLabels(minValue, maxValue) {
            var labels = [];
            generateMapLegendRanges(minValue, maxValue).reverse().forEach(function(option, index){
                labels.push('> '+ numberWithCommas(option)) ;
            });
            var lastLabelIndex = labels.length-1;
            labels[lastLabelIndex] = labels[lastLabelIndex].replace('>', '');
            labels[lastLabelIndex] = '<'+ labels[lastLabelIndex];
            return labels;
        }
    }
}());
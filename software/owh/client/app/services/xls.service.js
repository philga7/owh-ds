(function(){
    'use strict';
    angular
        .module('owh')
        .service('xlsService', xlsService);

    xlsService.$inject = [];

    //service to interface with js-xlsx library
    function xlsService() {
        var service = {
            getSheetFromArray: getSheetFromArray,
            getSheetArrayFromMixedTable: getSheetArrayFromMixedTable,
            getCSVFromSheet: getCSVFromSheet,
            exportCSVFromMixedTable: exportCSVFromMixedTable,
            exportXLSFromMixedTable: exportXLSFromMixedTable
        };
        return service;

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        function exportCSVFromMixedTable(data, filename) {
            var sheetArray = getSheetArrayFromMixedTable(data);
            var sheet = getSheetFromArray(sheetArray);
            var csv = getCSVFromSheet(sheet, data.headers);
            saveAs(new Blob([s2ab(csv)], {type:"application/octet-stream"}), filename + ".csv");
        }

        function exportXLSFromMixedTable(data, filename) {
            var wb = {SheetNames: [], Sheets: {}};
            var ws_name = filename;
            var sheetJson = getSheetArrayFromMixedTable(data);
            var ws = getSheetFromArray(sheetJson);
            wb.SheetNames.push(ws_name);
            wb.Sheets[ws_name] = ws;
            var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), filename + ".xlsx");
        }

        //returns xls worksheet from array of json rows
        //ex: [[{title: 'test', colspan: 1, rowspan: 1}, {...}, {...}], [{...}, null, {...}] ]
        function getSheetFromArray(data) {
            var ws = {'!merges': []};
            var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
            //keep track of offsets caused by merged cells
            var cOffsets = {};
            for(var R = 0; R != data.length; ++R) {
                var rOffset = 0;
                if(!cOffsets[R]) {
                    cOffsets[R] = 0;
                }
                for(var C = 0; C != data[R].length; ++C) {
                    var cellJson = data[R][C];
                    var newR = R + rOffset;
                    var newC = C + cOffsets[R];
                    if(range.s.r > newR) range.s.r = newR;
                    if(range.s.c > newC) range.s.c = newC;
                    if(range.e.r < newR) range.e.r = newR;
                    if(range.e.c < newC) range.e.c = newC;

                    if(cellJson == null) continue;
                    var cell = {v: cellJson.title };
                    var cell_ref = XLSX.utils.encode_cell({c:newC,r:newR});

                    if(typeof cell.v === 'number') cell.t = 'n';
                    else if(typeof cell.v === 'boolean') cell.t = 'b';
                    else if(cell.v instanceof Date) {
                        cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                        cell.v = datenum(cell.v);
                    }
                    else cell.t = 's';

                    if(cellJson.colspan > 1 || cellJson.rowspan > 1) {
                        cOffsets[R] += cellJson.colspan - 1;
                        //when we have a row offset, we have to make sure any resulting column offset is added to subsequent rows
                        for(var i = R + 1; i < R + cellJson.rowspan; i++) {
                            //only add offset if first column
                            if(newC === 0) {
                                //add blank element due to bug in vertically merged cells
                                data[i].unshift({title: '', colspan: 1, rowspan: 1});
                                //proper way to account for vertically merged cells, doesn't work due to js-xlsx bug
                                // if(cOffsets[i]) {
                                    // cOffsets[i] += cellJson.colspan;
                                // } else {
                                    // cOffsets[i] = cellJson.colspan;
                                // }
                            }
                        }
                        var mergeCell = {s: {c: newC, r: newR}, e: {c: (newC + cellJson.colspan - 1), r: (newR + cellJson.rowspan - 1)}};
                        ws['!merges'].push(mergeCell);

                    }
                    ws[cell_ref] = cell;
                }
            }
          	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
          	return ws;
        }

        //gets json representation of sheet
        function getSheetArrayFromMixedTable(table) {
            var sheet = [];
            angular.forEach(table.headers, function(headerRow, idx) {
                var headers = [];
                angular.forEach(headerRow, function(cell, innerIdx) {
                    headers.push({title: cell.title, colspan: cell.colspan, rowspan: cell.rowspan});
                });
                sheet.push(headers);
            });
            angular.forEach(table.data, function(row, idx) {
                var rowArray = [];
                angular.forEach(row, function(cell, innerIdx) {
                    rowArray.push({title: cell.title, colspan: cell.colspan, rowspan: cell.rowspan});
                });
                sheet.push(rowArray);
            });
            return sheet;
        }

        //helper function to repeat merge cells in header for CSV output
        function padSheetForCSV(sheet, headers) {
            var headerMerges = [];
            angular.forEach(sheet['!merges'], function(merge, idx) {
                //only repeat if merge cell is part of headers
                if(merge.s.r < headers.length) {
                    var start = sheet[XLSX.utils.encode_cell(merge.s)];
                    for(var r = merge.s.r; r <= merge.e.r; r++) {
                        for(var c = merge.s.c; c <= merge.e.c; c++) {
                            //replace with value from starting cell in range
                            sheet[XLSX.utils.encode_cell({c: c, r: r})] = {v: start.v, t: 's'};
                        }
                    }
                    headerMerges.push(idx);
                }
            });
            angular.forEach(headerMerges, function(el) {
                sheet['!merges'].splice(el, 1);
            });
            return sheet;
        }

        function getCSVFromSheet(sheet, headers) {
            var csv = XLSX.utils.sheet_to_csv(padSheetForCSV(sheet, headers));
            return csv;
        }

    }
}());

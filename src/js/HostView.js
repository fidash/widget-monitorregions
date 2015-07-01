/* global google,Utils */

var HostView = (function () {
    "use strict";


    /******************************************************************/
    /*                        V A R I A B L E S                       */
    /******************************************************************/

    var charts = {
        "ram": {
            options: {
                slices: {
                    0: {color: 'green'},
                    1: {color: 'silver'}
                }
            }
        },
        "disk": {
            options: {
                slices: {
                    0: {color: 'orange'},
                    1: {color: 'silver'}
                }
            }
        },
        "cpu": {
            options: {
                slices: {
                    0: {color: 'brown'},
                    1: {color: 'silver'}
                }
            }
        }
    };

    var defaultOpt = {
        pieHole: 0.4,
        width: window.innerWidth/2.1,
        height: window.innerHeight/2.3
    };


    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function drawChart (type) {

        var chart = charts[type];

        if (!chart.data) {
            $('#' + type + '-host').text("No data available");
        }

        chart.chart = new google.visualization.PieChart($('#' + type + '-host')[0]);
        chart.chart.draw(chart.data, chart.options);

    }

    function formatData (used) {

        if ((!used && used !== 0) || typeof used !== "number") {
            return null;
        }

        used = used > 100 ? 100 : used;
        used = used < 0 ? 0 : used;

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Used');
        data.addColumn('number', 'Percentage');
        data.addRows([
            ['Used', used],
            ['Free', 100-used]
        ]);

        return data;

    }

    function setData (rawData) {

        var host = rawData.measures[0].hostName.value;

        charts.ram.data = formatData(parseInt(rawData.measures[0].percRAMUsed.value));
        charts.ram.options.title = "Ram usage for " + host;
        Utils.mergeOptions(defaultOpt, charts.ram.options);

        charts.disk.data = formatData(parseInt(rawData.measures[0].percDiskUsed.value));
        charts.disk.options.title = "Disk usage for " + host;
        Utils.mergeOptions(defaultOpt, charts.disk.options);

        charts.cpu.data = formatData(parseInt(rawData.measures[0].percCPULoad.value));
        charts.cpu.options.title = "CPU usage for " + host;
        Utils.mergeOptions(defaultOpt, charts.cpu.options);

    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    return {
        build: function (rawData) {

            setData(rawData);

            drawChart('ram');
            drawChart('disk');
            drawChart('cpu');

        },

        charts: charts
    };

})();
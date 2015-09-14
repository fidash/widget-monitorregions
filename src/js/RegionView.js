/* global Utils,google,Resizable */

var RegionView = (function () {
    "use strict";

    /*****************************************************************
    *                        V A R I A B L E S                       *
    *****************************************************************/

    var chartTypes = {
        "ip": drawIpChart,
        "ram": drawRamChart,
        "core": drawCoreChart,
        "disk": drawDiskChart
    };

    var charts = {
        coreChart: {},
        ramChart: {},
        diskChart: {},
        ipChart: {}
    };

    var pieChartOptions = {
        pieHole: 0.4,
        width: window.innerWidth/2,
        height: (window.innerHeight/2.3) - 27,
        chartArea:{left:0,top:20,width:"100%",height:"100%"},
        pieSliceBorderColor: "transparent"
    };

    var parentResize;
    var visitedRegions = {};


    /****************************************************************/
    /*                    C O N S T R U C T O R                     */
    /****************************************************************/

    function RegionView () {

        parentResize = Object.create(Resizable.prototype).resize;

    }


    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function setPieChartData (used, total, unit) {

        used = used > total ? total : used;
        used = used < 0 ? 0 : used;
        var free = parseFloat((total-used).toFixed(2));

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Used');
        data.addColumn('number', 'Percentage');
        data.addColumn({type: 'string', role: 'tooltip'});
        data.addRows([
            ['Used', used, used + " " + unit + " used"],
            ['Free', free, free + " " + unit + " free"]
        ]);

        return data;

    }

    function drawDiskChart (rawData) {

        var diskChart = charts.diskChart;
        var total = parseInt(rawData.measures[0].nb_disk);
        var used = parseInt(rawData.measures[0].percDiskUsed * total);

        var displayableTotal = parseFloat((Math.floor(((total/1024) * 100)) / 100).toFixed(2));
        var displayableUsed = parseFloat((Math.floor(((used/1024) * 100)) / 100).toFixed(2));

        var options = {
            slices: {
                0: {color: '#60D868'},
                1: {color: 'silver'}
            },
            title: "Disk Capacity: " + displayableTotal + " TiB"
        };

        diskChart.data = setPieChartData(displayableUsed, displayableTotal, "TiB");
        diskChart.options = Utils.mergeOptions(pieChartOptions, options);
        diskChart.chart = new google.visualization.PieChart($('#disk-chart')[0]);
        diskChart.chart.draw(diskChart.data, diskChart.options);

    }

    function drawRamChart (rawData) {

        var ramChart = charts.ramChart;
        var total = parseInt(rawData.measures[0].nb_ram);
        var used = parseInt(rawData.measures[0].percRAMUsed * total);
        var overcommit = rawData.measures[0].ram_allocation_ratio;

        var displayableTotal = parseFloat((Math.floor(((total/1024) * 100)) / 100).toFixed(2));
        var displayableUsed = parseFloat((Math.floor(((used/1024) * 100)) / 100).toFixed(2));

        var options = {
            slices: {
                0: {color: '#C971CC'},
                1: {color: 'silver'}
            },
            title: "RAM Capacity: " + displayableTotal + " GiB, Overcommit: " + overcommit
        };

        ramChart.data = setPieChartData(displayableUsed, displayableTotal, "GiB");
        ramChart.options = Utils.mergeOptions(pieChartOptions, options);
        ramChart.chart = new google.visualization.PieChart($('#ram-chart')[0]);
        ramChart.chart.draw(ramChart.data, ramChart.options);

    }

    function drawIpChart (rawData) {

        var ipChart = charts.ipChart;
        var total = parseInt(rawData.measures[0].ipTot);
        var used = parseInt(rawData.measures[0].ipAllocated);
        var options = {
            slices: {
                0: {color: '#CC9B5E'},
                1: {color: 'silver'}
            },
            title: "Total IPs: " + total
        };

        ipChart.data = setPieChartData(used, total, "IPs");
        ipChart.options = Utils.mergeOptions(pieChartOptions, options);
        ipChart.chart = new google.visualization.PieChart($('#ip-chart')[0]);
        ipChart.chart.draw(ipChart.data, ipChart.options);

    }

    function drawCoreChart (rawData) {

        var coreChart = charts.coreChart;
        var total = parseInt(rawData.measures[0].nb_cores);
        var used = parseInt(rawData.measures[0].nb_cores_used);
        var overcommit = rawData.measures[0].cpu_allocation_ratio;

        var options = {
            slices: {
                0: {color: '#009EFF'},
                1: {color: 'silver'}
            },
            title: "Total vCPUs: " + total + ", Overcommit: " + overcommit
        };

        coreChart.data = setPieChartData(used, total, "VCPUs");
        coreChart.options = Utils.mergeOptions(pieChartOptions, options);
        coreChart.chart = new google.visualization.PieChart($('#core-chart')[0]);
        coreChart.chart.draw(coreChart.data, coreChart.options);

    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    RegionView.prototype.build = function (rawData) {

        drawCoreChart(rawData);
        drawIpChart(rawData);
        drawRamChart(rawData);
        drawDiskChart(rawData); 

        parentResize(charts, {'heightInPixels': 1});

    };

    RegionView.prototype.resize = function (newValues) {

        parentResize(charts, newValues);

    };

    return RegionView;

})();
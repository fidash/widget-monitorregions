/* global google,Buffer,require */

var Monitoring = (function () {
    "use strict";

    var pieChartOptions = {
        pieHole: 0.4,
        width: window.innerWidth/2.1,
        height: window.innerHeight/2.3
    };

    var OAuth = require('oauth');
    var OAuth2 = OAuth.OAuth2;
    var ConsumerKey     = "2703";   // DO NOT COMMIT
    var ConsumerSecret  = "c67959c060374bfe0e683328d04fe910282fa161d649de5398151cafbeb81357a7454121f2055e10be04106f79c9eba08c6180f5b38b241042dfac552594db66";   // DO NOT COMMIT
    var username        = "bgrana@conwet.com";   // DO NOT COMMIT
    var password        = "cutrepassword78";   // DO NOT COMMIT
    var APIip  = "130.206.84.4";
    var APIport = "1028";
    var APIpath = "/monitoring/regions/";
    var IDMaddress = "https://account.lab.fiware.org/";
    var region;
    var level;

    var chartTypes = {
        "ip": drawIpChart,
        "ram": drawRamChart,
        "core": drawCoreChart,
        "disk": drawDiskChart
    };


    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function Monitoring () {

        this.charts = {
            coreChart: {},
            ramChart: {},
            diskChart: {},
            ipChart: {}
        };

        this.region = $('#id_region').val();

    }


    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function resizeCharts (newValues) {

        if ("heightInPixels" in newValues || "widthInPixels" in newValues) {
            for (var type in this.charts) {
                var current = this.charts[type];

                current.options.width = window.innerWidth/2.1;
                current.options.height = window.innerHeight/2.3;

                current.chart.draw(current.data, current.options);
            }
        }

    }

    function merge(defaultOpt, options) {

        for (var opt in defaultOpt) {
            if (!options[opt]) {
                options[opt] = defaultOpt[opt];
            }
        }

        return options;
    }

    function authenticate (oauth2) {
        oauth2.getOAuthAccessToken( '', { 'grant_type':'password', 'username': username, 'password': password }, manageCred.bind(this));
    }

    function manageCred(e, access_token, refresh_token, results){
        this.token = access_token;
        getRawData.call(this, access_token);
    }

    function getRawData (token){
        var bearer = window.btoa("ykQfjF1vILul0xiw5HeUpPzvK0stHj");
        
        var options={
            url: "http://130.206.84.4:1028/" + APIpath + this.region,
            method:"GET",
            headers: {
                'Authorization': 'Bearer ' + bearer
            },
            success: function(data){

                this.drawChart("core", data);
                this.drawChart("ip", data);
                this.drawChart("ram", data);
                this.drawChart("disk", data);

            }.bind(this)
        };

        $.ajax(options);

    }

    function setPieChartData (used, total) {

        used = used > total ? total : used;
        used = used < 0 ? 0 : used;

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Used');
        data.addColumn('number', 'Percentage');
        data.addRows([
            ['Used', used],
            ['Free', total-used]
        ]);

        return data;

    }

    function drawDiskChart (rawData) {

        var diskChart = this.charts.diskChart;
        var total = parseInt(rawData.measures[0].nb_disk);
        var used = parseInt(rawData.measures[0].percDiskUsed * total);
        var options = {
            slices: {
                0: {color: 'orange'},
                1: {color: 'silver'}
            },
            title: "Disk Usage in " + rawData.id
        };

        diskChart.data = setPieChartData(used, total);
        diskChart.options = merge(pieChartOptions, options);
        diskChart.chart = new google.visualization.PieChart($('#disk-chart')[0]);
        diskChart.chart.draw(diskChart.data, diskChart.options);

    }

    function drawRamChart (rawData) {

        var ramChart = this.charts.ramChart;
        var total = parseInt(rawData.measures[0].nb_ram);
        var used = parseInt(rawData.measures[0].percRAMUsed * total);
        var options = {
            slices: {
                0: {color: 'green'},
                1: {color: 'silver'}
            },
            title: "RAM Usage in " + rawData.id
        };

        ramChart.data = setPieChartData(used, total);
        ramChart.options = merge(pieChartOptions, options);
        ramChart.chart = new google.visualization.PieChart($('#ram-chart')[0]);
        ramChart.chart.draw(ramChart.data, ramChart.options);

    }

    function drawIpChart (rawData) {

        var ipChart = this.charts.ipChart;
        var total = parseInt(rawData.measures[0].ipTot);
        var used = parseInt(rawData.measures[0].ipAllocated);
        var options = {
            slices: {
                0: {color: 'blue'},
                1: {color: 'silver'}
            },
            title: "IP Usage in " + rawData.id
        };

        ipChart.data = setPieChartData(used, total);
        ipChart.options = merge(pieChartOptions, options);
        ipChart.chart = new google.visualization.PieChart($('#ip-chart')[0]);
        ipChart.chart.draw(ipChart.data, ipChart.options);

    }

    function drawCoreChart (rawData) {

        var coreChart = this.charts.coreChart;
        var usedCoresColor = rawData.measures[0].nb_cores < rawData.measures[0].nb_cores_used ? "red" : "silver";
        var formatedData = [
            ["Property", "value", {role: "style"}],
            ["No. Cores", rawData.measures[0].nb_cores, "black"],
            ["No. Cores enabled", rawData.measures[0].nb_cores_enabled, "yellow"],
            ["No. Cores used", rawData.measures[0].nb_cores_used, usedCoresColor]
        ];
        var data = google.visualization.arrayToDataTable(formatedData);
        
        coreChart.data = new google.visualization.DataView(data);
        coreChart.data.setColumns([0, 1, {
            calc: "stringify",
            sourceColumn: 1,
            type: "string",
            role: "annotation"
        }, 2]);
        coreChart.options = {
            title: "Core usage in " + rawData.id,
            width: window.innerWidth/3,
            height: window.innerHeight/3,
            bar: {groupWidth: "50%"},
            legend: { position: "none" },
        };
        coreChart.chart = new google.visualization.ColumnChart($("#core-chart")[0]);
        coreChart.chart.draw(coreChart.data, coreChart.options);

    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    Monitoring.prototype = {

        init: function () {

            var oauth2 = new OAuth2(ConsumerKey, ConsumerSecret, IDMaddress,  null, 'oauth2/token',  null);
            oauth2._customHeaders={Authorization: 'Basic '+ window.btoa(ConsumerKey + ":" + ConsumerSecret)};

            // Load the Visualization API and the piechart package.
            google.load("visualization", "1", {packages:["corechart"]});

            google.setOnLoadCallback(authenticate.bind(this, oauth2));

            // $('#level').change(function () {
            //     level = $(this).val() === "vms" ? "vms" : "";
            // });

            $('#auth').click(authenticate.bind(this));

            $('#id_region').change(function () {
                this.region = $('#id_region').val();

                getRawData.call(this, this.token);
            }.bind(this));

            $('#refresh').click(function () {
                getRawData.call(this, this.token);
            });

            MashupPlatform.widget.context.registerCallback(resizeCharts.bind(this));

        },

        drawChart: function (type, data) {

            chartTypes[type].call(this, data);
            
        }
    };

    return Monitoring;

})();
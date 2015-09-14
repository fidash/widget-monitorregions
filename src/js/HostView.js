/* global google,Utils,Resizable */

var HostView = (function () {
    "use strict";


    /******************************************************************/
    /*                        V A R I A B L E S                       */
    /******************************************************************/

    var types = {
        "ram": {
            data: "percRAMUsed",
            options: {
                slices: {
                    0: {color: '#C971CC'},
                    1: {color: 'silver'}
                }
            }
        },
        "disk": {
            data: "percDiskUsed",
            options: {
                slices: {
                    0: {color: '#60D868'},
                    1: {color: 'silver'}
                }
            }
        },
        "cpu": {
            data: "percCPULoad",
            options: {
                slices: {
                    0: {color: '#009EFF'},
                    1: {color: 'silver'}
                }
            }
        }
    };
    var charts;
    var parentResize;
    var defaultOpt = {
        pieHole: 0.4,
        width: window.innerWidth/2.1,
        height: (window.innerHeight/2.3) - 27,
        chartArea:{left:0,top:20,width:"100%",height:"80%"}
    };



    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function HostView () {

        charts = {};
        parentResize = Object.create(Resizable.prototype).resize;

    }


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
        var free = parseFloat((100-used).toFixed(2));

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Used');
        data.addColumn('number', 'Percentage');
        data.addColumn({type: 'string', role: 'tooltip'});
        data.addRows([
            ['Used', used, used + "% used"],
            ['Free', 100-used, free + "% free"]
        ]);

        return data;

    }

    function setData (type, rawData) {

        charts[type] = JSON.parse(JSON.stringify(types[type]));

        var host = rawData.measures[0].hostName.value;
        var templateData = types[type].data;

        charts[type].data = formatData(parseInt(rawData.measures[0][templateData].value));
        charts[type].options.title = type + " usage";
        Utils.mergeOptions(defaultOpt, charts[type].options);

    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    HostView.prototype.build = function (rawData) {

        setData('ram', rawData);
        setData('disk', rawData);
        setData('cpu', rawData);

        drawChart('ram');
        drawChart('disk');
        drawChart('cpu');

        parentResize(charts, {'heightInPixels': 1});

    };

    HostView.prototype.resize = function (newValues) {

        parentResize(charts, newValues);

    };

    return HostView;

})();
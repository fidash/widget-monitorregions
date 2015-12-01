/* global ProgressBar */

var HostView = (function () {
    "use strict";


    /******************************************************************/
    /*                        V A R I A B L E S                       */
    /******************************************************************/

    var types = {
        "ram": {
            color: "#C971CC"
        },
        "cpu": {
            color: "#009EFF"
        },
        "disk": {
            color: "#60D868"
        }
    };


    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function HostView () {}


    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function drawChart (type, data) {
        var progress = new ProgressBar.Circle("#" + type + "-host", {
            color: types[type].color,
            strokeWidth: 5,
            trailColor: "silver",
            trailWidth: 1,
            svgStyle: {
                width: "100%"
            },
            text: {
                value: "0",
                className: "",
                style: {
                    "font-size": "3.5vw",
                    transform: {
                        prefix: true,
                        value: 'translate(-50%, -61%)'
                    }
                }
            },
            step: function (state, bar) {
                bar.setText((bar.value() * 100).toFixed(0) + "%");
            }
        });

        progress.animate(data);
    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    HostView.prototype.build = function (rawData) {

        // Empty chart containers
        $(".chartContainer").empty();

        var measures = rawData.measures[0];

        drawChart('ram', measures.percRAMUsed.value/100);
        drawChart('disk', measures.percDiskUsed.value/100);
        drawChart('cpu', measures.percCPULoad.value/100);

    };

    return HostView;

})();

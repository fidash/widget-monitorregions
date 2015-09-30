/* global ProgressBar */

var RegionView = (function () {
    "use strict";

    /*****************************************************************
    *                        V A R I A B L E S                       *
    *****************************************************************/

    var types = {
        "ip": {
            color: "#CC9B5E",
        },
        "ram": {
            color: "#C971CC",
        },
        "vcpu": {
            color: "#009EFF",
        },
        "disk": {
            color: "#60D868",
        }
    };

    /****************************************************************/
    /*                    C O N S T R U C T O R                     */
    /****************************************************************/

    function RegionView () {}


    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function formatData (used, total) {
         return used/total;
    }

    function drawChart (type, data) {
        var progress = new ProgressBar.Circle("#" + type + "-chart", {
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

    RegionView.prototype.build = function (rawData) {

        // Empty chart containers
        $(".chartContainer").empty();

        var measures = rawData.measures[0];

        var vcpuData = formatData(measures.nb_cores_used, measures.nb_cores * measures.cpu_allocation_ratio);
        var ipData = formatData(measures.ipAllocated, measures.ipTot);


        drawChart("vcpu", vcpuData);
        drawChart("ram", measures.percRAMUsed);
        drawChart("disk", measures.percDiskUsed);
        drawChart("ip", ipData);

    };

    return RegionView;

})();
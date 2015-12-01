/* global ProgressBar */
var RegionView = (function () {
    "use strict";

    /*****************************************************************
    *                        V A R I A B L E S                       *
    *****************************************************************/

    var types = {
        "ip": {
            color: "#CC9B5E",
            name: "IP"
        },
        "ram": {
            color: "#C971CC",
            name: "RAM"
        },
        "vcpu": {
            color: "#009EFF",
            name: "vCPU"
        },
        "disk": {
            color: "#60D868",
            name: "Disk"
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

    function drawChart (region, type, data, show) {
        var id = region + "-" + type;
        var showC = (show) ? "" : "hide";
        $("<div></div>")
            .prop("id", id + "-container")
            .addClass(type + " flexitem measure " + showC)
            .appendTo("#" + region + "-container");

        $("<div>" +  types[type].name + "</div>")
            .addClass("measureTitle")
            .css("color", types[type].color)
            .appendTo("#" + id + "-container");

        $("<div></div>")
            .prop("id", id)
            .addClass("chartContainer")
            .appendTo("#" + id + "-container");

        var progress = new ProgressBar.Circle("#" + id, {
            color: types[type].color,
            strokeWidth: 5,
            trailColor: "silver",
            trailWidth: 1,
            svgStyle: {
                width: "100%"
            },
            text: {
                value: "0%",
                className: "",
                style: {
                    "font-size": "1.5em",
                    transform: {
                        prefix: true,
                        value: 'translate(-50%, -41%)'
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

    RegionView.prototype.build = function (region, rawData, measures_status) {

        $("<div></div>")
            .prop("id", region)
            .addClass("flexitem regionChart noselect")
            .appendTo("#regionContainer");
        $("<div>" + region + "</div>")
            .addClass("regionTitle")
            .appendTo("#" + region);
        $("<div></div>")
            .prop("id", region + "-container")
            .addClass("flexbox measures-container")
            .appendTo("#" + region);

        // Empty chart containers
        // $(".chartContainer").empty();

        var measures = rawData.measures[0];
        var vcpuData = formatData(measures.nb_cores_used, measures.nb_cores * measures.cpu_allocation_ratio);
        var ipData = formatData(measures.ipAllocated, measures.ipTot);

        drawChart(region, "vcpu", vcpuData, measures_status.vcpu);
        drawChart(region, "ram", measures.percRAMUsed, measures_status.ram);
        drawChart(region, "disk", measures.percDiskUsed, measures_status.disk);
        drawChart(region, "ip", ipData, measures_status.ip);


        $("#" + region).data("vcpu", vcpuData);
        $("#" + region).data("ram", measures.percRAMUsed);
        $("#" + region).data("disk", measures.percDiskUsed);
        $("#" + region).data("ip", ipData);
    };

    return RegionView;

})();

/* global ProgressBar, filesize */
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
         return used / total;
    }

    function drawChart (region, type, data, tooltip, show) {
        var id = region + "-" + type;
        var showC = (show) ? "" : "myhide";
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
            .appendTo("#" + id + "-container")
            .prop("title", tooltip)
            .tooltipster();

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

        /* FAKE DATA */
        // vcpuData = fakeData[region].vcpu;
        // measures.percRAMUsed = fakeData[region].ram;
        // measures.percDiskUsed = fakeData[region].disk;
        // ipData = fakeData[region].ip;

        drawChart(region,
                  "vcpu",
                  vcpuData,
                  measures.nb_cores_used + " vCores used out of " + (measures.nb_cores * measures.cpu_allocation_ratio),
                  measures_status.vcpu);

        drawChart(region,
                  "ram",
                  measures.percRAMUsed,
                  filesize(measures.percRAMUsed * measures.nb_ram * 1e6) + " RAM used out of " + filesize(measures.nb_ram * measures.ram_allocation_ratio * 1e6),
                  measures_status.ram);

        drawChart(region,
                  "disk",
                  measures.percDiskUsed,
                  filesize(measures.percDiskUsed * measures.nb_disk * 1e9) + " Disk used out of " + filesize(measures.nb_disk * 1e9),
                  measures_status.disk);

        drawChart(region,
                  "ip",
                  ipData,
                  measures.ipAllocated + " IPs allocated out of " + measures.ipTot + " total (" + measures.ipAssigned + " assigned)",
                  measures_status.ip);

        return {
            region: region,
            data: {
                vcpu: vcpuData,
                ram: measures.percRAMUsed,
                disk: measures.percDiskUsed,
                ip: ipData
            }
        };
    };

    return RegionView;
})();

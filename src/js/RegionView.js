/* global ProgressBar */
var RegionView = (function () {
    "use strict";

    /*****************************************************************
    *                        V A R I A B L E S                       *
    *****************************************************************/

    var fakeData = {
        Budapest2: {
            vcpu: 0.2,
            ram: 0.3,
            disk: 0.4,
            ip: 0.5
        },
        Crete: {
            vcpu: 0.3,
            ram: 0.2,
            disk: 0.5,
            ip: 0.1
        },
        Gent: {
            vcpu: 0.1,
            ram: 0.5,
            disk: 0.2,
            ip: 0.3
        },
        Karlskrona2: {
            vcpu: 0.8,
            ram: 0.7,
            disk: 0.9,
            ip: 0.78
        },
        Lannion2: {
            vcpu: 0.1,
            ram: 0.18,
            disk: 0.09,
            ip: 0.1
        },
        PiraeusN: {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        },
        PiraeusU: {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        },
        Poznan: {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        },
        Prague: {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        },
        SaoPaulo: {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        },
        SophiaAntipolis: {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        },
        Spain2: {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        },
        Trento: {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        },
        Volos: {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        },
        Zurich: {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        }
    };

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

        /* FAKE DATA */
        vcpuData = fakeData[region].vcpu;
        measures.percRAMUsed = fakeData[region].ram;
        measures.percDiskUsed = fakeData[region].disk;
        ipData = fakeData[region].ip;

        drawChart(region, "vcpu", vcpuData, measures_status.vcpu);
        drawChart(region, "ram", measures.percRAMUsed, measures_status.ram);
        drawChart(region, "disk", measures.percDiskUsed, measures_status.disk);
        drawChart(region, "ip", ipData, measures_status.ip);

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

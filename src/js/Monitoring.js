/* global google,require,RegionView,FIDASHRequests */
var Monitoring = (function () {
    "use strict";

    /***  AUTHENTICATION VARIABLES  ***/
    var url = "http://130.206.84.4:1028/monitoring/regions/";

    var createDefaultRegion = function createDefaultRegion(region) {
        var randomN = function randomN() {
            return (Math.random() * 100).toString();
        };

        var IPsTot = Math.floor(Math.random() * 100);
        var IPsAll = Math.floor(Math.random() * IPsTot);
        var IPsAss = Math.floor(Math.random() * IPsAll);

        return {
            "_links": {
                "self": { "href": "/monitoring/regions/" + region },
                "hosts": { "href": "/monitoring/regions/" + region + "/hosts" }
            },
            "id": region,
            "name": region,
            "country": "None",
            "latitude": "xyz",
            "longitude": "xyz",
            "measures": [
                {
                    "timestamp" : "2013-12-20T12.00",
                    "ipAssigned": IPsAss.toString(),
                    "ipAllocated": IPsAll.toString(),
                    "ipTot": IPsTot.toString(),
                    "nb_cores": "100",
                    "nb_cores_used": "80",
                    "nb_ram": "100000",
                    "nb_disk": "1000000",
                    "nb_vm": "10000000",
                    "power_consumption": "123",
                    "percCPULoad": randomN(),
                    "percRAMUsed": randomN() / 100,
                    "percDiskUsed": randomN() / 100,
                    "ram_allocation_ratio": "1.5",
                    "cpu_allocation_ratio": "16.0"
                }
            ]
        };
    };

    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function Monitoring () {
        this.regions = [];

        this.hostId = $('#host').val();
        this.options = {
            orderby: "",
            orderinc: "",
            data: {}
        };

        this.measures_status = {
            vcpu: true,
            ram: true,
            disk: true,
            ip: true
        };

        this.minvalues = {
            vcpu: 0,
            ram: 0,
            disk: 0,
            ip: 0
        };

        this.variables = {
            regionSelected: MashupPlatform.widget.getVariable("regionSelected"),
            vcpuOn: MashupPlatform.widget.getVariable("vcpuOn"),
            ramOn: MashupPlatform.widget.getVariable("ramOn"),
            diskOn: MashupPlatform.widget.getVariable("diskOn"),
            ipOn: MashupPlatform.widget.getVariable("ipOn"),
            sort: MashupPlatform.widget.getVariable("sort")
        };

        handleVariables.call(this);
    }

    /******************************************************************
    *                P R I V A T E   F U N C T I O N S               *
    ******************************************************************/

    function drawRegions(regions) {
        // $("#regionContainer").empty();
        // diff and only get news, and remove/hide unselected?
        if (regions.length > this.last_regions.length) {
            // add
            diffArrays(regions, this.last_regions)
                .forEach(drawRegion.bind(this));
        } else if (regions.length < this.last_regions.length) {
            // remove
            diffArrays(this.last_regions, regions)
                .forEach(removeRegion.bind(this));
        }
        // regions.forEach(drawRegion.bind(this));
        this.variables.regionSelected.set(regions.join(","));
        this.last_regions = regions;
    }

    function removeRegion(region) {
        $("#" + region).remove();
    }

    function drawRegion(region) {
        FIDASHRequests.get(url + region, function(err, data) {
            if (err) {
                window.console.log(err);
                // The API seems down
                var rdata2 = new RegionView().build(region, createDefaultRegion(region), this.measures_status);
                this.options.data[rdata2.region] = rdata2.data;
                sortRegions.call(this);
                return;
            }
            var rdata = new RegionView().build(region, data, this.measures_status);
            this.options.data[rdata.region] = rdata.data;
            sortRegions.call(this);
        }.bind(this));
    }

    function fillRegionSelector (regions) {
        regions.forEach(function (region) {
            $("<option>")
                .val(region)
                .text(region)
                .appendTo($("#region_selector"));
        });
        $("#region_selector")
            .prop("disabled", false);
        $("#region_selector").selectpicker({title: "Choose Region"});
        $("#region_selector").selectpicker("refresh");
    }

    function diffArrays(a, b) {
        return a.filter(function(i) {return b.indexOf(i) < 0;});
    }

    function mergeUnique(a, b) {
        return a.concat(b.filter(function (item) {
            return a.indexOf(item) < 0;
        }));
    }

    function getAllOptions() {
        return $('#region_selector option').map(function (x, y) {
            return $(y).text();
        }).toArray();
    }

    function filterNotRegion(regions) {
        var ops = getAllOptions();
        return regions.filter(function (i) {
            return ops.indexOf(i) >= 0;
        });
    }

    function setEvents () {
        $('#region_selector').change(function () {
            this.regions = $('#region_selector').val() || [];
            this.hostId = $('#host').val();
            this.last_regions = this.last_regions || [];
            drawRegions.call(this, this.regions);
        }.bind(this));

        $("input[type='checkbox']").on("switchChange.bootstrapSwitch", function (e, data) {
            var type = e.target.dataset.onText;
            type = type.toLowerCase();

            var newst = !this.measures_status[type];
            this.measures_status[type] = newst;
            this.variables[type+"On"].set(newst.toString());
            if (newst) {
                // $("." + type).removeClass("hide");
                $("." + type).removeClass("myhide");
            } else {
                // $("." + type).addClass("hide");
                $("." + type).addClass("myhide");
            }
            // $("." + type).toggleClass("hide");
        }.bind(this));

        $(".sort").on("click", function (e, data) {
            var rawid = "#" + e.target.id;
            var id = e.target.id.replace(/sort$/, '');
            var rawmode = e.target.classList[3];
            var mode = rawmode.replace(/^fa-/, "");
            var oid = this.options.orderby;
            var orawid = "#" + oid + "sort";
            var newmode = "";
            if (id === oid) {
                if (mode === "sort") {
                    newmode = "sort-desc";
                    $(rawid).removeClass("fa-sort").addClass("fa-sort-desc");
                } else if (mode === "sort-desc") {
                    newmode = "sort-asc";
                    $(rawid).removeClass("fa-sort-desc").addClass("fa-sort-asc");
                } else {
                    newmode = "sort-desc";
                    $(rawid).removeClass("fa-sort-asc").addClass("fa-sort-desc");
                }
            } else {
                newmode = "sort-desc";
                if (oid !== "") {
                    var oldclass = $(orawid).attr("class").split(/\s+/)[3];
                    $(orawid).removeClass(oldclass).addClass("fa-sort");
                }
                $(rawid).removeClass(rawmode).addClass("fa-sort-desc");
            }
            this.options.orderby = id;
            this.options.orderinc = newmode;
            this.variables.sort.set(id + "//" + newmode);
            sortRegions.call(this);
        }.bind(this));
    }

    function sortRegions() {
        var by = this.options.orderby;
        var inc = this.options.orderinc;
        var data = this.options.data;
        if (inc === "") {
            return;
        }
        $(".regionChart").sort(function (a, b) {
            var dataA = data[a.id],
                dataB = data[b.id];
            if (!dataA || !dataB) {
                return 0;
            }
            var itemA = dataA[by],
                itemB = dataB[by];
            if (inc === "sort-asc") {
                // return itemA > itemB;
                return parseFloat(itemA) - parseFloat(itemB);
            }
            return parseFloat(itemB) - parseFloat(itemA);
            // return itemB > itemA;
        }).appendTo("#regionContainer");
    }

    function calcMinHeight() {
        var minH = 9999;
        $(".regionChart").forEach(function(v) {
            if (v.height() < minH) {
                minH = v.height();
            }
        });
    }

    function getRegionsMonitoring() {
        FIDASHRequests.get(url, function(err, data) {
            if (err) {
                window.console.log(err);
                // The API are down
                fillRegionSelector(["Spain2", "Trento", "Berlin2"].sort());
                selectSavedRegions.call(this);
                this.regions = $("#region_selector").val() || [];
                return;
            }
            var regions = [];

            data._embedded.regions.forEach(function (region) {
                regions.push(region.id);
            });

            fillRegionSelector(regions.sort());
            selectSavedRegions.call(this);
            this.regions = $("#region_selector").val() || [];
        }.bind(this));
    }

    function receiveRegions(regionsRaw) {
        var regions = JSON.parse(regionsRaw);
        // Check it's a list
        var newRegions = filterNotRegion(regions);
        // Set in selector
        $("#region_selector").selectpicker("val", newRegions);

        this.regions = newRegions;
        this.last_regions = []; // Reset regions! :)
        // Empty before override
        $("#regionContainer").empty();
        drawRegions.call(this, this.regions);
    }

    function handleSwitchVariable(name) {
        if (this.variables[name + "On"].get() === "") {
            this.variables[name + "On"].set("true");
        } else if (this.variables[name + "On"].get() !== "true") {
            this.measures_status[name] = false;
            $("." + name).addClass("myhide");
            $("#" + name + "Switch input[name='select-charts-region']").bootstrapSwitch("state", false, true);
        }
    }

    function selectSavedRegions() {
        // Get regions
        var regionsS = this.variables.regionSelected.get();
        var regions = regionsS.split(",");
        receiveRegions.call(this, JSON.stringify(regions));
    }

    function handleVariables(arg) {
        handleSwitchVariable.call(this, "vcpu");
        handleSwitchVariable.call(this, "ram");
        handleSwitchVariable.call(this, "disk");
        handleSwitchVariable.call(this, "ip");

        var sort = this.variables.sort.get();
        var matchS = sort.match(/^(.+)\/\/(.+)$/);
        if (sort && matchS) {
            $("#" + matchS[1] + "sort").addClass("fa-" + matchS[2]);
            this.options.orderby = matchS[1];
            this.options.orderinc = matchS[2];
            sortRegions.call(this);
        }
    }

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/


    Monitoring.prototype = {
        init: function () {
            getRegionsMonitoring.call(this);

            setEvents.call(this);

            // Initialize switchs
            $("[name='select-charts-region']").bootstrapSwitch();

            MashupPlatform.wiring.registerCallback("regions", receiveRegions.bind(this));
        }
    };

    return Monitoring;

})();

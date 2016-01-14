/* global google,require,RegionView,HostView,Utils */
var Monitoring = (function () {
    "use strict";

    /***  AUTHENTICATION VARIABLES  ***/
    var url = "http://130.206.84.4:1028/monitoring/regions/";

    var views = {
        'region': RegionView,
        'host': HostView
    };

    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function Monitoring () {
        this.view   = "region";
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
        this.last_regions = regions;
    }

    function removeRegion(region) {
        $("#" + region).remove();
    }

    function drawRegion(region) {
        var host = this.view === "host" ? "/vms/" + this.hostId : "";
        getWithAuth(url + region + host, function(data) {
            // setPlaceholder(false);
            var view = new views[this.view]();
            var rdata = view.build(region, data, this.measures_status);
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

    function setView (view) {
        switch (view) {
            case "host":
            $(".input-group").removeClass("hide");
                break;

            case "region":
                $(".input-group").addClass("hide");
                break;
        }

        if (view !== this.view) {
            $('#region-view').toggleClass('hide');
            $('#host-view').toggleClass('hide');
        }

        this.view = view;
        this.hostId = $('#host').val();
    }

    function diffArrays(a, b) {
        return a.filter(function(i) {return b.indexOf(i) < 0;});
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

    // function setPlaceholder (show) {

    //     var placeholder = $("#host-placeholder");
    //     var body = $("body");

    //     if (show) {
    //         placeholder.removeClass("hide");
    //         body.addClass("placeholder-bg");
    //     }
    //     else {
    //         placeholder.addClass("hide");
    //         body.removeClass("placeholder-bg");
    //     }
    // }

    function getWithAuth(url, callback, callbackerror) {
        callbackerror = callbackerror || function() {};
        if (MashupPlatform.context.get('fiware_token_available')) {
            MashupPlatform.http.makeRequest(url, {
                method: 'GET',
                requestHeaders: {
                    "X-FI-WARE-OAuth-Token": "true",
                    "X-FI-WARE-OAuth-Header-Name": "X-Auth-Token"
                },
                onSuccess: function(response) {
                    var data = JSON.parse(response.responseText);
                    callback(data);
                },
                onError: function(response) {
                    callbackerror(response);
                }
            });
        } else {
            MashupPlatform.widget.log("No fiware token available");
        }
    }

    function getRegionsMonitoring() {
        getWithAuth(url, function(data) {
            var regions = [];

            data._embedded.regions.forEach(function (region) {
                regions.push(region.id);
            });

            fillRegionSelector(regions.sort());
            this.regions = $("#region_selector").val() || [];
            // getRawData.call(this);
        }.bind(this), window.console.log);
    }

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    Monitoring.prototype = {
        init: function () {
            // Load the Visualization API and the piechart package.
            google.load("visualization", "1", {packages:["corechart"]});
            google.setOnLoadCallback(getRegionsMonitoring.bind(this));

            setEvents.call(this);

            // Initialize switchs
            $("[name='select-charts-region']").bootstrapSwitch();
            $("[name='select-charts-host']").bootstrapSwitch();
        }
    };

    return Monitoring;

})();

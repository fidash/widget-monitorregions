var Resizable  = (function () {
    "use strict";

    var MIN_WIDTH = 543;
    var MIN_HEIGHT = 382;

    function Resizable () {}

    Resizable.prototype.resize = function (charts, newValues) {

        if (window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT) {
            return;
        }

        if ("heightInPixels" in newValues || "widthInPixels" in newValues) {
            for (var type in charts) {
                var current = charts[type];

                current.options.width = window.innerWidth/2.1;
                current.options.height = (window.innerHeight/2.3) - 27;

                current.chart.draw(current.data, current.options);
            }
        }
    };

    return Resizable;
})();
var Utils = (function () {
    "use strict";

    function resizeCharts (charts, newValues) {

        if ("heightInPixels" in newValues || "widthInPixels" in newValues) {
            for (var type in charts) {
                var current = charts[type];

                current.options.width = window.innerWidth/2.1;
                current.options.height = window.innerHeight/2.3;

                current.chart.draw(current.data, current.options);
            }
        }

    }

    function mergeOptions (defaultOpt, options) {

        for (var opt in defaultOpt) {
            if (!options[opt]) {
                options[opt] = defaultOpt[opt];
            }
        }

        return options;
    }

    return {
        resizeCharts: resizeCharts,
        mergeOptions: mergeOptions
    };

})();
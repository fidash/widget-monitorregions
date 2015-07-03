var Utils = (function () {
    "use strict";

    function mergeOptions (defaultOpt, options) {

        for (var opt in defaultOpt) {
            if (!options[opt]) {
                options[opt] = defaultOpt[opt];
            }
        }

        return options;
    }

    return {
        mergeOptions: mergeOptions
    };

})();
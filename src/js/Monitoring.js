(function () {
    "use-strict";

    var DEFAULT_OPTIONS = {
        pieHole: 0.4,
        slices: {
            0: { color: 'green' },
            1: { color: 'black' }
        }
    };

    var OAuth2 = OAuth.OAuth2;
    var ConsumerKey = ""; // DO NOT COMMIT
    var ConsumerSecret =  ""; // DO NOT COMMIT
    var username =  ""; // DO NOT COMMIT
    var password =  ""; // DO NOT COMMIT
    var APIip  = "130.206.84.4";
    var APIport = "1028";
    var APIpath = "/monitoring/regions/";
    var IDMaddress = "https://account.lab.fiware.org/";
    var region;
    var level;


    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function Monitoring (options) {
        this.data = new google.visualization.DataTable();;
        this.options = merge(options);
    }


    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/

    function merge(options) {

        for (var opt in DEFAULT_OPTIONS) {
            if (!options[opt]) {
                options.push(DEFAULT_OPTIONS[opt]);
            }
        }

        return options;
    }

    function authenticate () {
        oauth2.getOAuthAccessToken( '', { 'grant_type':'password', 'username': username, 'password': password }, manageCred.bind(this));
    }

    function manageCred(e, access_token, refresh_token, results){
      getData.call(this, access_token);
    }

    function getData (token){
        var bearer=new Buffer(token).toString("base64");
        var options={
            hostname:APIip,
            port:APIport,
            path:APIpath + this.region,
            method:"GET",
            headers:{'Authorization':'Bearer '+bearer}
        };

        http.get(options,function(res2){
            
            res2.setEncoding('utf8');
            res2.on('data',function(data){
                this.data.push(data);
            }.bind(this));
            
            this.drawChart('PieChart');
        }.bind(this));
    }

    function transformData (rawData) {

    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    Monitoring.prototype = {

        init: function () {

            oauth2 = new OAuth2(ConsumerKey, ConsumerSecret, IDMaddress,  null, 'oauth2/token',  null);
            oauth2._customHeaders={Authorization: 'Basic '+new Buffer(ConsumerKey+":"+ConsumerSecret).toString('base64')}

            authenticate.call(this);

            $('#level').change(function () {
                level = $(this).val() === "vms" ? "vms" : "";
            });

            $('#auth').click(authenticate.bind(this));

            $('id_region').change(function () {
                region = $(this).val();
            });
        },

        drawChart: function (chartType) {

            used = used > total ? total : used;
            used = used < 0 ? 0 : used;

            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Used');
            data.addColumn('number', 'Percentage')
            data.addRows([
                ['Used', parseInt(used)],
                ['Free', total-used]
            ]);

            var chart = new google.visualization[chartType]($('#chart-div'));
            chart.draw(this.data, this.options);
        }
    };

    return Monitoring;

})();
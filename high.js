Highcharts.ajax({
        url: "datacovid.csv",
        dataType: "csv",
        success: function(csv) {


            var data = [],countries = [], mapch;
            csv = csv.split(/\n/);
            xaxis = csv[0].split(',').slice(1).map(Number);
            csv.slice(1).forEach(element => {
                element = element.split(',');
                code = getCountryCode(element[0]).toLowerCase();
                datatotal = element.slice(1).map(Number);
                var dataperday = [],change = [];
                var temp = 0;
                datatotal.forEach(
                    function(i){
                        dataperday.push(i-temp);
                        temp = i;
                    }
                )
                temp = dataperday[0]
                dataperday.forEach(
                    function(i){
                        var ch 
                        if(temp!=0)
                        {
                            ch = parseInt((i-temp)/temp*100);
                        }
                        else{
                            ch = Infinity;
                        }
                        temp = i;
                        change.push(ch)
                    }
                )
                //console.log(element[0]);
                //console.log(change);
                data.push([
                    code,
                    element[element.length - 1]
                ])
                countries.push({
                    code : code,
                    data: dataperday,
                    change: change,
                    total: element[element.length - 1]
                })
            });
            
            // console.log(countries.find(function (element){
            //     return element['code'] === 'ae';
            // }));

            // console.log(data);

            mapch = Highcharts.mapChart('container', {
                chart: {
                    map: 'custom/world-robinson'
                },
                title: {
                    text: 'COVID 19 Cases by Country'
                },
                subtitle: {
                    text: "Click on the specific country to get the detailed statistics"
                },
        
                mapNavigation: {
                    enabled: true,
                    buttonOptions: {
                        verticalAlign: 'top'
                    }
                },
        
                colorAxis: {
                    min: 0,
                    max: 1000000,
                    type: 'line',
                    minColor: '#afecff',
                    maxColor: '#950041',
                },

                series: [{
                    data: data,
                    name: 'Total cases till now',
                    allowPointSelect: true,
                    cursor: 'pointer',
                    states: {
                        hover: {
                            color: '#FF5733',
                            borderColor: '#44a32',
                            dashStyle: 'shortlines'
                        },
                        select: {
                            color: '#EBF021',
                            borderColor: '#44a32',
                            dashStyle: 'shortlines'
                        }
                    },
                    borderWidth: 1
                }]
            });

            

            var selectedChart;

            Highcharts.wrap(Highcharts.Point.prototype, 'select', function (proceed) {
                proceed.apply(this, Array.prototype.slice.call(arguments, 1));
                points = mapch.getSelectedPoints();
                // console.log(countries.find((element)=>{
                //     return element['code'] === points[1]['hc-key'];
                // }));
                if(!selectedChart)
                selectedChart = Highcharts.chart('chart', {
                    chart: {
                        type: 'line',
                        width:900,
                        height:400,
                    },
                    tooltip:{
                        formatter: function(){
                            temp = xaxis[this.x];
                            day = temp%100;
                            month = (temp - day)/100;
                            change = countries.find((element)=>{
                                return element['code'] === points[0]['hc-key'];
                            })['change'][this.x];
                            return "<em>"+this['series']['name']+"</em>"+"<br>date:"+month + "-" + day+"<br>cases:"+this.y+"<br>change:"+change+"%";
                        }
                    },
                    title: {
                        text: null
                    },
                    xAxis: {
                        title: {
                            text: 'Month-Day'
                        },
                        legend: {
                            enabled: true
                          },
                        labels :{
                            formatter: function() {
                                temp = xaxis[this.value];
                                day = temp%100;
                                month = (temp - day)/100;
                                return month + "-" + day;
                            }
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'No. of Cases'
                        },
                    },
                    series: [{
                        name: null,
                        data: null
                    }]
                });
                selectedChart.series.slice(0).forEach(function (s) {
                    s.remove(false);
                });
                selectedChart.setTitle({
                    text: points[0].name
                })
                selectedChart.setSubtitle({
                    text: 'Total cases: ' + countries.find((element)=>{
                        return element['code'] === points[0]['hc-key'];
                    })['total']
                })
                selectedChart.addSeries({
                    data:   countries.find((element)=>{
                                return element['code'] === points[0]['hc-key'];
                            })['data'],
                    name:   points[0].name,
                })
                selectedChart.redraw();
            });

        }


        
});
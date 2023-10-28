




// pipeline failure causes
var causes = ['CORROSION', 'EQUIPMENT FAILURE', 'EXCAVATION DAMAGE',
    'INCORRECT OPERATION', 'MATERIAL FAILURE (PIPE/WELD)',
    'NATURAL FORCE DAMAGE', 'OTHER OUTSIDE FORCE DAMAGE', 'OTHER'];
// color palette = one color per subgroup
var color = d3.scaleOrdinal()
      .domain(causes) //
      .range(["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"])  
// var causeElement;

// set the dimensions and margins of the graph
var margin = {top: -70, right: 60, bottom: 0, left: 30};
    height = 350 - margin.top - margin.bottom,
    width = 550 - margin.left - margin.right;

tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    
// append the svg object to the body of the page
var svgM = d3.select("#map").append("svg")
        .attr("height", height-120)
        .attr("width", width + margin.left + margin.right)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var projection = d3.geoAlbersUsa()
    .translate( [width/2, height/2] )
    .scale(620)

var path = d3.geoPath()
    .projection(projection)

var slider = d3.select("#slider").append("input")
    .attr("id", "slide")
    .attr("type", "range")
    .attr("min", 1986)
    .attr("max", 2021)
    .attr("step", 1)
    .attr("class", "custom-slider")



// function to display the map
function run_map(map_data, element) {
    map_data = map_data.flat();
    // element = cause
    // d3.selectAll("#slide").remove()


    // lodaing us json data
    d3.json("static/data/us.json", function(data) {
        // loading MAP.csv
        if (element != null) {
            map_data = map_data.filter(function(row) {
                return row['CAUSE'] == element;
            })
        }
        mapdata_backup = map_data;

        // loading fips for states
        d3.csv("static/data/state_fips_master.csv", function(fips_data) {
                          
            var states = topojson.feature(data, data.objects.states).features
            var stateShapes = svgM.selectAll(".state")
                .data(states)
                .enter().append("path")
                .attr("class", "state")
                .attr("d", path)
    
            stateShapes
                .on("mouseover", function(d) {
                    tooltip.transition()
                    .duration(250)
                    .style("opacity", 1);
                    const arr = fips_data.find(o => o.fips == d.id);
                    tooltip.html(
                    "<p><strong>" + arr.state_name + "</strong></p>"
                    )
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                    .duration(250)
                    .style("opacity", 0);
            });
    
            function update(year) {
                    
                    // removing already plotted points
                    d3.selectAll("#points").remove();
                    // updating year on slider
                    d3.select(".year").text(year);
                    // plotting points if no cause is selected
                    if (year == null) {
                        draw_points(map_data, element, "yes");
                    }
                    else {
                        // plotting points if cause is selected
                        // - selecting data matching the year selected with the slider
                        const years = [1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 
                            1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
                            2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];
                        if (years.includes(parseInt(year))) {
                            var o = groupBy(map_data, 'YEAR');
                        }
                        draw_points(o[year], element, "no");
                    }

            }

            slider
            .on("input", function() {
                var year = this.value;
                update(year);
            })


            update(null);     
          
        })
    })
    
}

// function to plot points on the map
// data = dataset of points, element = pipeline failure cause
function draw_points(data, element, yes_no) {
    var remember;
    svgM.selectAll(".MAP")
        .data(data)
        .enter().append("circle")
        .attr("id", "points")
        .attr("class", "MAP")
        .attr("r", function(d) {
            if (element != null)
                return 3
            else
                return 2
        })
        .attr("cx", function(d,i) {
            var coords = projection( [d.LONG, d.LAT])
            if (coords != null)
                return coords[0]
        })
        .attr("cy", function(d) {
            var coords = projection( [d.LONG, d.LAT])
            if (coords != null)
                return coords[1]
        })
        .attr("opacity", function(d) {
            if (yes_no == "yes")
                return "0.4"
            else
                return "1"
        })
        .style("fill", function(d) {
            if(element != null)
                return color(element)
            else {
                remember = "yes"
                return "#DCDCDC"
            }
        })
        .attr('stroke', function(d) {
            if (remember != "yes")
                return "white"
        })
        .attr('stroke-width', 0.05)
}

// after calling method .flat() on the data, this function enables me to do the opposite
// i.e. group the data by a certain year
function groupBy(arr, property) {
    return arr.reduce(function(memo, x) {
      if (!memo[x[property]]) { memo[x[property]] = []; }
      memo[x[property]].push(x);
      return memo;
    }, {});
}
  



// simple spinner transition
setTimeout(function(){
    $('.lds-default').css({'opacity':'0'})
}, 1200);
// simple button transition
setTimeout(function(){
    $('.buttons').css({'opacity':'1'})
}, 2000);
// simple legend transition
setTimeout(function(){
    $('.custom-legend').css({'opacity':'1'})
}, 2000);
// simple map transition
setTimeout(function(){
    $('.for_transition').css({'opacity':'1'})
}, 2000);

// tooltip for map text
function showTooltip(evt, text) {
    let tooltip = document.getElementById("q");
    tooltip.innerHTML = text;
    tooltip.style.display = "block";
    tooltip.style.left = evt.pageX + 20 + 'px';
  } 
  function hideTooltip() {
    var tooltip = document.getElementById("q");
    tooltip.style.display = "none";
  }

// keeping array of maximum range for y axis, obtained from python
var maxValues = { 0: 1043348526, 1: 1853, 2: 205524, 3: 58996 } 
// declaring some variables for later use
var u;
var causesReal = ["CORROSION","EQUIPMENT FAILURE","EXCAVATION DAMAGE",
    "INCORRECT OPERATION","MATERIAL FAILURE (PIPE/WELD)",
    "NATURAL FORCE DAMAGE","OTHER OUTSIDE FORCE DAMAGE","OTHER"]

// set the dimensions and margins of the graph
var margin = {top: 10, right: 5, bottom: 20, left: 80},
    width = window.innerWidth - 110,
    height = 325 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#bar_chart")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Initialize the X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .padding(0.2);
var xAxis = svg.append("g")
  .attr("transform", "translate(0," + height + ")")  

// Initialize the Y axis
var y = d3.scaleLog()
  .range([ height, 0]);
var yAxis = svg.append("g")
    //.attr("class", "myYaxis")

// append the svg object to the body of the page
var svgL = d3.select("#bar_chart")
.append("svg")
  .attr("width", window.innerWidth )
  .attr("height", 20)
  .attr("class", "custom-legend")
.append("g")
  .attr("transform",
        "translate(" + 0 + "," + margin.top + ")");

// function to get the data and draw bar chart
function run_bar_chart(dataset, element) {


    if (u != null) {
        d3.selectAll("#barid").remove()
        d3.selectAll("#legend").remove()
    }
    // csv = name of data
    csv = dataset;
    var maxVal = maxValues[element];
    const causes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    var years = d3.map(csv, function(d){return(d.YEAR)}).keys();
    // x axis dynamic change
    x.domain(years)
    xAxis.transition().duration(2000).call(d3.axisBottom(x).tickSize(0))    
    // y axis dynamic change
    y.base(2).domain([0.1, maxVal]);
    yAxis.transition().duration(2000).call(d3.axisLeft(y));

    var xSubgroup = d3.scaleBand()
        .domain(causes)
        .range([0, x.bandwidth()])
        .padding([0.05])

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(causes) 
        .range(["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"])

    var dataL = 0;
    var offset = 160;

    // creating legend
    var legendL = svgL.selectAll('g')
        .data(causesReal)
        .enter().append('g')
        .attr("class", "legends")
        .attr("id", "legend")
        .attr("transform", function (d, i) {
        if (i === 0) {
            dataL = d.length + offset 
            return "translate(0,0)"
        } else { 
        var newdataL = dataL
        dataL +=  d.length + offset
        return "translate(" + (newdataL) + ",0)"
        }

    })
    legendL.append('rect')
        .attr("x", 110)
        .attr("y", -5)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function (d, i) {
        return color(i);
        })
    legendL.append('text')
        .attr("x", 125)
        .attr("y", 4)
        //.attr("dy", ".35em")
        .text(function (d, i) {
            return d
        })
        .attr("class", "textselected")
        .style("text-anchor", "start")
        .style("font-size", 11)
        .on("click", function(d,i) {
            causeReturn = update_bars(i, d);
            latest_cause = causeReturn;
            activate_map_sequence(causeReturn);
        })

    // drawing bars
    u = svg.append("g").selectAll("g")
        .data(csv)
    u
        .enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + x(d.YEAR) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return causes.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
        .attr("class", "bar")
        .attr("id", "barid")
        .attr("x", function(d) { return xSubgroup(d.key); })
        .attr("y", height)
        .transition()
        .duration(2000)
        .ease(d3.easeExp)
        .attr("y", function(d) {
            if ( y(d.value)  != Infinity )
            return y(d.value); 
        })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function(d) { 
            if ( (height - y(d.value) ) != -Infinity)
            return height - y(d.value); 
        })
        .attr("fill", function(d) { return color(d.key); })

    // function to update bars on click of legend
    function update_bars(val, causeRet) {
    d3.selectAll("#barid").remove();
      // drawing bars
        u = svg.append("g").selectAll("g")
            .data(csv)     
        u
            .enter()
            .append("g")
            .attr("transform", function(d) { return "translate(" + x(d.YEAR) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { 
                return causes.map(function(key) { 
                return {key: key, value: d[key]}; }); })
            .enter().append("rect")
            .attr("class", "bar")
            .attr("id", "barid")
            .attr("x", function(d) { return xSubgroup(d.key); })
            .attr("y", function(d) { 
                if ( y(d.value)  != Infinity )
                    return y(d.value); 
            })
            .attr("width", xSubgroup.bandwidth())
            .attr("height", function(d) {
                if ( (height - y(d.value) ) != -Infinity)
                    return height - y(d.value);  
            })
            .attr("fill", function(d) { return color(d.key); })
            .transition()
            .duration(1000)
            .style("opacity", function(d,i) { 
                if(i == val) 
                    return 1; 
                else
                    return 0.3;
            })

        return causeRet;           
    }
}

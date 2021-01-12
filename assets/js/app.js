// @TODO: YOUR CODE HERE!
var svgWidth = 1000;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create SVG Wrapper
var svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Append SVG group
var chartGroup = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-axis variable upon clicking on Axis Label
function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
                        .domain([d3.min(data, d => d[chosenXAxis]) * 0.9, 
                        d3.max(data, d => d[chosenXAxis]) * 1.1])
                        .range([0, width]);
    return xLinearScale;
};

// function used for updating y-axis variable upon clicking on Axis label
function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
                        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
                        d3.max(data, d => d[chosenYAxis]) * 1.1])
                        .range([height, 0]);
    
    return yLinearScale;
};

// function used for updating xAxis upon clicking on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
};

// function used for updating yAxis upon clicking on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
};

// function for updating circles with transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
};

// function for updating positions of state abbreviation text
function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]) + 5);
    
    return textGroup;
};

// function for updating circles with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xlabel;
    var ylabel;

    if (chosenXAxis === "poverty") {
        xlabel = "Poverty"
    }
    else if (chosenXAxis === "age") {
        xlabel = "Median Age"
    }
    else {
        xlabel = "Household Income"
    };

    if (chosenYAxis === "obesity") {
        ylabel = "Obesity"
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "Smokes"
    }
    else {
        ylabel = "Lacks Healthcare"
    };

    var toolTip = d3.tip()
                    .attr("class", "d3-tip")
                    .html(function(d) {
                        return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`)
                    });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
        d3.select(this).style("stroke", "black");
    }).on("mouseout", function(data, index) {
        toolTip.hide(data, this);
        d3.select(this).style("stroke", "none");
    });
    
    return circlesGroup;
};

d3.csv('assets/data/data.csv').then((newsData, err) => {
    if (err) throw err;

    console.log(newsData);

    // parse data 
    newsData.forEach((data) => {
        data.id = +data.id;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // use xScale and yScale functions to create default chart
    var xLinearScale = xScale(newsData, chosenXAxis);
    var yLinearScale = yScale(newsData, chosenYAxis);

    // create initial axes functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append axes
    var xAxis = chartGroup.append("g")
                    .classed("x-axis", true)
                    .attr("transform", `translate(0, ${height})`)
                    .call(bottomAxis);
    
    var yAxis = chartGroup.append("g")
                    .classed("y-axis", true)
                    .call(leftAxis);
    
    // append initial circles
    var circlesGroup = chartGroup.selectAll("stateCircle")
                                .data(newsData)
                                .enter()
                                .append("circle")
                                .classed("stateCircle", true)
                                .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                .attr("cy", d => yLinearScale(d[chosenYAxis]))
                                .attr("r", 15)
                                .attr("opacity", "0.5");
    
    // append inital state abbreviation text
    var textGroup = chartGroup.selectAll("stateText")
                                .data(newsData)
                                .enter()
                                .append("text")
                                .classed("stateText", true)
                                .attr("x", d => xLinearScale(d[chosenXAxis]))
                                .attr("y", d => yLinearScale(d[chosenYAxis]) + 5)
                                .style("fill", "black")
                                .text(function(data) {
                                    return `${data.abbr}`
                                });
    
    // create group for x-axis labels
    var xLabelsGroup = chartGroup.append("g")
                        .attr("transform", `translate(${width/2}, ${height + 20})`);
    
    var yLabelsGroup = chartGroup.append("g")
                        .attr("transform", `translate(${0 - margin.left}, ${height/2})`);

    // labels for x-axis text
    var povertyLabel = xLabelsGroup.append("text")
                        .attr("x", 0)
                        .attr("y", 20)
                        .attr("value", "poverty") //value for event-listener
                        .classed("active", true)
                        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
                        .attr("x", 0)
                        .attr("y", 40)
                        .attr("value", "age") //value for event listener
                        .classed("inactive", true)
                        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
                        .attr("x", 0)
                        .attr("y", 60)
                        .attr("value", "income") //value for event listener
                        .classed("inactive", true)
                        .text("Household Income (Median)");

    // labels for y-axis text
    var obesityLabel = yLabelsGroup.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("x", 0)
                        .attr("y", 20)
                        .attr("value", "obesity") //value for event listener
                        .classed("active", true)
                        .text("Obese (%)");

    var smokesLabel = yLabelsGroup.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("x", 0)
                        .attr("y", 40)
                        .attr("value", "smokes") //value for event listener
                        .classed("inactive", true)
                        .text("Smokes (%)");
        
    var healthcareLabel = yLabelsGroup.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("x", 0)
                        .attr("y", 60)
                        .attr("value", "healthcare") //value for event listener
                        .classed("inactive", true)
                        .text("Lacks Healthcare (%)");

    // updateToolTip function
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x-axis event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");

            if (value !== chosenXAxis) {
                // replace chosenXAxis with value
                chosenXAxis = value;

                // update x scale for new data
                xLinearScale = xScale(newsData, chosenXAxis);

                // update xAxis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                
                // move text position
                textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                console.log(textGroup);

                if (chosenXAxis === "poverty") {
                    povertyLabel.classed("active", true)
                            .classed("inactive", false);
                    ageLabel.classed("active", false)
                            .classed("inactive", true);
                    incomeLabel.classed("active", false)
                            .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel.classed("active", false)
                            .classed("inactive", true);
                    ageLabel.classed("active", true)
                            .classed("inactive", false);
                    incomeLabel.classed("active", false)
                            .classed("inactive", true);
                }
                else {
                    povertyLabel.classed("active", false)
                            .classed("inactive", true);
                    ageLabel.classed("active", false)
                            .classed("inactive", true);
                    incomeLabel.classed("active", true)
                            .classed("inactive", false);
                };
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            };
    });

    // y-axis event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");

            if (value !== chosenYAxis) {
                // replace chosenYAxis with value
                chosenYAxis = value;

                // update y scale for new data
                yLinearScale = yScale(newsData, chosenYAxis);

                // update yAxis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                
                textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                if (chosenYAxis === "obesity") {
                    obesityLabel.classed("active", true)
                            .classed("inactive", false);
                    smokesLabel.classed("active", false)
                            .classed("inactive", true);
                    healthcareLabel.classed("active", false)
                            .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    obesityLabel.classed("active", false)
                            .classed("inactive", true);
                    smokesLabel.classed("active", true)
                            .classed("inactive", false);
                    healthcareLabel.classed("active", false)
                            .classed("inactive", true);
                }
                else {
                    obesityLabel.classed("active", false)
                            .classed("inactive", true);
                    smokesLabel.classed("active", false)
                            .classed("inactive", true);
                    healthcareLabel.classed("active", true)
                            .classed("inactive", false);
                };
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            };
    });

}).catch(function(error) {
    console.log(error);
});

// state abbreviations: data[i].abbr
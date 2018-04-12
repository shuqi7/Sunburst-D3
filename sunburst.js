
$(function(){

    var currTable = "treetable";
    var numRows = document.getElementById(currTable).rows.length - 1;// -1 for the row of footer
    var numCols = document.getElementById(currTable).rows[0].cells.length;
    
    function createDataList() {
        var list2 = []; // level 2
        var totalSize = 0; // total number of trees
        var currRow = 1;
        while (currRow < numRows){
            var currType = document.getElementById(currTable).rows[currRow].cells[0].innerHTML;
            var currNum = parseInt($(document.getElementById(currTable).rows[currRow].cells[0]).attr("rowspan")); // number of species under same category
            var totalTypeSize = 0; // refers to total size of each individual type
            var entry = "";
            var list3 = []; // level 3
            // add the first entry of the type
            entry = {
                    "name": document.getElementById(currTable).rows[currRow].cells[1].innerHTML,
                    "size": parseInt(document.getElementById(currTable).rows[currRow].cells[2].innerHTML.replace(/,/g,"")),
                    "percent": ""
                }; 
            totalTypeSize += parseInt(document.getElementById(currTable).rows[currRow].cells[2].innerHTML.replace(/,/g,""));
            totalSize += parseInt(document.getElementById(currTable).rows[currRow].cells[2].innerHTML.replace(/,/g,""));
            list3.push(entry);
            // add the rest entries of the type
            for (var i = currRow+1; i < currRow+currNum; i++){
                entry = {
                    "name": document.getElementById(currTable).rows[i].cells[0].innerHTML,
                    "size": parseInt(document.getElementById(currTable).rows[i].cells[1].innerHTML.replace(/,/g,"")),
                    "percent": ""
                }; 
                totalTypeSize += parseInt(document.getElementById(currTable).rows[i].cells[1].innerHTML.replace(/,/g,""));
                totalSize += parseInt(document.getElementById(currTable).rows[i].cells[1].innerHTML.replace(/,/g,""));
                list3.push(entry);
            }
            // update percentage
            for (var i = 0; i < currNum; i++){
                list3[i].percent = (list3[i].size / totalTypeSize * 100).toFixed(1).toString() + "%";
            }
            // push list3 to list2
            entry = {
                    "name": currType,
                    "size": totalTypeSize,
                    "children": list3,
                    "percent": ""
                }; 
            list2.push(entry);
            currRow += currNum;
        }
        // updating percentage of 3 types of tree
        for (var i = 0; i < 3; i++){
            list2[i].percent = (list2[i].size  / totalSize * 100).toFixed(1).toString() + "%";
        }
        root = {
            "name": "Tree Species in Ontario",
            "size": totalSize,
            "percent": "100%",
            "children": list2
        }
    }

    createDataList(); // update root


    var color = d3version3.scale.ordinal()
        .domain(["data1", "data2", "data3", "data4", "data5", "data6", "data7", "data8", "data9", "data10", "data11", "data12", "data13", "data14", "data15", "data16", "data17", "data18", "data19", "data20", "data21","data22","data23","data24"])
        .range(["#b0cb7b", "#678038", "rgb(144, 209, 33)", "rgb(80, 211, 68)", "rgb(120, 162, 48)", "rgb(109, 143, 49)", "rgb(153, 236, 11)","rgb(134, 188, 39)","rgb(148, 227, 11)","#77DD77","#7CFC00","#FFAB00","rgb(164, 128, 54)","#C79736","#EAA00C","#45A23D","#3FB834","#38C32C","rgb(89, 215, 19)","#A7FC00","rgb(100, 234, 10)","rgb(176, 203, 123)","rgb(144, 188, 60)","rgb(144, 188, 60)"]);



    var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    };

    var w = 630 - margin.left - margin.right,
        h = 765 - margin.top - margin.bottom,
        radius = (Math.min(w, h) / 2) -10;

    var formatNumber = d3version3.format(",d");

    var percentBase = 100;

    var x = d3version3.scale.linear()
      .range([0, 2 * Math.PI]);

    var y = d3version3.scale.linear()
      .range([0, radius]);

    var partition = d3version3.layout.partition()
      .value(function(d) {
        return d.size;
      });   

    // responsive svg
    var svg = d3version3.select("#treemap-viz")
        .append("div")
            .attr("class", "sunburstD3")
           .attr("id", "sunburstD3")
            .append("svg")
                .attr("class", "sunburstDiv")
                .attr("id", "sunburstDiv")
                .style("width", "590px")
               .style("height", "710px")
//                .style("width", "620px")
//               .style("height", "720px")
                /*.style("border-right", "1px lightblue solid")*/
                .append("svg")
                    .attr("id", "hoverInfoSVG")
                    .attr("width", w)
                    .attr("height", h)
                    .append("g")
                        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

              
    var arc = d3version3.svg.arc()
      .startAngle(function(d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
      })
      .endAngle(function(d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
      })
      .innerRadius(function(d) {
        return Math.max(0, y(d.y));
      })
      .outerRadius(function(d) {
        return Math.max(0, y(d.y + d.dy));
      });

    // check if text fits in the container
    var labelFits = function(d) {
        return x(d.x + d.dx) - x(d.x) > 0.06;
    };


    $("#sunburstD3").after("<div id='sunburstSpeciesDiv'></div>");

    var speciesDiv = d3version3.select("#sunburstSpeciesDiv");
    $("#sunburstSpeciesDiv").append("<div id='nameDiv'></div>");
    $("#sunburstSpeciesDiv").append("<div id='percentDiv'></div>");
    $("#sunburstSpeciesDiv").append("<div id='volumeDiv'></div>");
   var nameDiv = d3version3.select("#nameDiv");
   var percentDiv = d3version3.select("#percentDiv");
   var volumeDiv = d3version3.select("#volumeDiv");
               
        
    var g = svg.selectAll("path")
        .data(partition.nodes(root))
        .enter().append("g")
        .attr("class", "sunBurstSection")
        .attr("id", function(d,i){
            return "sunBurstSection_"+i;
    });

    var path = g.append("path")
        .attr("d", arc)
        .style("fill", function(d) {
          return color(d.name);
        })
        .attr("id", function(d,i){
            return "sunBurstSectionPath_"+i;
        })
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .on("click", click)
        .on("mouseover", handleMouseOver )
        .on("mouseout", function(d) {
         d3version3.select(this).style("cursor", "default")
        });

    var text = g.append("text")
        .style("fill-opacity", 1)
        .style("fill", function(d) { return labelFits(d) ? "black" : "none"; })
        .attr("transform", function(d) {
            var multiline = (d.name || "").split(" ").length > 1,
            angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
            rotate = angle + (multiline ? -.5 : 0);
            return "rotate(" + rotate + ")translate(" + (y(d.y) + 10) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
        })
        .attr("id", function(d,i){
            return "sunBurstSectionText_"+i;
        })
        .attr("class", "sunBurstSectionText")
        .attr("text-anchor", function(d) {
            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
         })
        .attr("dx", "0") // margin
        .attr("dy", ".35em") // vertical-align
        .text(function(d) {
            var returnVal = "";
            if(d.depth == 0){
                returnVal = "";
            } else {
                returnVal = d.name;
            }
            return returnVal;   
        })
        .style("font-size", "12px");

    // place the central label
    
    d3version3.select("#sunburstDiv")
            .append("text")
            .attr("id","centre-label")
            .text("Tree Species")
            .attr("x",295)
            .attr("y",370)
            .attr("text-anchor","middle")
            .attr("pointer-events","none");


    // check relationship between elements
    function isParentOf(p, c) {
        if (p === c) return true;
        if (p.children) {
            return p.children.some(function(d) {
                return isParentOf(d, c);
            });
        }
        return false;
    }


    function changeSunburst(){
          $("#sunburstSpeciesDiv").css("margin-top","40px");
         $("#treetable").css("margin-top","20px");
           if ($(window).width() < 350) {
               $(".sunburstDiv").css("transform", "scale(0.45, 0.45)")
                                          .css("margin","-200px -160px -250px");
        } else if ($(window).width() < 420) {
               $(".sunburstDiv").css("transform", "scale(0.5, 0.5)")
                                          .css("margin","-180px -140px -230px");
        } else if ($(window).width() < 520) {
               $(".sunburstDiv").css("transform", "scale(0.6, 0.6)")
                                          .css("margin","-120px -90px -190px");
               
        } else if ($(window).width() < 620) {
               $(".sunburstDiv").css("transform", "scale(0.7, 0.7)")
                                          .css("margin","-100px -50px -180px");
        } else if ($(window).width() < 680) {
               $(".sunburstDiv").css("transform", "scale(0.8, 0.8)")
                                          .css("margin","-80px 15px -150px");
        } else if ($(window).width() < 800) {
               $(".sunburstDiv").css("transform", "scale(0.9, 0.9)")
                                          .css("margin", "0px 40px -120px");
        } else  if ($(window).width() < 960)  {
            $(".sunburstDiv").css("transform", "scale(1, 1)")
                                          .css("margin", "0px 100px -80px");
        } else {
            $(".sunburstDiv").css("transform", "scale(1, 1)")
                                          .css("margin", "0 auto");
            $("#sunburstSpeciesDiv").css("margin-top","0px");
            $("#treetable").css("margin-top","0px");
        }

        // change species div font size
       if ($(window).width() < 520){
           $("#sunburstSpeciesDiv").css("font-size","1.3em");
       } else{
          $("#sunburstSpeciesDiv").css("font-size","1.6em");
       }
   }


     //deterimine the size of sunburst when first loading the page
     changeSunburst();
     // change size with window change
    $(window).resize(changeSunburst);

    // execute when click event triggered
    var clickStatus = 0;
    function click(d){
        if (clickStatus == 0 && d.depth > 0){
            clickStatus++;
            clickHelper(d);
        } else if(clickStatus == 1 && d.depth == 0){
            clickStatus--;
            clickHelper(d);
        }
    }

    function clickHelper(d) {
        if (d.depth == 2){ 
                d = d.parent; // clicking on outermost layer is same as clicking its parents
        }
        percentBase = parseFloat(d.percent.split("%")[0]);
        if (d.name == "Tree Species in Ontario") percentBase = 100;
        path.transition()
            .duration(750)
            .attrTween("d", arcTween(d))
            .each("end", function(e, i) {
                // Once the scales have been updated by arcTween, update the
                // fill style of the label depending on the size of the wedge
                d3version3.select(text[0][i]).style("fill", function(d) { return labelFits(d) ? "black" : "none"; });
            });

        text.style("visibility", function(e) {
                return isParentOf(d, e) ? null : d3version3.select(this).style("visibility");
            })
            .transition()
            .duration(750)
            .attrTween("text-anchor", function(d) {
                return function() {
                    return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
                };
            })
            .attrTween("transform", function(d) {
                var multiline = (d.name || "").split(" ").length > 1;
                return function() {
                    var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                        rotate = angle + (multiline ? -.5 : 0);
                    return "rotate(" + rotate + ")translate(" + (y(d.y) + 10) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
                };
            })
            .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
            .each("end", function(e) {
                d3version3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
            });

        // change central label
        if (d.depth == 0) {
                d3version3.select("#centre-label").text("Tree Species")
                .style("font-family","Lato, sans-serif")
                .style("font-size","16px");
            } else {
                d3version3.select("#centre-label").text("\uF010")
                .attr("class","fa fa-search-minus")
                .style("font-size","18px")
                .style("font-family","");
            }

      // shift window when screen size < 960
      if ($(window).width() < 960) {
          $('html, body').animate({
                scrollTop: $('.sunburstDiv').offset().top
           }, 'slow');
       }
    }
        

    d3version3.select(self.frameElement).style("height", h + "px");

    // Interpolate the scales!
    function arcTween(d) {
        var xd = d3version3.interpolate(x.domain(), [d.x, d.x + d.dx ]),
            yd = d3version3.interpolate(y.domain(), [d.y, 1]),
            yr = d3version3.interpolate(y.range(), [d.y ? 80 : 0, radius]);
        return function(d, i) {
            return i ? function(t) {
                return arc(d);
            } : function(t) {
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
                return arc(d);
            };
        };
    }

    function computeTextRotation(d) {
      var ang = (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
      return (ang >= 92) ? 180 + ang : ang;
    }
                
                
    function handleMouseOver(d, i) {  // Add interactivity
        d3version3.select(this).style("cursor", "pointer")
        var totalSize = path.node().__data__.value;
        var percentage = Math.round(((100 * d.value / totalSize) * 100) / percentBase);
        var percentageString = percentage + "%";

         nameDiv.text(function(){
            if (d.depth == 0) return " ";
            else {
                return d.name;
           }
         })

        percentDiv.text(function(){
            if (d.depth == 0) return " ";
           else if (d.name == "Tolerant Hardwoods" || d.name == "Intolerant Hardwoods" || d.name == "Softwoods") {
                return d. percent + " of  all trees in Ontario";
            } else {
                var totalPercent = (d.size / root.size*100).toFixed(1).toString() + "%";
                return d. percent + " of " + d.parent.name + " | " + totalPercent + " of all trees in Ontario";
           }
        })

        volumeDiv.text(function(){
            if (d.depth == 0) return " ";
           else {
       //        return "Gross total volume: " + Number(d.size.toString()).toLocaleString('en') +  " m\u00b3";
                return "Gross total volume: " + d.size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+  " m\u00b3";
             } 
        }) 
    }

    function handleMouseOut(d, i) {
        var sel = "#sunBurstSection_" + i;
        d3version3.select(sel)
            .attr("opacity", 1);
        d3version3.select(".typePic").remove();
    }   
   


       
});




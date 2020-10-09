function drawGraph(myData) {
        classes = myData;
        nodes = cluster.nodes(packages.root(classes));
        links = packages.imports(nodes);
        splines = bundle(links);

        var svg = d3.select("svg > g");
        var path = svg.selectAll("path.link")
                .data(links)
                .enter().append("path")
                .attr("class", function(d) {
                  return "link source-" + d.source.key + " target-" + d.target.key;
                })
                .attr("d", function(d, i) { return line(splines[i]); })
                .attr("stroke-dasharray", function(d) { return d.lty; })
                //.style("stroke-opacity", function(d) { return d.opacity; })
                .style('stroke-width', function(d) { if(d.target.bold=='y') return 2; });

    var nodes_g = svg.selectAll("g.node")
      .data(nodes.filter(function(n) { return !n.children; }))
      .enter().append("g")
        .attr("class", "node")
        .attr("id", function(d) { return "node-" + d.key; })
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
        .style("font-size",18);

    nodes_g.append("text")
      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
      //.style("fill", function(d){if(d.color) return d.color;})
      //.style('font-weight', function(d) { if(d.bold=='y') return 800; })
      .text(function(d) { return d.vertice_names; })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
              .append("svg:title")
        .text(function(d) { return d.name; });

    // set up a scale to size nodes based on xin.nodesize
    var nodesizer = d3.scale.linear()
      .domain(d3.extent(nodes.map(function(d){return d.size})))
      .range([2,5]);

nodes_g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("opacity", 1.0)
        .attr("r", function(d,i){
          var size = d3.max(nodesizer.range());
          if(d.size){
            size = nodesizer(d.size)
            }
          return Math.round(Math.pow(size, 1/2));
        });

    d3.select("body")
      .on("mousemove", mousemove)
      .on("mouseup", mouseup);

    function mouse(e) {
      return [e.pageX - rx, e.pageY - ry];
    }

    function mousedown() {
      m0 = mouse(d3.event);
      d3.event.preventDefault();
    }

    function mousemove() {
      if (m0) {
        var m1 = mouse(d3.event),
        dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
        div.style("transform", "translateY(" + (ry - rx) + "px)rotateZ(" + dm + "deg)translateY(" + (rx - ry) + "px)");
      }
    }

    function mouseup() {
      if (m0) {
        var m1 = mouse(d3.event),
        dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
        rotate += dm;
        if (rotate > 360) rotate -= 360;
        else if (rotate < 0) rotate += 360;
        m0 = null;
        div.style("transform", null);
        svg
          .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
          .selectAll("g.node text")
          .attr("dx", function(d) {
            return (d.x + rotate) % 360 < 180 ? 8 : -8;
          })
          .attr("text-anchor", function(d) {
            return (d.x + rotate) % 360 < 180 ? "start" : "end";
          })
          .attr("transform", function(d) {
            return (d.x + rotate) % 360 < 180 ? null : "rotate(180)";
          });
      }
    }

    function mouseover(d) {
      svg.selectAll("path.link.target-" + d.key)
        .classed("target", true)
        .each(updateNodes("source", true));
      svg.selectAll("path.link.source-" + d.key)
        .classed("source", true)
        .each(updateNodes("target", true));
    }

    function mouseout(d) {
      svg.selectAll("path.link.source-" + d.key)
        .classed("source", false)
        .each(updateNodes("target", false));
      svg.selectAll("path.link.target-" + d.key)
        .classed("target", false)
        .each(updateNodes("source", false));
    }

    function updateNodes(name, value) {
      return function(d) {
        if (value) this.parentNode.appendChild(this);
        svg.select("#node-" + d[name].key).classed(name, value);
      };
    }

    function cross(a, b) {
      return a[0] * b[1] - a[1] * b[0];
    }

    function dot(a, b) {
      return a[0] * b[0] + a[1] * b[1];
    }
}

var charts = (function($, d3){
	'use-strict';


	function getArc(){
		var arc = d3.svg.arc()
				.startAngle(function(d){return d.x;})
				.endAngle(function(d){return d.x + d.dx;})
				.innerRadius(function(d) {return Math.sqrt(d.y);})
				.outerRadius(function(d) {return Math.sqrt(d.y + d.dy); });
		return arc;
	}

	function stash(d) {
	  d.x0 = d.x;
	  d.dx0 = d.dx;
	}

	function arcTween(a, arc) {
	  var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
	  return function(t) {
	    var b = i(t);
	    a.x0 = b.x;
	    a.dx0 = b.dx;
	    return getArc()(b);
	  };
	}

	function isNullOrUndefined(obj){
		return obj == null || obj == undefined
	}

	function getContributors(contributors, company) {
		result = [];

		contributors.forEach(function(c){
			if(c.company == company){
				result.push({
					id:c.id,
					text: c.name,
					size:c.metric

				})
			}
		});

		return result;
	}

	function prepareData(data){
		newData = {
			text:"root",
			children: [
				{
					id:'intel',
					text:'Intel',
					size:0,
					children:[]
				},
				{
					id:'rackspace',
					text:'Rackspace',
					size:0,
					children:[]
				}
			]
		}

		if(!isNullOrUndefined(data)){
			metrics = Object.keys(data);

			metrics.forEach(function(metric){
				newData.children[0].size += data[metric].intel
				newData.children[1].size += data[metric].rackspace

				if(data[metric].intel > 0){

					newData.children[0].children.push({
						id: metric,
						text: metric,
						size: data[metric].intel,
						children: getContributors(data[metric].members, "intel")
					});
				}

				if(data[metric].rackspace > 0){

					newData.children[0].children.push({
						id: metric,
						text: metric,
						size: data[metric].rackspace,
						children: getContributors(data[metric].members, "rackspace")
					});
				}
			})
		}
		return newData;
	}

	function getAncestors(n){
		var ancestors = [];
		var current = n;
		while (current.parent){
			ancestors.unshift(current)
			current = current.parent;
		}
		return ancestors;
	}

	return {
		sunburst: function(containerId, data){
			data = prepareData(data);
			$(containerId).height($("body").height() * 0.45)
			$(containerId).html('');
			var w = $(containerId).width(),
			h = $(containerId).height(),
			color = d3.scale.category20c(),
			radius = Math.min(w, h) * .48;

			var svg = d3.select(containerId).append("svg")
				.attr("width", w)
				.attr("height", h)
				.append("g")
				.attr("transform", "translate(" + (w / 2) + "," + (h * .5) + ")" );

			var partition = d3.layout.partition()
				.sort(null)
				.size([2* Math.PI, radius * radius])
				.value(function(d){return 1;})


			var path = svg.datum(data).selectAll("path")
				.data(partition.nodes)
				.enter().append("path")
				.attr("display", function(d) { return d.depth ? null : "none"; }) 
		        .attr("d", getArc)
		        .style("stroke", "#fff")
		        .style("fill", function(d) { return color((d.children ? d : d.parent).text); })
		        .style("fill-rule", "evenodd")
		        .each(stash);

		    path.data(partition.value(function(d){return d.size;}).nodes)
      			.transition()
        		.duration(1500)
        		.attrTween("d", arcTween);

        	var totalSize = path.node().__data__.value;

        	path.on("mouseover", function(d){

        		var ancestors = getAncestors(d)

        		var percentage = (100 * d.size / totalSize).toPrecision(3);

        		var title = ancestors.map(function(d){return d.text}).join(" > ");


        		d3.selectAll("path")
        			.style("opacity", 0.3)
        		svg.selectAll("path")
        			.filter(function(node){
        				return (ancestors.indexOf(node) >=0 )
        			})
        			.style("opacity", 1)

        		d3.select("#tooltip")
        			.style("visibility", "visible")
        			.html("<p>" + title + "</p> <p>"+ percentage +"% of total contributions</p>")


        	});

        	path.on("mousemove", function(){
        		d3.select("#tooltip")
        			.style('top', (d3.event.pageY - 5) + 'px')
        			.style('left', (d3.event.pageX) + 'px');
        	})

        	path.on("mouseout", function(d){

        		d3.selectAll("path")
			      .style("opacity", 1);
			    
			    d3.select("#tooltip").style("visibility", "hidden")
			});

			}

	}
}($,d3));

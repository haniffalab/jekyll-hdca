
(function ($) {
  $(document).ready(function() {

    // Hide the loader and show the elements.
    setTimeout(function () {
      $('.slide-in').each(function() {
        $(this).addClass('visible');
      });
    }, 1900);

    // Enable popovers everywhere.
    $('[data-toggle="popover"]').popover();

    // Enable tooltips everywhere.
    $('[data-toggle="tooltip"]').tooltip();

    // Hook the "Learn More" button event to scroll to content.
    $('#scroll-to-content').click(function(ev) {
      ev.preventDefault();
      if (typeof ev.target.dataset.scrollTo === 'undefined') {
        return;
      }
      $('html, body').animate({
        scrollTop: $(ev.target.dataset.scrollTo).offset().top - 100
      }, 1000)
    });

      $('.video-link').click(function() {
        $('.myVideo').attr("src", $(this).attr("vidUrl"));
        $('.overlay').fadeIn(500, function(){
          $('.main-vid-box').fadeIn(500);
          $('.close').fadeIn(500);
        });
      });
      
      $('.close, .overlay').click(function() {
        $('.overlay').fadeOut(500);
        $('.myVideo').attr("src", $(this).attr("vidUrl"));
        $('.main-vid-box').fadeOut(500);
        $('.close').fadeOut(500);
      });
 
    
    // D3 icon element
    if($("#t-sne").length){
      const width = 400,
            height = 400,
            margin = 40,
            scalepop = d3.scaleSqrt().domain([0, 100000]).range([0.2, 24]),
            scalecountry = d3.scaleOrdinal(d3.schemeCategory20b),
            centerx = d3.scaleLinear()
              .range([width / 2 - height / 2 + margin, width / 2 + height / 2 - margin])
            centery = d3.scaleLinear()
              .range([margin, height - margin]);

      d3.csv('/assets/cities.csv', function (cities) {
        const data = cities
            .sort((a, b) => d3.descending(+a[2015], +b[2015]))
            .map((d, i) => [+d.Longitude, +d.Latitude, d['Urban Agglomeration'], +d[2015], +d['Country Code']])
            .slice(0, 800);

        const canvas = d3.select("#t-sne").append("canvas")
            .attr("width", width)
            .attr("height", height);

        const model = new tsnejs.tSNE({
            dim: 2,
            perplexity: 30,
        });

        // initialize data with pairwise distances
        const dists = data.map(d => data.map(e => d3.geoDistance(d, e)));
        model.initDataDist(dists);

        const forcetsne = d3.forceSimulation(
        data.map(d => (d.x = width / 2, d.y = height / 2, d))
        )
            .alphaDecay(0.005)
            .alpha(0.1)
            .force('tsne', function (alpha) {
                // every time you call this, solution gets better
                model.step();

                // Y is an array of 2-D points that you can plot
                let pos = model.getSolution();

                centerx.domain(d3.extent(pos.map(d => d[0])));
                centery.domain(d3.extent(pos.map(d => d[1])));

                data.forEach((d, i) => {
                    d.x += alpha * (centerx(pos[i][0]) - d.x);
                    d.y += alpha * (centery(pos[i][1]) - d.y);
                });
            })
            .force('collide', d3.forceCollide().radius(d => 1.5 + scalepop(d[3])))
            .on('tick', function () {

                let nodes = data.map((d, i) => {
                    return {
                        x: d.x,
                        y: d.y,
                        r: scalepop(d[3]),
                        color: scalecountry(d[4]),
                    };
                });

                draw(canvas, nodes);

            });

        function draw(canvas, nodes) {
            let context = canvas.node().getContext("2d");
            context.clearRect(0, 0, width, width);

            for (var i = 0, n = nodes.length; i < n; ++i) {
                var node = nodes[i];
                context.beginPath();
                context.moveTo(node.x, node.y);
                context.arc(node.x, node.y, node.r, 0, 2 * Math.PI);
                context.lineWidth = 0.5;
                context.fillStyle = node.color;
                context.fill();
            }
        }
      });
    }      
  });
})(jQuery);
(function($) {
  //CONSTRUCTOR
  var Slide = (function() {
    var instance = 0;
    function slide(element, settings) {  
      var self = this;
      //set defaults
      self.options = {
        infinite: true,
        centered: false,
        //slidesToShow: 1,
        slidesToScroll: 11,
        fullSize: false,
        arrows: true,
        fadeIn: true,
        transition: 400
      };
      //check if element param is $ object
      var el = element instanceof $.fn.init ? element : $(element);

      //overwrite default, add new settings and save to .options
      if ($.type(settings) === "object") $.extend(self.options, settings);

      //track element
      self.$ref = el;
      //track slide instance
      self.instance = instance++;
      //start reformatting content
      self.start();
    }
    return slide;
  })();

  Slide.prototype.start = function() {
    var self = this;

    // check if slides are less set up to appear in view
    if (self.options.slidesToShow >= self.$ref.children().length) {
      self.centerAll(); //TD
    } else {
      self.setHTML();
      self.setCSS();
      self.addBehavior();
    }
  };

  Slide.prototype.setHTML = function() {
    var self = this,
      options = self.options,
      infinite = options.infinite,
      centered = options.centered,
      slidesToShow = options.slidesToShow,
      slidesToScroll = options.slidesToScroll,
      $slides = self.$ref.children(),
      $slider = $("<div></div>")
        .addClass("slides-container " + "slider-" + self.instance)
        .append($slides)
        .appendTo(self.$ref);
    self.$ref.addClass("slide-init-" + self.instance);

    ///console.log($slides)
    self.$slider = $slider;
    self.$slides = $slides = $slider.children();
    //add indexes to each slide
    $slides.each(function(i, elem) {
      $(elem).attr("data-index", i);
    });
    //reformat for infinite scrolling
    if (infinite) {
      var length = $slides.length;
      console.log(self.instance + " : " + length);
      var item;
      // var item = $slides.eq(0).clone().addClass('clone').attr('data-index', -1); console.log(item);
      // $slider.prepend(item)
      for (var i = length; i < length + slidesToScroll; i++) {
        item = $slider
          .children()
          .eq(i - length)
          .clone();
        item.addClass("clone").attr("data-index", i);
        $slider.append(item);
      }
      console.log(self.instance + " : " + length);
      $slides = $slider.children();
      for (var i = -1; i >= -slidesToScroll; i--) {
        item = $slides.eq(i + length).clone();
        item.addClass("clone").attr("data-index", i);
        $slider.prepend(item);
      }
    }
    self.$slides = $slider.children();
    //add reference to slider and slides
    // self.$slides = $slider.children();
    //add arrows if selected
    self.setArrows(self.options.arrows);
  };

  Slide.prototype.setCSS = function() {
    var self = this,
      sliderW,
      sliderH,
      slidesW,
      slidesH;
    //apply slide height to children
    sliderH = slidesH = self.getSlideHeight();
    ///console.log(sliderH)
    //calc slides width
    slidesW = self.getSlideWidth();
    ///console.log('slides width', slidesW)
    //calc slider width
    sliderW = slidesW * self.$slides.length;
    ///console.log(sliderW)

    //set slide css
    self.$ref.css({
      overflow: "hidden",
      position: "relative"
    });
    //set slider css
    self.$slider.css({
      width: sliderW,
      height: sliderH,
      background: "pink", //mock
      transform: "translateX(0)"
    });
    self.$slides.css({
      height: slidesH,
      width: slidesW,
      display: "inline-block",
      "text-align": "center", //mock
      "line-height": slidesH + "px", //mock
      "font-size": "30px" //mock
    });
    self.$arrows.css({
      height: 30,
      width: 30,
      position: "absolute",
      background: "blue", //mock
      transform: "translateY(-50%)",
      top: "50%",
      "z-index": 10
    });
    self.$arrows.eq(0).css({
      left: 0
    });
    self.$arrows.eq(1).css({
      right: 0
    });

    //generate slides offsets
    self.$slides.each(function(i, elem) {
      //map where the slider should translate to set the slide into view
      $(elem)
        .attr("data-offsetx", -$(this).position().left)
        .attr("data-offsety", -$(this).position().top);
    });
    
    //mock 
    self.$slides.filter('.clone').css('background-color', '#bada55')
  };

  Slide.prototype.getSlideWidth = function() {
    return this.$ref.width() / this.options.slidesToScroll;
  };

  Slide.prototype.getSlideHeight = function() {
    return this.$ref.height();
  };

  Slide.prototype.setArrows = function(init) {
    if (!init) return;
    var self = this;
    var prev = $("<div></div>", { class: "arrow prev" }),
      next = prev
        .clone()
        .removeClass("prev")
        .addClass("next");
    self.$ref.prepend(prev).append(next);
    self.$arrows = prev
      .add(next)
      .attr("data-target", ".slider-" + self.instance);
  };

  Slide.prototype.addBehavior = function() {
    //a view = group of slides to scroll; position/ offset is given by the first slide's offset relative to slider
    //a view can be complete (ex: 12 slides; 3 to scroll; 3 complete views) or incomplete (ex: 11 slides; 3 to scroll; 2 complete views; 1 incomplete view)

    var self = this;

    //set the first slide as current
    var current = (self.$currentSlide = self.$slides
      .filter('[data-index="0"]')
      .addClass("current-slide"));
    self.$slider.css({
      transform: "translate(" + +current.attr("data-offsetx") + "px)"
    });
    //reference container to arrow elements
    var arrows = {
      prev: $(self.$arrows[0]),
      next: $(self.$arrows[1])
    };

    //console.log(self.$slides);
    var edge = self.addCustomEvent("edge");

    arrows.prev.on("click", changeSlide("prev")).on("edge", function() {
      console.log("reached start");
    });
    arrows.next.on("click", changeSlide("next")).on("edge", function() {
      console.log("reached end");
    });
    ///console.log(prev, next)

    function changeSlide(direction) {
      //return a handler based on direction - no need to write the handler twice
      //set local variables
      var slides = self.$slides,
        originalSlides = slides.not(".clone"), // needed if infinite
        originalSlidesLength = originalSlides.length,
        noOfSlides = self.$slides.length,
        slidesToScroll = self.options.slidesToScroll,
        remainder = originalSlidesLength % slidesToScroll,
        //there will be [slidesToScroll] clones to the right and left of original slides, so current Index of
        infinite = self.options.infinite,
        transition = self.options.transition,
        edges = {
          min: infinite ? slidesToScroll : 0, //index of first element in first view
          max: noOfSlides - (infinite ? slidesToScroll : 0) - slidesToScroll //index of first elem in last view
        };
      console.log(edges)

      return function() {
        var current = self.$currentSlide, //first slide into view
          dataIndex = +current.attr("data-index"),
          currentIndex = slides.index(current);
        var test = '';
        console.log("---------------------------------------");
        //console.log("edges ", edges.min, edges.max);
        console.log("currentIndex ", currentIndex);
        console.log("data index ", dataIndex);
        //console.log(slides)
        var dir = direction === "prev" ? -slidesToScroll : slidesToScroll;
        //console.log("direction", direction.toUpperCase(), dir);
        //console.log('edge min', edges.min, edges.max);
        console.log("is edge? ", atEdge(currentIndex, dir));
        console.log("-----------------");
        if (atEdge(currentIndex, dir) && !infinite) {
          arrows[direction].trigger(edge);
          console.log("asdfasdf", currentIndex);
          moveViewTo(true);
          console.log("atEdge(currentIndex, dir) && !infinite");
        } else if (atEdge(currentIndex, dir) && infinite) {
          current.removeClass("current-slide");
          current = self.$currentSlide = slides
            .eq((currentIndex += dir))
            .addClass("current-slide");
          //console.log("index ", currentIndex);
          //console.log("go " + direction + " full to clone");
          moveViewTo(currentIndex);
        } else {
          //console.log('???', currentIndex, remainder)
          if (
            (!slides.eq(currentIndex + slidesToScroll + remainder).length &&
              dir > 0) ||
            (slides
              .eq(currentIndex + slidesToScroll + remainder)
              .hasClass("clone") &&
              dir > 0)
          ) {
            current.removeClass("current-slide");
            currentIndex +=  remainder;
            current = self.$currentSlide = slides
              .eq(currentIndex)
              .addClass("current-slide");
            moveViewTo(currentIndex);
            console.log("go next + remainder", edge.max);
 
          } else if (
            (currentIndex - slidesToScroll < 0 && dir < 0) ||
            (slides.eq(currentIndex - slidesToScroll).hasClass("clone") &&
              dir < 0)
          ) {
            current.removeClass("current-slide");
            currentIndex -= remainder;
            current = self.$currentSlide = slides
              .eq(currentIndex)
              .addClass("current-slide");
            moveViewTo(currentIndex);
            console.log("go prev - remainder");
          } else {
            current.removeClass("current-slide");
            currentIndex += dir;
            current = self.$currentSlide = slides
              .eq(currentIndex)
              .addClass("current-slide");
            console.log("go " + direction + " full");
            moveViewTo(currentIndex);
          }
        }

        console.log('new', current.text());
        console.log("new index", currentIndex);
        console.log("new data index", current.attr("data-index"));
        console.log("clone", current.hasClass("clone"));
        console.log('test clone: ', test)

        function atEdge(index, dir) {
          return (
            (index === edges.min && dir < 0) || (index === edges.max && dir > 0)
          );
        }

        function moveViewTo(index) {
          var nextSlide = slides.eq(index),
            isClone = nextSlide.hasClass("clone"),
            initialPosition,
            moveTo,
            dataIndex,
            targetIndex;
          arrows[direction].off("click");

          if (index === true) {
            initialPosition = +current.attr("data-offsetx");
            moveTo = initialPosition - 15 * (direction === "prev" ? -1 : 1);

            self.$slider
              .css(
                //add transition prop with 1/2 transition time (the other 1/2 for returning to initialPosition)
                "transition",
                "transform " + transition / 2 + "ms ease-in-out"
              )
              //add transform
              .css("transform", "translatex(" + moveTo + "px)");
            //set slide back timeout on 1/2 transition time
            var slideBack = setTimeout(function() {
              self.$slider.css(
                "transform",
                "translatex(" + initialPosition + "px)"
              );
            }, transition / 2);
            //set remove transition to full transition time
            var removeTransition = setTimeout(function() {
              self.$slider.css("transition", "none");
              arrows[direction].on("click", changeSlide(direction));
            }, transition);
          } else if (!isClone) {
            moveTo = +nextSlide.attr("data-offsetx");
            self.$slider
              .css("transition", "transform " + transition + "ms ease-in-out")
              .css("transform", "translatex(" + moveTo + "px)");
            var slide = setTimeout(function() {
              self.$slider.css("transition", "none");
              arrows[direction].on("click", changeSlide(direction));
            }, transition);
          } else {
            console.log("is clone");
            dataIndex = +current.attr("data-index");
            console.log("dataIndex", dataIndex);   
            var moveToClone = +nextSlide.attr("data-offsetx");
            //console.log("original length", originalSlidesLength);
            targetIndex =
              dataIndex < 0
                ? dataIndex + originalSlidesLength
                : dataIndex - originalSlidesLength;   
            console.log("where to go", targetIndex);
            //console.log(slides.find('div'))
            moveTo = +slides
              .filter("[data-index=" + targetIndex + "]")
              .attr("data-offsetx");
            console.log("moveTo", moveTo);
            //console.log('current slide' , slides.filter('[data-index='+ 0 +']'))
            //need to update current
            current = self.$currentSlide = slides.filter("[data-index=" + targetIndex + "]");
            currentIndex = slides.index(current);
            test = 'test...'
            self.$slider
              .css("transition", "transform " + transition + "ms ease-in-out")
              .css("transform", "translatex(" + moveToClone + "px)");
            var slide = setTimeout(function() {
              self.$slider.css("transition", "none");
              self.$slider.css("transform", "translatex(" + moveTo + "px)");
              arrows[direction].on("click", changeSlide(direction));
            }, transition);
          }
        } //end moveView
      }; //end enclosed function
    } //end changeSlide
  };

  Slide.prototype.addCustomEvent = function(type) {
    //return new event object
    return $.Event(type);
  };

  $.fn.slide = function(settings) {
    var self = this;
    self.each(function(i, elem) {
      if ($.type(elem) !== "undefined")
        elem.slide = new Slide($(elem), settings);
    });
  };

  //helper functions

  //var mockups = {};
})(jQuery);


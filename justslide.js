(function ($) {
  //CONSTRUCTOR
  var Slide = (function () {
    var instance = 0;
    function slide(element, settings) {
      var self = this;
      //set defaults
      self.options = {
        infinite: false,
        centered: false,
        slidesToShow: 1,
        slidesToScroll: 2,
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

  Slide.prototype.start = function () {
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

  Slide.prototype.setHTML = function () {
    var self = this,
      options = self.options,
      infinite = options.infinite,
      centered = options.centered,
      slidesToShow = options.slidesToShow,
      slidesToScroll = options.slideToScroll,

      $slides = self.$ref.children(),
      $slider = $("<div></div>")
        .addClass("slides-container " + "slider-" + self.instance)
        .append($slides)
        .appendTo(self.$ref);
    self.$ref.addClass("slide-init-" + self.instance);
    //add reference to slider and slides
    self.$slides = $slides;
    ///console.log($slides)
    self.$slider = $slider;
    //add indexes to each slide
    $slides.each(function (i, elem) {
      $(elem).attr("data-index", i);
    });
    //reformat for infinite scrolling
    if (infinite) {
    }
    //add arrows if selected
    self.setArrows(self.options.arrows);
  };

  Slide.prototype.setCSS = function () {
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
    self.$slides.each(function (i, elem) {
      //map where the slider should translate to set the slide into view
      $(elem)
        .attr("data-offsetx", -$(this).position().left)
        .attr("data-offsety", -$(this).position().top);
    });
  };

  Slide.prototype.getSlideWidth = function () {
    return this.$ref.width() / this.options.slidesToScroll;

  };

  Slide.prototype.getSlideHeight = function () {
    return this.$ref.height()
  }

  Slide.prototype.setArrows = function (init) {
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

  Slide.prototype.addBehavior = function () {
    var self = this;

    //set the first slide as current
    var current = (self.$currentSlide = $(self.$slides[0]));
    current.addClass("current-slide");

    var arrows = {};

    arrows.prev = $(self.$arrows[0]);
    arrows.next = $(self.$arrows[1]);

    //console.log(self.$slides);
    var edge = self.addCustomEvent("edge");

    arrows.prev.on("click", changeSlide("prev")).on("edge", function () {
      console.log("reached start");
    });
    arrows.next.on("click", changeSlide("next")).on("edge", function () {
      console.log("reached end");
    });
    ///console.log(prev, next)

    //helper functions
    function changeSlide(direction) {
      //return a handler based on direction - no need to write the handler twice
      return function () {
        //set local variables
        var slides = self.$slides,
          currentSlide = self.$currentSlide, //first slide into view
          currentIndex = +currentSlide.attr("data-index"),
          noOfSlides = self.$slides.length,
          slidesToScroll = self.options.slidesToScroll,
          remainder = noOfSlides % slidesToScroll,
          edges; //min = first slide; max = first slide in the last group in a slider
          if (!self.options.infinite) {
            edges = (function() {
              return {
                min: 0,
                max: noOfSlides - slidesToScroll,
              }
            })()
          }
        

        updateCurrent(direction);

        function updateCurrent(direction) {
          var dir = direction === 'prev' ? -slidesToScroll : slidesToScroll;
          //remainder declared above
          console.log('edges are ', edges.min, edges.max, noOfSlides, slidesToScroll);
          //define edge behavior - 
          if (currentIndex === edges.min && dir < 0)  {
            arrows[direction].trigger(edge)
            goToOffset(currentSlide, dir);
          } else if (currentIndex === edges.max && dir > 0) {
            arrows[direction].trigger(edge);
            goToOffset(currentSlide, dir);
          } else if (!slides[currentIndex+slidesToScroll+1] && dir > 0) {
            console.log('need to use remainder to go right');
            currentSlide.removeClass('current-slide');
            //set next slide
            currentSlide = self.$currentSlide = slides.eq(currentIndex+remainder);
            //go to next slide
            goToOffset(currentSlide, remainder);
          } else if (!slides[currentIndex-slidesToScroll] && dir < 0) {
            console.log('need to use remainder to go left');
            //set next slide
            currentSlide = self.$currentSlide = slides.eq(currentIndex-remainder);
            //go to next slide
            goToOffset(currentSlide, -remainder);
          } else {
            console.log("curr index ", currentIndex);
            currentSlide.removeClass("current-slide");
            //console.log(currentIndex + dir);
            currentSlide = self.$currentSlide = $(
              slides.eq(currentIndex + dir)
            ).addClass("current-slide");
            console.log(self.$currentSlide);
            goToOffset(currentSlide); //TD
          }
        }
        function goToOffset(elem, dir) {
          //cannot animate transform as other properties: add transition, set transform, remove transition

          //transitions are expressed in negative values as goTo values are mapped as distances

          //unbind click event to prevent multiple click events
          arrows[direction].off("click");
          var goTo,
            transition = self.options.transition,
            initialPosition;
          //check if edge reached - dir = - || +
          if (dir) {
            if (dir < 0) {
              //translate slider to the right
              initialPosition = +elem.attr("data-offsetx");
              goTo = initialPosition + 15;
            }
            else {
              //translate slider to the left
              initialPosition = +elem.attr("data-offsetX");
              goTo = initialPosition - 15;
            }

            self.$slider
              .css(
              //add transition prop with 1/2 transition time (the other 1/2 for returning to initialPosition)
              "transition",
              "transform " + (transition + 100) / 2 + "ms ease-in-out"
              )
              //add transform 
              .css("transform", "translatex(" + goTo + "px)")
            //set slide back timeout on 1/2 transition time
            var slideBack = setTimeout(function () {
              self.$slider.css("transform", "translatex(" + initialPosition + "px)");
            }, (transition + 100) / 2);
            //set remove transition to full transition time
            var removeTransition = setTimeout(function () {
              self.$slider.css("transition", "none");
              arrows[direction].on("click", changeSlide(direction));
            }, transition + 100)


          } else {
            //principles from above apply, without needing to halve transition time
            goTo = elem.attr("data-offsetx");
            self.$slider
              .css("transition", "transform " + transition + "ms ease-in-out")
              .css("transform", "translatex(" + goTo + "px)");
            var slide = setTimeout(function () {
              self.$slider.css("transition", "none");
              arrows[direction].on("click", changeSlide(direction));
            }, transition);
          }
        }
      };
    }
  };

  Slide.prototype.addCustomEvent = function (type) {
    //return new event object 
    return $.Event(type);
  };

  $.fn.slide = function (settings) {
    var self = this;
    self.each(function (i, elem) {
      if ($.type(elem) !== "undefined")
        elem.slide = new Slide($(elem), settings);
    });
  };

  //helper functions

  //var mockups = {};
})(jQuery);




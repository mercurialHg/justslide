(function($) {
  //CONSTRUCTOR
  var Slide = (function() {
    var instance = 0;
    function slide(element, settings) {
      var self = this;
      //set defaults
      self.options = {
        infinite: false,
        centered: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        fullSize: false,
        arrows: true,
        fadeIn: true,
        transition: 400
      };
      //check if element param is $ object
      ///console.log('element',element);
      var el = element instanceof $.fn.init ? element : $(element);
      ///console.log('el',el.children)
      //add default settings

      //overwrite existing settings and add new ones
      if ($.type(settings) === "object") $.extend(self.options, settings);

      //track element
      self.$ref = el;
      ///console.log(self.$ref.children);
      //track slide instance
      self.instance = instance++;
      //start reformatting content
      self.start();
    }
    //console.log(slide)
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
    $slides.each(function(i, elem) {
      $(elem).attr("data-index", i);
    });
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
    sliderH = slidesH = self.$ref.height();
    ///console.log(sliderH)
    //calc slides width
    slidesW = self.getSlideWidth(self.options.fullSize);
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
      transform: 'translateX(0)',
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
      'z-index': 10,
    });
    self.$arrows.eq(0).css({
      left: 0
    });
    self.$arrows.eq(1).css({
      right: 0
    });

    //generate slides offsets
    self.$slides.each(function(i, elem) {
      $(elem)
        .attr("data-offsetx", $(this).position().left)
        .attr("data-offsety", $(this).position().top);
    });
  };

  Slide.prototype.getSlideWidth = function(full) {
    var self = this;
    ///console.log(self.options)
    if (full) {
      //return height of content
      return self.$ref.height();
    } else {
      return self.$ref.width() / self.options.slidesToShow;
    }
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
    var self = this;

    //set the first slide as current
    var current = (self.$currentSlide = $(self.$slides[0]));
    current.addClass("current-slide");
    
    var arrows = {};

      arrows.prev = $(self.$arrows[0]),
      arrows.next = $(self.$arrows[1]);

    console.log(self.$slides);
    var edge = self.addCustomEvent("edge");
    
    

    arrows.prev.on("click", changeSlide("prev")).on("edge", function() {
      console.log("reached start");
    });
    arrows.next.on("click", changeSlide("next")).on("edge", function() {
      console.log("reached end");
    });
    ///console.log(prev, next)

    //helper func
    function changeSlide(direction) {
      return function() {
        var slides = self.$slides,
          currentSlide = self.$currentSlide,
          currentIndex = +currentSlide.attr("data-index"),
          noOfSlides = self.$slides.length;

        updateCurrent(direction); //TD
        function updateCurrent(direction) {
          var dir = direction === "prev" ? -1 : 1;
          //console.log("dir ", dir);
          if (currentIndex + dir < 0) {
            arrows.prev.trigger(edge);
          } else if (currentIndex + dir === noOfSlides) {
            arrows.next.trigger(edge);
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
        function goToOffset(elem) {
          console.log(arrows[direction])
          arrows[direction].off('click');
          var goTo = elem.attr("data-offsetx");
          var transition = self.options.transition;
          self.$slider.css('transition','transform '+ transition + 'ms ease-in-out')
              .css('transform', 'translatex(' + - goTo + 'px)');
          setTimeout(function() { self.$slider.css('transition','none')
                                  arrows[direction].on('click', changeSlide(direction))
                                }, transition)
            
        }
      };
    }
  };

  Slide.prototype.addCustomEvent = function(type) {
    return $.Event(type);
  };

  $.fn.slide = function(settings) {
    var self = this;
    self.each(function(i, elem) {
      if ($.type(elem) === "undefined") return;
      elem.slide = new Slide($(elem), settings);
      ///console.dir(elem)
    });
  };

  //helper functions

  //var mockups = {};
})(jQuery);

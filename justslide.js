;(function($) {

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
    self.$slides = $slides;
    self.$slider = $slider;
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
      overflow: 'hidden',
      position: 'relative',
    });
    //set slider css
    self.$slider.css({
      width : sliderW,
      height: sliderH,
      background: 'pink', //mock
    });
    self.$slides.css({
      height: slidesH,
      width: slidesW,
      display: 'inline-block',
      'text-align': 'center', //mock
      'line-height': slidesH + 'px', //mock  
      'font-size': '30px', //mock
    });
    self.$arrows.css({
      height: 30,
      width: 30,
      position: 'absolute',
      background: 'blue', //mock
      transform: 'translateY(-50%)',
      top: '50%'
    });
    self.$arrows.eq(0).css({
      left: 0
    });
    self.$arrows.eq(1).css({
      right: 0
    })
  };
  
  Slide.prototype.getSlideWidth = function (full) {
    var self = this;
    ///console.log(self.options)
    if (full) {
      //return height of content
      return self.$ref.height()
    } else {
      return self.$ref.width() / self.options.slidesToShow;
    }
  }
  
  Slide.prototype.setArrows = function(init) {
    if (!init) return;
    var self = this;
    var prev = $('<div></div>', {class: 'arrow prev'}),
        next = prev.clone().removeClass('prev').addClass('next');
    self.$ref.prepend(prev).append(next);
    self.$arrows = prev.add(next);
        
  }

  $.fn.slide = function(settings) {
    var self = this;
    self.each(function(i, elem) {
      if ($.type(elem) === "undefined") return;
      elem.slide = new Slide($(elem), settings);
      ///console.dir(elem)
    });
  };
  
  //var mockups = {};
})(jQuery);
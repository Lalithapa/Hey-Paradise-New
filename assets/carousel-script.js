class Carousel {
    constructor(settings) {
      const {
        root,
        slides,
        prev,
        next,
        mouseDragHandlers = true,
        removeControls = false,
        clickHandlers = true,
        initialSlide = 0,
      } = settings;
  
      if (!root || !slides || !prev || !next) {
        throw new Error(
          "Invalid arguments: root, slides, prev, and next are required"
        );
      }
  
      if (
        !(root instanceof jQuery) ||
        !(slides instanceof jQuery) ||
        !(prev instanceof jQuery) ||
        !(next instanceof jQuery)
      ) {
        throw new Error(
          "Invalid arguments: root, slides, prev, and next must be jQuery objects"
        );
      }
  
      this.$root = root;
      this.$slides = slides;
      this.$next = next;
      this.$prev = prev;
      this.numSlides = this.$slides.length;
      this.activeSlide = initialSlide;
  
      this.updateDimensions();
      this.updateClasses();
  
      if (mouseDragHandlers) {
        this.addMouseDragHandlers();
      }
  
      if (clickHandlers) {
        this.addClickHandlers();
      }
  
      if (removeControls) {
        this.removeControls();
      }
    }
  
    addClickHandlers() {
      this.$prev.on("click", () => this.scroll(-1));
      this.$next.on("click", () => this.scroll(1));
    }
  
    updateDimensions() {
      this.rootWidth = Math.ceil(this.$root.width());
      this.slideWidth = Math.ceil(this.$slides.outerWidth(true));
      this.numVisibleSlides = Math.floor(this.rootWidth / this.slideWidth);
      this.scrollAmount = Math.floor(0.7 * this.slideWidth);
    }
  
    scroll(direction) {
      this.activeSlide = Math.max(
        0,
        Math.min(
          this.activeSlide + direction,
          Math.max(0, this.numSlides - this.numVisibleSlides)
        )
      );
  
      this.$root[0].scrollBy({
        left: direction * this.scrollAmount,
        behavior: "smooth",
      });
  
      this.updateClasses();
    }
  
    updateClasses(basedOnDrag = false) {
      if (this.activeSlide === 0) {
        this.$prev.attr("aria-disabled", "true");
      } else {
        this.$prev.removeAttr("aria-disabled");
      }
  
      if (this.activeSlide === this.numSlides - this.numVisibleSlides) {
        this.$next.attr("aria-disabled", "true");
      } else {
        this.$next.removeAttr("aria-disabled");
      }
  
      this.$slides.removeClass("carousel-visible carousel-active");
      this.$slides
        .slice(this.activeSlide, this.activeSlide + this.numVisibleSlides)
        .addClass("carousel-visible");
      this.$slides.eq(this.activeSlide).addClass("carousel-active");
    }
  
    addMouseDragHandlers() {
      let isMouseDown = false;
      let $dragTarget;
      let startX;
      let scrollLeft;
  
      const dragMove = (e) => {
        if (!$dragTarget || !isMouseDown) return;
        e.preventDefault();
        e.stopPropagation();
  
        /**
         * Thinking: if the drag & drop targets are same it trigers a click event.
         * So add css of 'pointer-events: none;' while dragging to prevent clicks on slides
         */
        $dragTarget.addClass("carousel-dragging");
        const x = e.pageX - this.$root.offset().left;
        const scroll = (x - startX) * 1;
        //this.$root.scrollLeft(scrollLeft - scroll);
        this.$root[0].scrollBy({
            left: -scroll,
            behavior: "smooth",
          });
      };
  
      const dragStop = () => {
        $dragTarget.removeClass("carousel-dragging");
        $dragTarget = undefined;
        $(document).off("mousemove", dragMove);
        $(document).off("mouseup", dragStop);
  
        // Calculate the active slide based on the current scroll position
        // console.log(this.$root.scrollLeft(), "scroll left");
        // console.log(this.slideWidth, "this.slideWidth");
        // console.log(
        //       this.$root.scrollLeft() / this.slideWidth,
        //       "this.$root.scrollLeft() / this.slideWidth" , this.$root.scrollLeft()
        //     );
        setTimeout(() => {
        this.activeSlide = Math.ceil(this.$root.scrollLeft() / this.slideWidth);
        this.updateClasses();
       }, 500);
      };
  
      const dragStart = (e) => {
        $dragTarget = this.$root;
        isMouseDown = true;
  
        /** Caution: if added on mouse down, then it disables click's entirely on slide items
         * add in mousemove instead to prevent clicks if moving
         */
        // $dragTarget.addClass("carousel-dragging");
        startX = e.pageX - this.$root.offset().left;
        scrollLeft = this.$root.scrollLeft();
  
        $(document).on("mousemove", { passive: false }, dragMove);
        $(document).on("mouseup", { passive: false }, dragStop);
        return false;
      };
  
      this.$root.on("mousedown", dragStart);
    }
  
    removeControls() {
      if (this.numSlides === this.numVisibleSlides) {
        this.$prev.hide();
        this.$next.hide();
      }
    }
  }
  
  // addMouseHandlers() {
  //   let isMouseDown = false;
  //   let startX;
  //   let scrollLeft;
  
  //   this.$root
  //     .on("mousedown", (e) => {
  //       isMouseDown = true;
  //       startX = e.pageX - this.$root.offset().left;
  //       scrollLeft = this.$root.scrollLeft();
  //       e.preventDefault();
  //     })
  //     .on("mouseleave", () => {
  //       isMouseDown = false;
  //     })
  //     .on("mouseup", (e) => {
  //       isMouseDown = false;
  //       e.preventDefault();
  //     })
  //     .on("mousemove", (e) => {
  //       if (!isMouseDown) return;
  //       e.preventDefault();
  //       const x = e.pageX - this.$root.offset().left;
  //       const walk = (x - startX) * 1; // scroll-fast
  
  //       // Smooth scroll using scrollBy
  //       this.$root[0].scrollBy({
  //         left: -walk,
  //         behavior: "smooth", // Add smooth behavior
  //       });
  //     });
  // }
  
  // this.$root.on("mousedown", (e) => {
  //   isMouseDown = true;
  //   startX = e.pageX - this.$root.offset().left;
  //   scrollLeft = this.$root.scrollLeft();
  //   console.log(isMouseDown, "mousedown");
  //   e.stopPropagation();
  //   e.preventDefault();
  // });
  
  // this.$root.on("mouseleave mouseup", (e) => {
  //   isMouseDown = false;
  //   if (e.type === "mouseup") {
  //     console.log("stop");
  //     e.stopPropagation();
  //     e.preventDefault();
  //   }
  //   console.log(isMouseDown, "mouseleave mouseup");
  // });
  
  // this.$root.on("mousemove", (e) => {
  //   console.log(!isMouseDown, "mouse move");
  //   if (!isMouseDown) return;
  //   e.preventDefault();
  //   const x = e.pageX - this.$root.offset().left;
  //   const scroll = (x - startX) * 1;
  //   this.$root.scrollLeft(scrollLeft - scroll);
  // });
  
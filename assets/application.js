
// Typing Animation
let desktoptyped = new Typed(".txt-type-desktop", {
  strings: ["What are you looking for?", "Makeup", "Skincare", "Mascara"],
  typeSpeed: 50,
  backSpeed: 30,
  loop: false,
  loopCount: Infinity,
  showCursor: false,
});

$(document).ready(function(){
// Check if Product Page
function isProductPage() {
  return window.location.pathname.includes("/products/");
}

//Declare Variables in a higher scope
const $body = $("body");
let quickTogglebtnId,
  quicksecnId,
  under992 = $(window).width() <= 992 &&
    window.location.href.indexOf("www.heyparadise.com/products/") > -1,
  cartOverlay = $(".cart-overlay"),
  cartContainer = $(".cart-container"),
  cartCloseBtn = $(".cart-slide-close-btn");
var feedbackSlider;
let quickview_sectionid = $("#product_Quick_View").attr("sectionId");

// For lazy Load background For Swatch Variant Image (Metafield)
document.querySelectorAll(".lazy-load-background").forEach(function (element) {
  const dataSrc = element.getAttribute("data-src");
  if (dataSrc) {
    element.style.backgroundImage = `url(${dataSrc})`;
    element.removeAttribute("data-src");
  }
});

// Image Gallery carousel
isProductPage() && Fancybox.bind('[data-fancybox="slideShow"]');

function changeFunction(key, quantity) {
  const formData = JSON.stringify({
    id: key,
    quantity,
    sections: "mini-cart-drawer",
  });
  axios
    .post("/cart/change.js", formData, {
      headers: { "Content-Type": "application/json" },
    })
    .then((res) => {
      $(".cart_item_count").text(res?.data?.item_count);
      res?.data?.item_count > 0
        ? $(".cart_item_count , .checkout-btn-container").show()
        : $(".cart_item_count , .checkout-btn-container").hide();
      fetchCart(res.data);
      if (res.data.item_count == 0) {
        $("#empty-slider-cards").slick();
      }
      $(".checkout-btn-container")
        .find("span")
        .text(`₹${res.data.total_price / 100}`);
    })
    .catch(function (error) {
      console.log(error.toJSON());
    });
}

// For Closing Quick View Slider
const closeQV = () => {
  $(".quick-view-slide-container").removeClass("quick-view-slide-open");
  $(".quickview-overlay").removeClass("quickview-overlay-open");
  $(".account-auth-container").removeClass("toggle-account-container");
  $(".overlay-container").removeClass("overlay-open");
  $(".filter-container").show();
  $("html").removeClass("overflow-hidden");
};

//Open Cart & Overlay
$body.on("click", ".cart-open", function openCart() {
  $("#catagory-section").addClass("d-none");
  cartOverlay.addClass("cart-overlay-open");
  cartContainer.addClass("cart-container-open");
  $(".filter-container").addClass("d-none");
  $("html").addClass("overflow-hidden");
  $("#toastifies").hide(50);
});

//Close Cart & Overlay
$body.on(
  "click",
  ".cart-overlay ,.cart-slide-close-btn",
  function cartDrawerHandler() {
    cartOverlay.removeClass("cart-overlay-open");
    cartContainer.removeClass("cart-container-open");
    $(".order-details-slide").removeClass("order-details-slide-open");
    $(".filter-container").removeClass("d-none");
    $("html").removeClass("overflow-hidden");
  }
);

// Quantity Selector
$body.on(
  "click",
  ".qtybox .btnqty",
  async function changeCartItemQuantity(event) {
    event.preventDefault();
    let qt_container = $(this).parent(".qtybox");
    let qty = parseInt(qt_container.find(".quantity-input").val());
    // let inventoryQty = parseInt(qt_container.find('.quantity-input').attr('inventory'));
    if ($(this).hasClass("qtyplus")) {
      qty++;
    } else {
      if (qty > 1) {
        qty--;
      }
    }
    qty = isNaN(qty) ? 1 : qty;
    //qt_container.find('.quantity-input').val(qty);
    qty >= 10
      ? qt_container.find(".qtyplus").prop("disabled", true)
      : qt_container.find(".qtyplus").prop("disabled", false);
    qty <= 1
      ? qt_container.find(".qtyminus").prop("disabled", true)
      : qt_container.find(".qtyminus").prop("disabled", false);
    let key = qt_container.attr("data-key");
    let index = parseInt(qt_container.attr("data-index"));
    qt_container.find(".showSpinner").css("display", "grid");
    qt_container.find(".quantity-input").hide();
    await changeFunction(key.toString(), qty, index);
  }
);
//$body.on("click", this.closeBtnId, () => this.hideQuickview());

//Remove Item from Cart Drawer
$body.on("click", ".item-close-btn", function closeCartItemQuantity() {
  // $(this).hide();
  // deleteBtn.removeClass('d-none');
  let container = $(this).closest(".cart-item-details-container");
  container.find(".line-item-remove-container").toggleClass("d-none");
  container.find(".cart-item-counter-container").toggleClass("d-none");
});

$body.on("click", ".item-remove-btn", async function removeCartItemQuantity() {
  let data_empty_key = parseInt($(this).attr("cart-data-key"));
  let data_empty_index = parseInt($(this).attr("cart-data-index"));
  let qtbox = $(this).closest(".cart-item-details-container");
  qtbox.find(".showSpinner").css("display", "grid");
  qtbox.find(".quantity-input").hide();
  await changeFunction(data_empty_key.toString(), 0, data_empty_index);
});

//fetch Quick View Data
async function fetchQuickViewData(quickTogglebtnHandle, quickview_sectionid) {
  try {
    const sectionUrl = `/products/${quickTogglebtnHandle}?section_id=${quickview_sectionid}`;
    const response = await axios.get(sectionUrl);
    debugger;
    console.log(response.data, "response");
     await $(".pdp_quick_view").replaceWith(response.data); 
  } catch (error) {
    console.error("Error fetching quick view data:", error);
  }
}

//Open Quick View
$body.on("click", 'div[data-quickviewslide="open"]', async function () {
  quickTogglebtnId = $(this).attr("data-quickviewID");
  let quickTogglebtnHandle = $(this).attr("data-quickviewHandle");
  // Call the fetchQuickViewData function
  debugger;
   await fetchQuickViewData(quickTogglebtnHandle, quickview_sectionid);
   let pdp_MediaData = JSON.parse($(this).attr("pdp_MediaData")),
   sliders = "#quick_view_image_slider",firstImgPos = $(this).attr("firstImgPos");
  if (pdp_MediaData.length == 0) return alert("Add Media Image");
  const $swiperWrapper = $("<div>", {
    class: "swiper-wrapper",
  });
    await pdp_MediaData.forEach((m) => {
      const $imgContainer = $("<div>", {
        class: "quick-view-slide swiper-slide",
      });
      let productMedia;
      if (m.media_type.toLowerCase() === "image") {
        productMedia = $("<img>", {
          src: m.src,
          alt: m.alt,
          mediaId: m.id,
          position: m.position,
          class: "img-fluid asp34 quickMedia",
        });
      } else if (m.media_type.toLowerCase() === "video") {
        productMedia = $("<video>", {
          src: m.sources[0].url,
          type: m.sources[0].mime_type,
          poster: m.preview_image.src,
          alt: m.alt,
          autoplay: true,
          loop: true,
          mediaId: m.id,
          position: m.position,
          class: "img-fluid asp34 quickMedia",
        });
      }
      // Append the img element to the div element
      $imgContainer.append(productMedia);
      $swiperWrapper.append($imgContainer);
    });
    $swiperWrapper.appendTo(sliders);
    feedbackSlider = new Swiper(sliders, {
      slidesPerView: 2,
      spaceBetween: 8,
      freeMode: true,
      navigation: { 
          prevEl: '#quick_view_image_container .quick-view-prev', 
          nextEl: '#quick_view_image_container .quick-view-next',
      },
      pagination: {
        el: ".quick-view-slider-pagination",
        dynamicBullets: true,
      },
    });
    //  feedbackSlider = tns({
    //   container: sliders,
    //   items: 2,
    //   gutter: 8,
    //   slideBy: 2,
    //   loop: false,
    //   controlsPosition: "bottom",
    //   navPosition: "bottom",
    //   mouseDrag: true,
    //   nav: true,
    //   navItems: 4,
    //   preventScrollOnTouch: "auto",
    //   controls: true,
    //   autoplay: false,
    //   autoplayButtonOutput: false,
    //   controlsContainer: "#quick_view_image_container",
    //   responsive: {
    //     0: {
    //       nav: true,
    //     },
    //     992: {
    //       nav: false,
    //     },
    //   },
    // });
    //feedbackSlider.goTo(firstImgPos - 1);
    feedbackSlider.slideTo(firstImgPos - 1, 500, false);
    $(`${sliders}`).fadeIn(100);
    $("#product_Quick_View").addClass("quick-view-slide-open");
    $(".quickview-overlay").addClass("quickview-overlay-open");
    return $("html").addClass("overflow-hidden");
});

  //Change Swatch For QuickView and Product Page
function changeSwatch() {
  debugger;
  let $this = $(this),
  productId = $this.attr("productId"),
  optionValue = $this.attr("value"),
  optionIndex = Number($this.attr("index")),
  imagePosition = Number($this.attr("imagePosition")),
  variantName = $this.attr("variantid"),
  varientPrice = parseInt($this.attr("varientPrice")),
  rackPrice = parseInt($this.attr("rackPrice")),
  isAvailable = String($this.attr("availability")).toLowerCase() === "true",
  sectionParam = $this.attr("section_Id"),
  discountedPercentage = Math.round(
    ((rackPrice - varientPrice) / rackPrice) * 100
  ),
  $container = isProductPage()
    ? $this.closest(".product-details-container")
    : $this.closest(".quick-view-slide-container"),
  $shadeSpan = $container.find(
    isProductPage() ? ".current-shade span" : ".quick-view-current-shade span"
  ),
  $addToBagBtn = $container.find(
    isProductPage() ? ".add-to-bag-btn button" : ".add-quick-bag-btn"
  ),
  $addToNotifier = $container.find(
    isProductPage()
      ? ".add-to-bag-btn div[notifyBtn]"
      : ".add-quick-bag-btn-notify"
  ),
  //$addToNotifier = !(isProductPage()) ?  $container.find( ".add-quick-bag-btn-notify"): false,
  $giftButton = isProductPage()
    ? $container.find("input[data-type='hey-paradise-gifts']")
    : false,
  $priceContainer = $container.find(
    isProductPage() ? ".product-prices" : ".quick-view-price"
  ),
  $swatchContainer = $container.find(
    isProductPage() ? ".product-varient-selector" : ".quick-view-shades"
  ),
  dropname = $container
    .find(`.dropdown-shades[value="${optionValue}"]`)
    .html(),
  currentUrl = window.location.href.replace(/\?variant=\d+/, ""),
  modifiedUrl = currentUrl + `?variant=${optionValue}`;
if (isProductPage()) {
  $(window).width() >= 992 && vertical_slider.goTo(imagePosition - 1);
  mainSlider.goTo(imagePosition - 1);
  $shadeSpan.text(variantName);
  $addToBagBtn.attr("data-product_id", optionValue);
  $priceContainer.find(".selling-price").text(`₹${varientPrice}`);

  if (rackPrice > varientPrice) {
    $priceContainer.find(".old-price").text(`₹${rackPrice}`);
    $priceContainer.find(".discount").text(`${discountedPercentage}% Off`);
    $priceContainer.find(".old-price, .discount").show();
  } else {
    $priceContainer.find(".old-price, .discount").hide();
  }
  $(`.swatch_available[index="${optionIndex}"]`).prop("checked", true);
  $(".dropdown-selected-shade").html(dropname);
  $giftButton && $giftButton.attr("value", optionValue);
  history.replaceState(null, null, modifiedUrl);
} else {
  $(`.quick-view-slider`).fadeOut(
    100,
    function () {
      feedbackSlider.slideTo(imagePosition - 1, 100, true);
      $(`.quick-view-slider`).fadeIn(100);
    }
  );
  
  $shadeSpan.text(variantName);
  $addToBagBtn.attr("data-product_id", optionValue);
  $priceContainer.find(".selling-price").text(`₹${varientPrice}`);
  $swatchContainer
    .find(`.swatch_available[variantId="${variantName}"]`)
    .prop("checked", true);
  $swatchContainer
    .find(`.dropdown-selected-shade[section_Id="${sectionParam}"]`)
    .html(dropname);

  if (rackPrice > varientPrice) {
    $priceContainer.find(".old-price").text(`₹${rackPrice}`);
    $priceContainer.find(".discount").text(`${discountedPercentage}% Off`);
    $priceContainer.find(".old-price, .discount").show();
  } else {
    $priceContainer.find(".old-price, .discount").hide();
  }
}
if (isAvailable) {
  $addToBagBtn.show();
  $addToNotifier.hide();
  //!(isProductPage()) && $addToNotifier.addClass('d-none');
} else {
  $addToBagBtn.hide();
  $addToNotifier.show();
  //!(isProductPage()) && $addToNotifier.removeClass('d-none');
}
}


// Varinat Dropdown
function forDropMobile(string) {
  $(".product-adding-for-mobile").css({
    display: string,
  });
  $(".dropdown-color-name").css({
    "max-width": "80px",
  });
  $(".dropdown-button").css({
    "border-radius": "50px",
  });
}
$body.on("click",".dropdown-button", function () {
  $(".dropdown-content").show();
  $(".shadow-dropdown-icon").addClass("flip-dropdown-icon");
  if (under992) {
    //add
    $(".product-adding-for-mobile").css({
      display: "block",
    });
    $(".dropdown-color-name").css({
      "max-width": "100%",
      overflow: "hidden",
      "text-overflow": "ellipsis",
    });
    $(".dropdown-button").css({
      "border-radius": "8px",
    });
  }
});

$body.on("click", ".dropdown-content li", function () {
  changeSwatch.call(this); // Pass the clicked element to the function
  // var selectedOption = $(this).html();
  // $(".dropdown-selected-shade").html(selectedOption);
  $(".shadow-dropdown-icon").removeClass("flip-dropdown-icon");
  $(".dropdown-content").hide();
  under992 && forDropMobile("flex");
});
// Close the dropdown when clicking outside of it
//    $(document).on("click", function (event) {
//     if (!$(event.target).closest(".custom-dropdown").length) {
//         $(".dropdown-content").hide();
//       $(".shadow-dropdown-icon").removeClass("flip-dropdown-icon");
//       if (under992 ) {
//        forDropMobile('flex');
//       }
//     }
// });


$body.on("change", ".swatch_param :radio", function () {
  changeSwatch.call(this)
});
$body.on("click", ".close_overlay", function () {
  closeQV();
});

// Fetching Cart Content
function fetchCart(data) {
  const { items, sections } = data;
  const $cartWrapper = $(sections["mini-cart-drawer"]).find(
    "#mainCartContainer"
  );
  $("#mainCartContainer").replaceWith($cartWrapper);
}

// Add To Cart Flow
const reUseCart = async (method, varId, qty) => {
  const formData = {
    items: [{ id: varId, quantity: qty ? qty : 1 }],
    sections: "mini-cart-drawer",
  };
  await axios
    .post(method, formData, { headers: { "Content-Type": "application/json" } })
    .then((res) => {
      fetchCart(res.data);
      // Shopify provides a cart.js endpoint
      $.ajax({
        type: "GET",
        url: "/cart.js",
        dataType: "json",
        success: function (cart) {
          $(".cart_item_count").text(cart.item_count);
          cart.item_count > 0
            ? $(".cart_item_count , .checkout-btn-container").show()
            : $(".cart_item_count , .checkout-btn-container").hide();
        },
        error: function (error) {
          console.error("Error fetching cart information:", error);
        },
      });
      $("#toastifies").show(50);
      setTimeout(() => {
        $("#toastifies").hide(50);
      }, 3000);
      return true;
    })
    .catch((error) => {
      return alert(error.message);
    });
};

// Closing Overlay and few Containers
const closeAuth = () => {
  $(
    ".account-auth-container, .overlay-container, .sign-up-container, .sign-up-form-container"
  ).removeClass(
    "toggle-account-container overlay-open sign-up-container-open sign-up-form-container-open"
  );
};

//For Clearing Search Input
$body.on("click", ".search-input-clear", () => {
  $(".search-input").val("");
  $(".search-input-icon").removeClass("d-none");
  $(".search-input-clear").addClass("d-none");
  $(".search-input").focus();
});

//For Search Input Handler
const inputBtnHandler = () => {
  if ($(".search-input").val().length > 0) {
    $(".search-input-icon").addClass("d-none");
    $(".search-input-clear").removeClass("d-none"); // clear btn
    $(".search-suggestions-container").attr("data-suggestion-category", "true");
  } else {
    $(".search-input-icon").removeClass("d-none");
    $(".search-input-clear").addClass("d-none"); // clear btn
    $(".search-suggestions-container").attr(
      "data-suggestion-category",
      "false"
    );
  }
};

//For redirecting from cart drawer to growave widget
function redeemWidget() {
  // Trigger click action on element with class 'ssw-reward-tab-ico'
  $(".ssw-reward-tab-ico").click();
  $(this).attr("isFirst") == "true"
    ? setTimeout(() => {
        $(".ssw-reward-popup-spending-rules").click();
        $(this).attr("isFirst", "false");
      }, 3000)
    : $(".ssw-reward-popup-spending-rules").click();
}

// function redeemWidgetGw(){
//   // Trigger click action on element with class 'ssw-reward-tab-ico'
//    $('.ssw-reward-tab-ico').click();
//   const waitForRedeem = setInterval(() => {
//     if($('.ssw-reward-popup-spending-rules')) {
//       console.log("test")
//       clearInterval(waitForRedeem)
//       $('.ssw-reward-popup-spending-rules').click()
//     }
//   })
// };

//For Toggle Search Container
const toggleSearchContainer = () => {
  $(".search-section-container").toggleClass("d-none");
  $(".transparent-overlay").toggleClass("d-none");
  $(".search-input").focus();
  $("html").toggleClass("overflow-hidden");
};

//for Faq accordion
$body.on("click", ".faq-section", function () {
  let content = $(this).next(".faq-question-container");
  let dropdownIcon = $(this).find(".dropdown-icon");
  $(".faq-question-container").not(content).slideUp(300);
  $(".dropdown-icon").css("transform", "rotateX(0deg)");
  $(".faq-section").css("font-weight", "400");
  content.slideToggle(200, () => {
    if (content.is(":visible")) {
      $(this).css("font-weight", "500");
      dropdownIcon.css("transform", "rotateX(180deg)");
    } else {
      $(this).css("font-weight", "400");
      dropdownIcon.css("transform", "rotateX(0deg)");
    }
  });
});

//ATC Action For Quick view btn and product page
async function handleAddToBagClick(element, isProductButton) {
  let productId = element.attr("data-product_id"),
    productQuantity = element.data("product_quantity");
  let selectShade = isProductButton ? element : element.find(".select-shade");
  selectShade.text("Adding To Bag...");
  // Assuming reUseCart is a promise-returning function
  await reUseCart("/cart/add.js", productId, productQuantity);
  selectShade.text("Add To Bag");
  isProductButton && closeQV();
}

// For Showing Account Container
$body.on("click", ".account-btn", () => {
  if (window.matchMedia("(max-width: 992px)").matches) {
    $(".account-auth-container").toggleClass("toggle-account-container");
    $(".overlay-container").addClass("overlay-open");
    $("html").addClass("overflow-hidden");
  }
});

// For Showing Simply Otp Container For Login/SignUp

$body.on("click", ".account-auth-login-btn", () => {
  $(".account-auth-container").removeClass("toggle-account-container");
  //$('.sign-up-container, .overlay-container').addClass('sign-up-container-open overlay-open');
  $(".sign-up-container").addClass("sign-up-container-open");
  $(".overlay-container").addClass("overlay-open");
  $(".filter-container").hide();
  $("html").addClass("overflow-hidden");
});

//For Showing Bottom Nav Category only in Mobile ( Needs Improvement )

$body.on("click", ".btm-nav-icon.categoryHandle", () => {
  $("#catagory-section").toggleClass("d-none");
  $("html").toggleClass("overflow-hidden");
});

//Closing Overlay and few Containers
$body.on(
  "click",
  ".overlay-container, .auth-close-btn, .sign-up-container-close-btn, .sign-up-form-close-btn",
  () => closeAuth()
);
$body.on(
  "click",
  ".overlay-container, .auth-close-btn, .sign-up-container-close-btn, .sign-up-form-close-btn",
  () => {
    closeAuth();
  }
);
$body.on("click", ".add-to-bag-btn button",
function () {
  handleAddToBagClick($(this), true);
}
);

$body.on("click", "div[atc_cta='product']",
function () {
  handleAddToBagClick($(this), false);
}
);
$(".search-input").on("input", inputBtnHandler);
$(".search-input").on("input", inputBtnHandler);
$(".search-close-btn, .search__input, #search_mobile,.m-search-box,.transparent-overlay").on("click", toggleSearchContainer);
});
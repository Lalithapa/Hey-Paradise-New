/** util functions */
function storeToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

function getFromLocalStorage(key) {
  const item = localStorage.getItem(key);
  return item;
}

function removeFromLocalStorage(key) {
  localStorage.removeItem(key);
}

function clearLocalStorage() {
  localStorage.clear();
}

/**
* Function to update the array
* Append a product handle to recently viewed array in local storage
* New handles are added in front and old handles are removed from last
* If a product handle already exists in the array it is moved to the front.
*/ 
function addOrUpdateObject(productsArray, maxSize, recentlyViewed) {
  const copy = [...productsArray];
  // Check if the array already contains an object with the specified productHandle
  const existingIndex = copy.findIndex(
    (obj) => obj.productHandle === recentlyViewed.productHandle,
  );

  // If the object doesn't exist, add a new one to the front
  if (existingIndex === -1) {
    // If the array is full, remove the last item
    if (copy.length === maxSize) {
      copy.pop();
    }

    // Add the new object to the front
    copy.unshift(recentlyViewed);
  } else if (existingIndex !== 0) {
    // If the existing object is not at the front, move it to the front
    const existingObject = copy.splice(existingIndex, 1)[0];
    copy.unshift(existingObject);
  }
  return copy;
}

/** 
* Extracts some properties from json product object, we can aslo stringify entice product object if need arises 
*/
function getViewedProduct(productJson) {
  const productHandle = productJson.handle ;
  const productUrl = `${window.Shopify.routes.root}products/${productJson.handle}`;
  const productFeaturedImageUrl = productJson.featured_image;
  const title = productJson.title;
  const vendor = productJson.vendor;
  const price = productJson.price;
  const compareAtPrice = productJson.compare_at_price;

  return viewedProduct = {
    productHandle,
    productUrl,
    productFeaturedImageUrl,
    title,
    vendor,
    price,
    compareAtPrice
  };
}

/**
* 1) get current local storage array
* 2) append current product to array
* 3) save new array to local storage
*/
function saveRecentlyViewedToLocalStorage(key, recentlyViewed) {
  const prevArr = JSON.parse(getFromLocalStorage(key)) || [];
  const newArr = addOrUpdateObject(prevArr, 4, recentlyViewed);
  storeToLocalStorage(key, JSON.stringify(newArr));
  const newStorage = JSON.parse(getFromLocalStorage(key)) || [];
}

/**
* If the local storage is initially empty, init it with the static collection.
*/
function initLocalStorageWithCollection(key, collectionJson) {
  const prevStorage = JSON.parse(getFromLocalStorage(key)) || [];
  if (prevStorage.length === 0) {
    for (let index = collectionJson.length-1; index >= 0; index-=1) {
      const productJson = collectionJson[index];
      const viewedProduct = getViewedProduct(productJson);
      saveRecentlyViewedToLocalStorage(key, viewedProduct);
    }
  }
}
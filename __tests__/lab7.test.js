describe('Basic user flow for Website', () => {
  // First, visit the lab 7 website
  beforeAll(async () => {
    await page.goto('https://cse110-sp25.github.io/CSE110-Shop/');
  });

  // Each it() call is a separate test
  // Here, we check to make sure that all 20 <product-item> elements have loaded
  it('Initial Home Page - Check for 20 product items', async () => {
    console.log('Checking for 20 product items...');

    // Query select all of the <product-item> elements and return the length of that array
    const numProducts = await page.$$eval('product-item', (prodItems) => {
      return prodItems.length;
    });

    // Expect there that array from earlier to be of length 20, meaning 20 <product-item> elements where found
    expect(numProducts).toBe(20);
  });

  // Check to make sure that all 20 <product-item> elements have data in them
  // We use .skip() here because this test has a TODO that has not been completed yet.
  // Make sure to remove the .skip after you finish the TODO. 
  it('Make sure <product-item> elements are populated', async () => {
    console.log('Checking to make sure <product-item> elements are populated...');

    // Start as true, if any don't have data, swap to false
    let allArePopulated = true;

    // Query select all of the <product-item> elements
    const prodItemsData = await page.$$eval('product-item', prodItems => {
      return prodItems.map(item => {
        // Grab all of the json data stored inside
        return data = item.data;
      });
    });

    console.log(`Checking product item 1/${prodItemsData.length}`);

    // Make sure the title, price, and image are populated in the JSON
    /*firstValue = prodItemsData[0];
    if (firstValue.title.length == 0) { allArePopulated = false; }
    if (firstValue.price.length == 0) { allArePopulated = false; }
    if (firstValue.image.length == 0) { allArePopulated = false; }*/

    // Expect allArePopulated to still be true
    
    /**
     **** TODO - STEP 1 ****
     * Right now this function is only checking the first <product-item> it found, make it so that
     it checks every <product-item> it found
     * Remove the .skip from this it once you are finished writing this test.
     */
    for (let i = 0; i < prodItemsData.length; i++) {
      let item = prodItemsData[i];
      if (item.title.length === 0 || item.price.length === 0 || item.image.length === 0) {
        allArePopulated = false;
        console.log(`Item ${i} missing data`);
      }
    }
    expect(allArePopulated).toBe(true);
    
  }, 10000);

  // Check to make sure that when you click "Add to Cart" on the first <product-item> that
  // the button swaps to "Remove from Cart"
  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button...');

    /**
     **** TODO - STEP 2 **** 
     * Query a <product-item> element using puppeteer ( checkout page.$() and page.$$() in the docs )
     * Grab the shadowRoot of that element (it's a property), then query a button from that shadowRoot.
     * Once you have the button, you can click it and check the innerText property of the button.
     * Once you have the innerText property, use innerText.jsonValue() to get the text value of it
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
    // 抓第一個 product-item
    const prodItem = await page.$('product-item');

    // 拿到 shadowRoot
    const shadowRoot = await prodItem.getProperty('shadowRoot');
    
    // 在 shadowRoot 裡找到按鈕
    const button = await shadowRoot.$('button');

    // 點一下按鈕
    await button.click();

    // 取得按鈕的 innerText
    const innerTextProp = await button.getProperty('innerText');
    const innerText = await innerTextProp.jsonValue();

    // 確認文字變成 "Remove from Cart"
    expect(innerText).toBe('Remove from Cart');
  }, 2500);

  // Check to make sure that after clicking "Add to Cart" on every <product-item> that the Cart
  // number in the top right has been correctly updated
  it('Checking number of items in cart on screen', async () => {
    console.log('Checking number of items in cart on screen...');

    /**
     **** TODO - STEP 3 **** 
     * Query select all of the <product-item> elements, then for every single product element
       get the shadowRoot and query select the button inside, and click on it.
     * Check to see if the innerText of #cart-count is 20
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
    
    // 1. 抓出所有 product-item
    const prodItems = await page.$$('product-item');

    for (const item of prodItems) {
      const shadowRootHandle = await item.getProperty('shadowRoot');
      const buttonHandle = await shadowRootHandle.evaluateHandle(root => root.querySelector('button'));
  
      // 確認 innerText 是 "Add to Cart"
      const innerText = await buttonHandle.evaluate(el => el.innerText);
  
      if (innerText === 'Add to Cart') {
        await buttonHandle.click();
      }
    }

    const cartCount = await page.$eval('#cart-count', el => el.innerText);
    expect(cartCount).toBe("20");

  }, 30000);

  // Check to make sure that after you reload the page it remembers all of the items in your cart
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');

    /**
     **** TODO - STEP 4 **** 
     * Reload the page, then select all of the <product-item> elements, and check every
       element to make sure that all of their buttons say "Remove from Cart".
     * Also check to make sure that #cart-count is still 20
     * Remember to remove the .skip from this it once you are finished writing this test.
     */

    // 1. 先一次性把所有 <product-item> 的 button 都点击成 Remove
    await page.$$eval('product-item', items => {
      items.forEach(item => {
        const btn = item.shadowRoot.querySelector('button');
        if (btn.innerText === 'Add to Cart') btn.click();
      });
    });

    // 2. reload 等所有网络请求停下（确保 index.js 把 localStorage 读回去了）
    await page.reload({ waitUntil: 'networkidle0' });

    // 3. 等到 #cart-count 真正更新到 "20"
    await page.waitForFunction(
      () => document.querySelector('#cart-count').innerText === '20'
    );

    // 4. 再检查一次：所有按钮都该是 Remove from Cart
    await page.$$eval('product-item', items => {
      items.forEach((item, i) => {
        const text = item.shadowRoot.querySelector('button').innerText;
        if (text !== 'Remove from Cart') {
          throw new Error(`Item ${i} button is "${text}", expected Remove from Cart`);
        }
      });
    });

    // 5. 最后再断言右上角数字
    const cartCount = await page.$eval('#cart-count', el => el.innerText);
    expect(cartCount).toBe('20');

  }, 50000);

  // Check to make sure that the cart in localStorage is what you expect
  it('Checking the localStorage to make sure cart is correct', async () => {

    /**
     **** TODO - STEP 5 **** 
     * At this point the item 'cart' in localStorage should be 
       '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]', check to make sure it is
     * Remember to remove the .skip from this it once you are finished writing this test.
    */
    let cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart') || '[]')
    );
    if (cart.length !== 20) {
      // 把所有 product-item 再掃一遍，確保全部在 cart 裡
      const items = await page.$$('product-item');
      for (const item of items) {
        const root = await item.getProperty('shadowRoot');
        const btn  = await root.$('button');
        const txt  = await (await btn.getProperty('innerText')).jsonValue();
        if (txt === 'Add to Cart') await btn.click();
      }
    }
  
    // ----------- 等 cart 填到 20 -----------  
    await page.waitForFunction(() => {
      try {
        const arr = JSON.parse(localStorage.getItem('cart') || '[]');
        return Array.isArray(arr) && arr.length === 20;
      } catch { return false; }
    });
  
    // ----------- 斷言內容 -----------  
    cart = await page.evaluate(() => JSON.parse(localStorage.getItem('cart')));
    const expected = Array.from({ length: 20 }, (_, i) => i + 1);   // 1–20
    expect(cart).toEqual(expected);

  },30000);

  // Checking to make sure that if you remove all of the items from the cart that the cart
  // number in the top right of the screen is 0
  it('Checking number of items in cart on screen after removing from cart', async () => {
    console.log('Checking number of items in cart on screen...');

    /**
     **** TODO - STEP 6 **** 
     * Go through and click "Remove from Cart" on every single <product-item>, just like above.
     * Once you have, check to make sure that #cart-count is now 0
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
    // ① 先抓出全部 product-item
    const prodItems = await page.$$('product-item');

    // ② 只點文字還是 “Remove from Cart” 的按鈕
    for (const item of prodItems) {
      const root = await item.getProperty('shadowRoot');
      const btn  = await root.$('button');
      const txt  = await (await btn.getProperty('innerText')).jsonValue();

      if (txt === 'Remove from Cart')               // 只移除，避免又加回去
        await btn.click();
    }

    /* ③ 等到右上角數字真的歸零，再作斷言                     */
    await page.waitForFunction(
      () => document.querySelector('#cart-count').innerText === '0'
    );

    const cartCount = await page.$eval('#cart-count', el => el.innerText);
    expect(cartCount).toBe('0');

  }, 30000);

  // Checking to make sure that it remembers us removing everything from the cart
  // after we refresh the page
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');

    /**
     **** TODO - STEP 7 **** 
     * Reload the page once more, then go through each <product-item> to make sure that it has remembered nothing
       is in the cart - do this by checking the text on the buttons so that they should say "Add to Cart".
     * Also check to make sure that #cart-count is still 0
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
    // 重新載入頁面
    await page.reload();

    // 抓出所有 <product-item>
    const prodItems = await page.$$('product-item');

    let allButtonsReset = true;

    for (let i = 0; i < prodItems.length; i++) {
      const shadowRoot = await prodItems[i].getProperty('shadowRoot');
      const button = await shadowRoot.$('button');
      const innerTextProp = await button.getProperty('innerText');
      const innerText = await innerTextProp.jsonValue();

      if (innerText !== 'Add to Cart') {
        allButtonsReset = false;
        console.log(`❌ Product ${i} button not reset: ${innerText}`);
      }
    }

  expect(allButtonsReset).toBe(true);

  // 再次確認購物車數字是 0
  const cartCount = await page.$eval('#cart-count', el => el.innerText);
  expect(cartCount).toBe("0");

  }, 10000);

  // Checking to make sure that localStorage for the cart is as we'd expect for the
  // cart being empty
  it('Checking the localStorage to make sure cart is correct', async () => {
    console.log('Checking the localStorage...');

    /**
     **** TODO - STEP 8 **** 
     * At this point he item 'cart' in localStorage should be '[]', check to make sure it is
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
    // 從頁面中取得 localStorage 裡的 cart 值
    const cart = await page.evaluate(() => {
      return localStorage.getItem('cart');
    });

    // 應該要是一個空的陣列
    expect(cart).toBe('[]');
  });
});

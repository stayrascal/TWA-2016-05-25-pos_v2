function findItemByBarcode(items, barcode) {
    return items.find(item => {
        return item.barcode === barcode;
    });
}

function parse(inputs, format) {
    var result = [];
    inputs.forEach(input => {
        var barcode = input.split(format)[0];
        var quantity = input.split(format)[1] || 1;
        result.push({barcode: barcode, quantity: parseInt(quantity)})
    });
    return result;
}

function generateItems(inputs, format) {
    var result = [];
    var itemsWithBarcodeAndQuantity = parse(inputs, format);
    itemsWithBarcodeAndQuantity.forEach(item => {
        var existItem = findItemByBarcode(result, item.barcode);
        if (existItem) {
            existItem.quantity += item.quantity;
        } else {
            result.push(item);
        }
    });
    return result;
}

function generateBasicItems(itemRepository, items) {
    var result = [];
    items.forEach(originItem => {
        var item = findItemByBarcode(itemRepository, originItem.barcode);
        result.push(Object.assign({}, item, originItem));
    });
    return result;
}

function calculateSubtotal(items) {
    return items.map(item => {
        return Object.assign({
            subTotal: item.price * item.quantity,
            savingCost: 0,
            freeQuantity: 0
        }, item);
    })
}

var promotionStrategy = {
    'BUY_TWO_GET_ONE_FREE': function (promotion, item) {
        //method A
        /*var itemCopy = Object.assign(item);
        promotion.barcodes.forEach(barcode => {
            if (barcode === itemCopy.barcode) {
                itemCopy.freeQuantity = parseInt(itemCopy.quantity / 3);
                itemCopy.savingCost = itemCopy.freeQuantity * itemCopy.price;
            }
        });
        return itemCopy;*/

        // method B
        promotion.barcodes.forEach(barcode => {
            if (barcode === item.barcode) {
                item.freeQuantity = parseInt(item.quantity / 3);
                item.savingCost = item.freeQuantity * item.price;
            }
        });

        // method C
        /*item.freeQuantity = parseInt(item.quantity / 3);
        item.savingCost = item.freeQuantity * item.price;*/
    }
};

function applyPromotionsOnCartItems(items, promotions) {
    //method A
    /*var result = [];
    promotions.forEach(promotion => {
        items.forEach(item => {
            result.push(promotionStrategy[promotion.type](promotion, item));
        });
    });
    return result;*/

    //method B
    items.map(item => {
        promotions.forEach(promotion => {
            promotionStrategy[promotion.type](promotion, item);
        });
    });

    //method C
    /*promotions.forEach(promotion => {
        promotion.barcodes.forEach(barcode => {
            var item = findItemByBarcode(items, barcode);
            if (item){
                promotionStrategy[promotion.type](promotion, item);
            }
        })
    });*/
}

function calculateCostInfo(items) {
    var resultObj = {totalPrice: 0.0, totalSavingCost: 0.0, totalPriceAfterPromotion: 0.0};
    items.forEach(item => {
        resultObj.totalPrice += item.subTotal;
        resultObj.totalSavingCost += item.savingCost;
    });
    resultObj.totalPriceAfterPromotion = resultObj.totalPrice - resultObj.totalSavingCost;
    return resultObj;
}

function calculateActualSubTotal(items) {
    return items.map(item => {
        return Object.assign({
            actualSubTotal: item.subTotal - item.savingCost
        }, item);
    });
}

function getFreeItems(cartItems) {
    return cartItems.filter(item => {
        return item.freeQuantity > 0;
    });
}

function getNowDateMessage() {
    var dateDigitToString = function (num) {
        return num < 10 ? '0' + num : num;
    };

    var currentDate = new Date(),
        year = dateDigitToString(currentDate.getFullYear()),
        month = dateDigitToString(currentDate.getMonth() + 1),
        date = dateDigitToString(currentDate.getDate()),
        hour = dateDigitToString(currentDate.getHours()),
        minute = dateDigitToString(currentDate.getMinutes()),
        second = dateDigitToString(currentDate.getSeconds());
    return year + '年' + month + '月' + date + '日 ' + hour + ':' + minute + ':' + second;
}

function buildHeadMessage() {
    return `***<没钱赚商店>购物清单***\n打印时间：${getNowDateMessage()}\n`;
}

function buildCartItemsMessage(items, decimalDigits) {
    var expectText = '----------------------\n';
    items.forEach(item => expectText += `名称：${item.name}，数量：${item.quantity}${item.unit}，单价：${item.price.toFixed(decimalDigits)}(元)，小计：${item.actualSubTotal.toFixed(decimalDigits)}(元)\n`);
    return expectText;
}


function buildFreeCartItemMessage(freeItems) {
    var expectText = '';
    if (freeItems.length > 0) {
        expectText += '----------------------\n挥泪赠送商品：\n';
        freeItems.forEach(item => expectText += `名称：${item.name}，数量：${item.freeQuantity}${item.unit}\n`);
    }
    return expectText;
}

function buildFooterMessage(costInfo, decimalDigits) {
    var expectText = '----------------------\n';
    expectText += `总计：${costInfo.totalPriceAfterPromotion.toFixed(decimalDigits)}(元)\n`;
    expectText += `节省：${costInfo.totalSavingCost.toFixed(decimalDigits)}(元)\n`;
    expectText += '**********************';
    return expectText
}

function printReceiptMessage(items, freeItems, costInfo, decimalDigits = 2) {
    var expectText = buildHeadMessage();
    expectText += buildCartItemsMessage(items, decimalDigits);
    expectText += buildFreeCartItemMessage(freeItems);
    expectText += buildFooterMessage(costInfo, decimalDigits);
    console.log(expectText);
}

function printInventory(inputs) {
    var itemRepository = loadAllItems();
    var promotions = loadPromotions();

    var items = generateItems(inputs, '-');
    var basicItems = generateBasicItems(itemRepository, items);

    var itemsWithSubtotal = calculateSubtotal(basicItems);

    //itemsWithSubtotal = applyPromotionsOnCartItems(itemsWithSubtotal, promotions);
    applyPromotionsOnCartItems(itemsWithSubtotal, promotions);


    var costInfo = calculateCostInfo(itemsWithSubtotal);
    var freeItems = getFreeItems(itemsWithSubtotal);
    var itemsWithActualSubTotal = calculateActualSubTotal(itemsWithSubtotal);

    printReceiptMessage(itemsWithActualSubTotal, freeItems, costInfo);
}

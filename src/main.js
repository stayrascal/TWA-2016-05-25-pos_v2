function findItemByBarcode(items, barcode) {
    return items.find(function (item) {
        return item.barcode === barcode;
    });
}

function parseBarcodes(inputs, format) {
    var result = [];
    inputs.forEach(function (input) {
        var barcode = input.split(format)[0];
        var quantity = input.split(format)[1] || 1;
        var existBarcodeInfo = findItemByBarcode(result, barcode);
        if (!existBarcodeInfo) {
            existBarcodeInfo = Object.assign({
                barcode: barcode,
                quantity: quantity
            });
            result.push(existBarcodeInfo);
        } else {
            existBarcodeInfo.quantity += quantity;
        }
    });
    return result;
}

function parseCartItems(items, barcodesInfo) {
    var result = [];
    barcodesInfo.forEach(function (barcodeInfo) {
        var item = findItemByBarcode(items, barcodeInfo.barcode);
        result.push(Object.assign(item, barcodeInfo));
    });
    return result;
}

function calculateSubtotal(items) {
    return items.map(function (item) {
        return Object.assign({
            subTotal: item.price * item.quantity,
            savingCost: 0,
            freeQuantity: 0
        }, item);
    })
}

function discountItemByPromotion(item, promotion){
    if (promotion.type === 'BUY_TWO_GET_ONE_FREE') {
        promotion.barcodes.forEach(function (barcode) {
            if (barcode === item.barcode) {
                item.freeQuantity = parseInt(item.quantity / 3);
                item.savingCost = item.freeQuantity * item.price;
            }
        });
    }
}

function discountItems(items, promotions) {
    promotions.forEach(function (promotion) {
        items.forEach(function (item) {
            //promotion.apply(item);
            discountItemByPromotion(item, promotion);
        });
    });
}

function calculateCostInfo(items) {
    var result = {};
    var totalPrice = 0.0;
    var totalSavingCost = 0.0;
    items.forEach(function (item) {
        totalPrice += item.subTotal;
        totalSavingCost += item.savingCost;
    });
    result['totalPrice'] = totalPrice;
    result['totalSavingCost'] = totalSavingCost;
    result['totalPriceAfterPromotion'] = totalPrice - totalSavingCost;
    return result;
}


function getFreeItems(cartItems) {
    return cartItems.filter(function (item) {
        return item.freeQuantity > 0;
    });
}

function getNowDateMessage() {
    var  dateDigitToString = function (num) {
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

function printMessage(items, freeItems, costInfo, decimalDigits = 2) {
    var expectText = '***<没钱赚商店>购物清单***\n';
    expectText += `打印时间：${getNowDateMessage()}\n`;
    expectText += '----------------------\n';
    items.forEach(function (item) {
        expectText += `名称：${item.name}，数量：${item.quantity}${item.unit}，单价：${item.price.toFixed(decimalDigits)}(元)，小计：${(item.subTotal - item.savingCost).toFixed(decimalDigits)}(元)\n`
    });
    expectText += '----------------------\n';
    if (freeItems.length > 0) {
        expectText += '挥泪赠送商品：\n';
        freeItems.forEach(function (item) {
            expectText += `名称：${item.name}，数量：${item.freeQuantity}${item.unit}\n`
        });
    }
    expectText += '----------------------\n';
    expectText += `总计：${costInfo.totalPriceAfterPromotion.toFixed(decimalDigits)}(元)\n`;
    expectText += `节省：${costInfo.totalSavingCost.toFixed(decimalDigits)}(元)\n`;
    expectText += '**********************';
    console.log(expectText);
}
function printInventory(inputs) {
    var repositoy = loadAllItems();
    var promotions = loadPromotions();

    var itemBarcodes = parseBarcodes(inputs, '-');
    var cartItems = parseCartItems(repositoy, itemBarcodes);
    cartItems = calculateSubtotal(cartItems);
    discountItems(cartItems, promotions);

    var costInfo = calculateCostInfo(cartItems);
    var freeItems = getFreeItems(cartItems);
    printMessage(cartItems, freeItems, costInfo);
}

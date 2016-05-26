function findItemByBarcode(items, barcode) {
    return items.find(item => {
        return item.barcode === barcode;
    });
}

function generateBarcodeInfo(barcode, quantity) {
    return Object.assign({
        barcode: barcode,
        quantity: quantity
    });
}

function parse(inputs, format) {
    var result = [];
    inputs.forEach(input => {
        var barcode = input.split(format)[0];
        var quantity = input.split(format)[1] || 1;
        result.push(generateBarcodeInfo(barcode, quantity))
    });
    return result;
}

function parseBarcodesInfo(inputs, format) {
    var result = [];
    var barcodesInfo = parse(inputs, format);
    barcodesInfo.forEach(barcodeInfo => {
        var existBarcodeInfo = findItemByBarcode(result, barcodeInfo.barcode);
        if (existBarcodeInfo) {
            existBarcodeInfo.quantity += barcodeInfo.quantity;
        } else {
            result.push(barcodeInfo);
        }
    });
    return result;
}

function generateBasicCartItems(items, barcodesInfo) {
    var result = [];
    barcodesInfo.forEach(barcodeInfo => {
        var item = findItemByBarcode(items, barcodeInfo.barcode);
        result.push(Object.assign(item, barcodeInfo));
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
        promotion.barcodes.forEach(barcode => {
            if (barcode === item.barcode) {
                item.freeQuantity = parseInt(item.quantity / 3);
                item.savingCost = item.freeQuantity * item.price;
            }
        });
    },
};

function discountItems(items, promotions) {
    promotions.forEach(promotion => {
        items.forEach(item => {
            promotionStrategy[promotion.type](promotion, item);
        });
    });
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

function printReciptMessage(items, freeItems, costInfo, decimalDigits = 2) {
    var expectText = buildHeadMessage();
    expectText += buildCartItemsMessage(items, decimalDigits);
    expectText += buildFreeCartItemMessage(freeItems);
    expectText += buildFooterMessage(costInfo, decimalDigits);
    console.log(expectText);
}

function printInventory(inputs) {
    var allItems = loadAllItems();
    var promotions = loadPromotions();

    var barcodesInfo = parseBarcodesInfo(inputs, '-');
    var basicartItems = generateBasicCartItems(allItems, barcodesInfo);

    var cartItemsWithSubtotal = calculateSubtotal(basicartItems);
    discountItems(cartItemsWithSubtotal, promotions);

    var costInfo = calculateCostInfo(cartItemsWithSubtotal);
    var freeItems = getFreeItems(cartItemsWithSubtotal);
    var cartItemsWithActualSubTotal = calculateActualSubTotal(cartItemsWithSubtotal);
    printReciptMessage(cartItemsWithActualSubTotal, freeItems, costInfo);
}

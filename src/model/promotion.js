function Promotion(type, barcodes) {
    this.type = type;
    this.barcodes = barcodes || [];
}

//Promotion.prototype.apply = function (item) {
//    if (this.type === 'BUY_TWO_GET_ONE_FREE') {
//        this.barcodes.forEach(function (barcode) {
//            if (barcode === item.barcode) {
//                item.freeQuantity = parseInt(item.quantity / 3);
//                item.savingCost = item.freeQuantity * item.price;
//            }
//        });
//    }
//};

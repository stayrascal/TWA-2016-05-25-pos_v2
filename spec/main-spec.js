describe('pos', function () {
    var allItems, inputs, dateDigitToString;

    beforeEach(function () {
        allItems = loadAllItems();
        inputs = [
            'ITEM000001',
            'ITEM000001',
            'ITEM000001',
            'ITEM000001',
            'ITEM000001',
            'ITEM000003-2',
            'ITEM000005',
            'ITEM000005',
            'ITEM000005'
        ];
        dateDigitToString = function (num) {
            return num < 10 ? '0' + num : num;
        };
    });

    it('should print correct text', function () {

        spyOn(console, 'log');

        printInventory(inputs);

        var currentDate = new Date(),
            year = dateDigitToString(currentDate.getFullYear()),
            month = dateDigitToString(currentDate.getMonth() + 1),
            date = dateDigitToString(currentDate.getDate()),
            hour = dateDigitToString(currentDate.getHours()),
            minute = dateDigitToString(currentDate.getMinutes()),
            second = dateDigitToString(currentDate.getSeconds()),
            formattedDateString = year + '年' + month + '月' + date + '日 ' + hour + ':' + minute + ':' + second;

        var expectText =
            '***<没钱赚商店>购物清单***\n' +
            '打印时间：' + formattedDateString + '\n' +
            '----------------------\n' +
            '名称：雪碧，数量：5瓶，单价：3.00(元)，小计：12.00(元)\n' +
            '名称：荔枝，数量：2斤，单价：15.00(元)，小计：30.00(元)\n' +
            '名称：方便面，数量：3袋，单价：4.50(元)，小计：9.00(元)\n' +
            '----------------------\n' +
            '挥泪赠送商品：\n' +
            '名称：雪碧，数量：1瓶\n' +
            '名称：方便面，数量：1袋\n' +
            '----------------------\n' +
            '总计：51.00(元)\n' +
            '节省：7.50(元)\n' +
            '**********************';

        expect(console.log).toHaveBeenCalledWith(expectText);
    });

    it('should return item when find item in item list', function(){
        var barcode = 'ITEM000001';

        var returnItem = findItemByBarcode(allItems, barcode);

        expect(returnItem.barcode).toEqual(barcode);
    });

    it('should return item list with barcode and quantity', function(){
        var returnItem = parse(inputs, '-');

        expect(returnItem.length).toEqual(inputs.length);
        expect(returnItem[0].barcode).toEqual(inputs[0]);
        expect(returnItem[0].quantity).toEqual(1);
        expect(returnItem[5].quantity).toEqual(2);
    });

    it('should merge item list and add the quantity', function(){
        var expectFirstItem = {
            barcode:'ITEM000001',
            quantity: 5
        };
        var returnItems = generateItems(inputs, '-');

        expect(returnItems.length).toEqual(3);
        expect(returnItems[0]).toEqual(expectFirstItem);
    });

    it('should return item list and the item have name property', function(){
        var mergeItems = generateItems(inputs, '-');
        var expectFirstItem = {
            barcode:'ITEM000001',
            name: '雪碧',
            unit: '瓶',
            price: 3,
            quantity: 5
        };

        var returnItems = generateBasicItems(allItems, mergeItems);

        expect(returnItems.length).toEqual(3);
        expect(returnItems[0]).toEqual(expectFirstItem);
    });
});

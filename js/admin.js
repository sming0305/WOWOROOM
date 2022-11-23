const orderPageBody = document.querySelector("#orderPage-body");
const orderDeleteAll = document.querySelector(".discardAllBtn");

let orderUrl = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`
let orderList = [];
let chartData = [];
let chartInfo = [];

init()

// get訂單列表
function getOrderList() {
    axios.get(orderUrl, {
        headers: {
            Authorization: token
        }
    })
        .then(function (response) {
            orderList = response.data.orders
            console.log(response);
            renderOrderList(orderList)
            sortOrderList();
            renderChart()

        }).catch(function (error) {
            console.log(error);
        })
}

// 渲染訂單列表function
function renderOrderList(dataBase) {


    if (dataBase.length === 0) {
        orderPageBody.innerHTML = `
        <tr>
          <td>目前無相關訂單資料。</td>
        </tr>`;
        return;
    }

    let str = ``;
    dataBase.forEach(function (i) {

        let productStr = ``;
        let No = 1;

        i.products.forEach(function (i) {
            productStr += `<p class="fs--6_5">${No} . ${i.title} * ${i.quantity}</p>`;
            No += 1;
        })

        let paid = i.paid === false ? "未處理" : "已處理";

        let time = new Date(parseInt(i.createdAt) * 1000).toLocaleString().replace(/:\d{1,2}$/, " ").replace(/\//g, "-");
        let space_position = time.indexOf(" ");
        let date = time.slice(0, space_position);


        str += `<tr class="fs--7">
        <td>${i.id}</td>
        <td>
            <p>${i.user.name}</p>
            <p>${i.user.tel}</p>
        </td>
        <td>${i.user.address}</td>
        <td>${i.user.email}</td>
        <td>
            ${productStr}
        </td>
        <td>${date}</td>
        <td class="orderStatus">
            <a href="#" class="paid" data-id="${i.id}">${paid}</a>
        </td>
        <td>
            <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${i.id}">
        </td>
    </tr>`;
    })


    orderPageBody.innerHTML = str;

}

// 修改訂單狀態 & 刪除
orderPageBody.addEventListener("click", function (e) {
    e.preventDefault();
    let target = e.target;
    let orderId = e.target.getAttribute("data-id")
    let currentPaid = orderList[orderList.findIndex(i => i.id === orderId)].paid;
    let sendPaid = currentPaid === false ? true : false;

    let paidData = {
        "data": {

        }
    }

    if (target.className === "paid") {
        paidData.data.id = orderId;
        paidData.data.paid = sendPaid;


        axios.put(orderUrl, paidData, { headers: { Authorization: token } })
            .then(function (response) {
                orderList = response.data.orders;
                renderOrderList(orderList);
            }).catch(function (error) {
                console.log(error);
            })
    }


    if (target.className === "delSingleOrder-Btn") {
        axios.delete(`${orderUrl}/${orderId}`, { headers: { Authorization: token } })
            .then(function (response) {
                console.log(response);
                orderList = response.data.orders;
                renderOrderList(orderList);
                sortOrderList()
                renderChart()
            }).catch(function (error) {
                console.log(error);
            })
    }


})

// 刪除全部訂單
orderDeleteAll.addEventListener("click", function (e) {
    let target = e.target;
    if (target.textContent === "清除全部訂單") {
        axios.delete(orderUrl, { headers: { Authorization: token } })
            .then(function (response) {
                orderList = response.data.orders;
                renderOrderList(orderList);
                sortOrderList();
                renderChart()
            }).catch(function (error) {
                console.log(error);
            })
    }
})


// 整理所有顧客的訂單品項 & 金額，合計後做排序 (整理結果 chartInfo)。
function sortOrderList() {

    // 刪除客戶訂單重新計算時，chartInfo必須是乾淨的重新整理
    chartInfo = [];

    //撈出所有顧客購買的商品訂單放到一個陣列裡
    let allCustomerOrder = []

    orderList.forEach(function (i) {
        i.products.forEach(function (i) {
            allCustomerOrder.push(i);
        })
    })

    //把所有商品合計為唯一項目，並統計其銷售總金額至物件內
    let allCustomerOrderInfoObj = {};
    allCustomerOrder.forEach(function (i) {
        allCustomerOrderInfoObj[i.title] === undefined ?
            allCustomerOrderInfoObj[i.title] = i.price * i.quantity :
            allCustomerOrderInfoObj[i.title] += i.price * i.quantity
    });

    // 利用Object.keys取得所有的銷售出商品名稱陣列 (已合併)
    let cleanOrderItemArr = Object.keys(allCustomerOrderInfoObj);


    //整理成C3.js圖表所需要的格式
    cleanOrderItemArr.forEach(function (i) {
        let item = [i, allCustomerOrderInfoObj[i]];
        chartInfo.push(item);
    });


    // 從營收最高到低排好圖表資料
    chartInfo.sort(function (a, b) {
        if (a[1] > b[1]) return -1;
        if (a[1] < b[1]) return 1;
        return 0;
    });

    // 計算完畢後清空，重新計算時才會正確
    allCustomerOrder = [];
    allCustomerOrderInfoObj = {};
}

// 整理"全品項營收比重，類別含四項，篩選出前三名營收品項，其他 4~8 名都統整為「其它」" (整理結果 chartData)。
function renderChart() {

    // 刪除客戶訂單重新計算時，chartData必須是乾淨的重新整理
    chartData = [];

    // 排第幾名變數
    let No = 1;

    // 用來放4~8名的累計金額 (統計完後push進最終的chartData陣列內)
    let 其他 = ["其他"];

    // 用來放1~3名的品項 & 金額 (1~3名逐次push進最終的chartData陣列內)
    let data = [];


    // chartInfo >>> function sortOrderList() 營收最高到低排好圖表資料,開始跑forEach組合成符合規定的chart
    chartInfo.forEach(function (i, Index) {

        // 第一筆在.sort()時就是已排好營收最高的項目，直接push進chartData。
        if (Index === 0) {
            data = [`第${No}名:${i[0]}`, i[1]]
            No += 1;
            chartData.push(data);
            return;
        }

        // 當No 排名超過3時就是"其他"，避免後方程式碼檢查邏輯報錯卡住必須放在前面。
        if (No > 3) {
            其他[1] === undefined ?
                其他[1] = i[1] :
                其他[1] += i[1]
            return;
        }

        // 檢查當新進一筆資料金額與上一筆排名金額相同時，且當累計No不超過3時，設定"同列第N名"。
        if (i[1] === chartData[Index - 1][1]) {
            No -= 1;
            data = [`同列第${No}名:${i[0]}`, i[1]]
            No += 1;
            chartData.push(data);
        }
        // 在三名範圍內也沒跟上一筆重複時，由此處推送資料。
        else {
            data = [`第${No}名:${i[0]}`, i[1]]
            No += 1;
            chartData.push(data);
        }

    });

    // "其他"計算完成，加入圖表資料。
    chartData.push(其他);

    // 計算完畢後清空，重新計算時才會正確
    其他 = ["其他"];
    data = [];

    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: chartData,
        },color: {
            pattern: ["#301E5F","#5434A7","#9D7FEA","#DACBFF"]
        }
    });
}

function init() {
    getOrderList();
}











// 預設 JS
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
    item.addEventListener('click', closeMenu);
})

function menuToggle() {
    if (menu.classList.contains('openMenu')) {
        menu.classList.remove('openMenu');
    } else {
        menu.classList.add('openMenu');
    }
}
function closeMenu() {
    menu.classList.remove('openMenu');
}


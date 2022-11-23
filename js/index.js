const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const shoppingCart = document.querySelector(".shoppingCart-table");

const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");

const send = document.querySelector(".orderInfo-btn");
const form = document.querySelector(".orderInfo-form");



let productUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`;
let productData = [];

let shoppingCartUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`;
let shoppingCartData = [];

let customerOrdersUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`


init();


// Get 產品列表資料
function getProductList() {
    axios.get(productUrl)
        .then(function (response) {
            productData = response.data.products;
            renderData(productData);

        }).catch(function (error) {
            console.log(error);
        })
}

// Get 購物車資料
function getShoppingCartList() {
    axios.get(shoppingCartUrl)
        .then(function (response) {
            shoppingCartData = response.data.carts;
            renderSpCart(shoppingCartData);
        }).catch(function (error) {
            console.log(error);;
        })
}

// 渲染產品列表    
function renderData(dataBase) {

    let str = "";


    if (dataBase.length === 0) {
        productWrap.innerHTML = `
        <li class="productCard">
          <h3>很抱歉.目前暫無相關品項。</h3>
        </li>`;
        return;
    }

    dataBase.forEach(i => {
        str += `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${i.images}"
            alt="商品圖片">
        <a href="#shoppingCart" class="addCardBtn" data-product-id="${i.id}">加入購物車</a>
        <h3>${i.title}</h3>
        <del class="originPrice">NT$${i.origin_price}</del>
        <p class="nowPrice">NT$${i.price}</p>
        </li>`;
    });
    productWrap.innerHTML = str;
}

// 篩選品項類別功能
productSelect.addEventListener("change", function (e) {
    let target = e.target.value;
    let newData = productData.filter(i => i.category === target)

    target === "全部" ? renderData(productData) : renderData(newData);
})

//渲染購物車資料
function renderSpCart(dataBase) {

    if (dataBase.length === 0) {
        shoppingCart.innerHTML = `
        <tr>
          <td>購物車目前空空如也，去逛逛有沒有喜歡的傢俱吧!</td>
        </tr>`;
        return;
    }

    let itemStr = ``;
    let totalPriceStr = 0;

    dataBase.forEach(i => {
        itemStr += `
        <tr>
             <td>
                 <div class="cardItem-title">
                     <img src="${i.product.images}" alt="商品圖片">
                     <p>${i.product.title}</p>
                 </div>
             </td>
             <td>NT$${i.product.price}</td>
             <td>${i.quantity}</td>
             <td>NT$${i.product.price * i.quantity}</td>
             <td class="discardBtn">
                 <a href="#" class="material-icons" data-delete="${i.id}">clear</a>
             </td>
        </tr>`

        totalPriceStr += i.product.price * i.quantity;
    })

    let str = `
    <tr>
       <th width="40%">品項</th>
       <th width="15%">單價</th>
       <th width="15%">數量</th>
       <th width="15%">金額</th>
       <th width="15%"></th>
    </tr>
    ${itemStr}
    <tr>
      <td>
        <a href="#" class="discardAllBtn">刪除所有品項</a>
      </td>
      <td></td>
      <td></td>
      <td>
        <p>總金額</p>
      </td>
      <td>NT$ ${totalPriceStr}</td>
    </tr>`;

    shoppingCart.innerHTML = str;
}

// 加入購物車
productWrap.addEventListener("click", function (e) {
    let target = e.target;
    let productId = target.getAttribute("data-product-id");
    let exist = shoppingCartData.findIndex(i => i.product.id === productId);

    let id = ``;


    let data = {
        data: {
            "quantity": 1
        }
    }

    if (target.textContent === "加入購物車") {

        if (exist !== -1) {

            id = shoppingCartData[exist].id;
            data.data.id = id;
            data.data.quantity = shoppingCartData[exist].quantity + 1;

            axios.patch(shoppingCartUrl, data)
                .then(function (response) {
                    shoppingCartData = response.data.carts;
                    renderSpCart(shoppingCartData);
                }).catch(function (error) {
                    console.log(error);
                })
        }
        else {

            data.data.productId = productId;

            axios.post(shoppingCartUrl, data)
                .then(function (response) {
                    shoppingCartData = response.data.carts;
                    renderSpCart(shoppingCartData);
                }).catch(function (error) {
                    console.log(error);
                })
        }
    };

})

// 刪除單筆品項 & 購物車清空
shoppingCart.addEventListener("click", function (e) {

    //     // 刪除單筆品項----
    e.preventDefault();
    let target = e.target;
    let deleteId = ``;

    if (target.textContent === "clear") {
        deleteId = target.getAttribute("data-delete");

        axios.delete(`${shoppingCartUrl}/${deleteId}`)
            .then(function (response) {
                shoppingCartData = response.data.carts;
                renderSpCart(shoppingCartData);
            }).catch(function (error) {
                console.log(error);
            });
    }
    //     // 刪除單筆品項結束----

    //     // 購物車清空----
    if (target.textContent === "刪除所有品項") {
        axios.delete(shoppingCartUrl)
            .then(function (response) {
                shoppingCartData = response.data.carts;
                renderSpCart(shoppingCartData);
            }).catch(function (error) {
                console.log(error);
            });
    }
    //     // 購物車清空結束----
})

// 送出預定資料(客戶)
send.addEventListener("click", function (e) {
    e.preventDefault();

    let name = customerName.value;
    let tel = customerPhone.value;
    let email = customerEmail.value;
    let address = customerAddress.value;
    let payment = tradeWay.value;

    let space = [name, tel, email, address];
    let deSpace = space.findIndex(i => i === "");
    let rule = {
        "0": "姓名",
        "1": "電話",
        "2": "Email",
        "3": "地址"
    }

    if (deSpace !== -1) {
        Swal.fire({
            icon: 'error',
            title: `請記得填寫${rule[deSpace]}`,
            showConfirmButton: false,
            timer: 1800
        })
        return;

    } else if (shoppingCartData.length === 0) {
        Swal.fire({
            icon: 'error',
            title: `購物車目前空空的 再去逛逛吧~`,
            showConfirmButton: false,
            timer: 1800
        })
        return;
    }

    let customerInfo = {
        data: {
            user: {
                "name": name,
                "tel": tel,
                "email": email,
                "address": address,
                "payment": payment
            }
        }
    }

    axios.post(customerOrdersUrl, customerInfo)
        .then(function (response) {

            getShoppingCartList()
            Swal.fire({
                icon: 'success',
                title: `已收到您的訂單 將盡速幫您安排出貨`,
                showConfirmButton: false,
                timer: 2000
            })
        }).catch(function (error) {
            console.log(error);
        })

    form.reset();
});


// 初始化
function init() {
    getProductList();
    getShoppingCartList();
}





// 預設 JS--------
document.addEventListener('DOMContentLoaded', function () {
    const ele = document.querySelector('.recommendation-wall');
    ele.style.cursor = 'grab';
    let pos = { top: 0, left: 0, x: 0, y: 0 };
    const mouseDownHandler = function (e) {
        ele.style.cursor = 'grabbing';
        ele.style.userSelect = 'none';

        pos = {
            left: ele.scrollLeft,
            top: ele.scrollTop,
            // Get the current mouse position
            x: e.clientX,
            y: e.clientY,
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };
    const mouseMoveHandler = function (e) {
        // How far the mouse has been moved
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;

        // Scroll the element
        ele.scrollTop = pos.top - dy;
        ele.scrollLeft = pos.left - dx;
    };
    const mouseUpHandler = function () {
        ele.style.cursor = 'grab';
        ele.style.removeProperty('user-select');

        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };
    // Attach the handler
    ele.addEventListener('mousedown', mouseDownHandler);
});
// menu 切換
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

// 預設 JS 結束--------
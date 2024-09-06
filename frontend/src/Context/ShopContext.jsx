import React, { createContext, useEffect, useState } from "react";

// import Product from "../Pages/Product";


export const ShopContext = createContext(null);
const getDefaultCart =()=>{
    let cart ={} ;
    for (let index=0; index < 300+1;index++){
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props)=>{

    const [all_product,setAll_Product] = useState([]);
    const [cartItems,setCartItems] =useState(getDefaultCart());
   
    useEffect(()=>{
    fetch('http://localhost:4000/allproducts')
    .then((response)=>response.json())
    .then((data)=>setAll_Product(data))

  if(localStorage.getItem('auth-token')){
    fetch('http://localhost:4000/getcart',{
        method:'POST',
        headers:{
            Accept:'application/form-data',
            'auth-token':`${localStorage.getItem('auth-token')}`,
            'Content-Type':'application/json',
        },
        body:"",
    }).then((response)=>response.json())
    .then((data)=>setCartItems(data));
  }
    },[])

    const addToCart = (itemId) => {
        // Sepet öğelerini güncelleme
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
        
        // Auth-token kontrolü
        const token = localStorage.getItem('auth-token');
        if (token) {
            fetch('http://localhost:4000/addtocart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',  // JSON formatında veri kabul ediyoruz
                    'auth-token': token,           // Token'ı ekliyoruz
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemId: itemId })
            })
            .then(response => {
                // Eğer yanıt 401 ise, token geçersiz olabilir
                if (response.status === 401) {
                    console.error('Token geçersiz veya süresi dolmuş');
                    // Kullanıcıyı yeniden yönlendirme veya oturum açtırma gibi işlemler yapılabilir
                }
                return response.json();
            })
            .then(data => console.log(data))
            .catch(error => {
                console.error('İstek sırasında bir hata oluştu:', error);
            });
        } else {
            console.error('Auth-token bulunamadı. Kullanıcı oturum açmamış olabilir.');
        }
    };
    

    const removeFromCart = (itemId) =>{
        setCartItems((prev) => {
            // Miktarı azalt ve eğer miktar sıfır veya daha düşükse, öğeyi kaldır
            const newQuantity = (prev[itemId] || 0) - 1;
            if (newQuantity <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: newQuantity };
        });

        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/removefromcart',{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemId}),
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => console.log(data))
            .catch((error) => console.error('Error:', error));
        }
        
    }

    const getTotalCartAmount = () =>{
        let totalAmount =0;
        for(const item in cartItems)
            {
            if(cartItems[item]>0)
                {
                    let itemInfo =all_product.find((product)=>product.id===Number(item))
                totalAmount +=itemInfo.new_price* cartItems[item];
            }
        }
        return totalAmount;
    }
  
    const getTotalCartItems = () => {
     let totalItem=0;
     for(const item in cartItems){
        if(cartItems[item]>0)
        {
            totalItem +=cartItems[item];
        }
     }
     return  totalItem;
    }

    const contextValue ={getTotalCartItems,getTotalCartAmount,all_product,cartItems,addToCart,removeFromCart};
return (
    <ShopContext.Provider value={contextValue}>
        {props.children}
    </ShopContext.Provider>
)
}

export default ShopContextProvider;
import React, { useState, useEffect } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import Button from 'react-bootstrap/Button';
import { BsPlusCircle } from 'react-icons/bs';
import './Food.css';
import chicken from './Chicken.png';
import salad from './salad.png'
import burger from './burger.png'
import pizza from './pizza.png'
import all from './all_food.png'
import $ from 'jquery';
import './fooddropAnimate.css';
import { useMyHook } from './myHook';
import { useMemo } from 'react';
import plusSvg from './plus.svg';
import { ReactComponent as PlusSvg } from './plus.svg';
import { ReactComponent as MinusSvg } from './minus.svg';

const Food = () => {

  const [numbers, setNumbers] = useState([0, 0, 0]);

  const incrementNumber = (index) => {
    setNumbers((prevNumbers) =>
      prevNumbers.map((num, i) => (i === index ? num + 1 : num))
    );
  };

  const decrementNumber = (index) => {
    setNumbers((prevNumbers) =>
      prevNumbers.map((num, i) => (i === index ? num - 1 : num))
    );
  };
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    setAnimationClass('quantity');
  }, []);

  useEffect(() => {
    // Call the displayAllProductInfo function to retrieve the array of products from local storage
    let productArray = displayAllProductInfo();
    // Update the products state with the array of products
    setProducts(productArray);
  }, []);

  const [products, setProducts] = useState([
  ]);

  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  useEffect(() => {
    saveId(Math.random());
  }, [products]);

  const displayAllProductInfo = () => {
    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem("products"));
    //console.log("displayProductFunction")
    //console.log(products)
    // Create an empty array to store the products
    let productArray = [];

    // Loop through the array of products
    for (let i = 0; products != null && i < products.length; i++) {
      let product = products[i];
      // Push the product object to the array
      productArray.push({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        subtotal: product.subtotal,
        image: product.image,
      });
    }

    // Return the array of product objects
    return productArray;
  };

  /**dorp food */



  const charSet = [
    {
      "pizza": pizza,
      "salad": salad,
      "burger": burger,
      "chicken": chicken
    }
  ];

  const [width, setWidth] = useState(window.innerWidth - 64);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = width <= 768;
  const handleDropFood = (category) => {
    //console.log("hello")
    /**shake */
    const cart = $('#cart');
    setTimeout(() => {
      $('#cart').addClass('rotate');
    }, 200);

    setTimeout(() => {
      cart.removeClass('rotate');
    }, 0);
    /**
    const left = Math.floor(Math.random() * width);
    const emoji = charSet[0][category]
    const add = `<img class="emoji" style="left: ${left}px;" src="${emoji}"/>`;
    $(add).appendTo(".container").animate(
      {
        top: $(document).height()
      },
      3500,
      function () {
        $(this).remove();
      }
    );drop */
  };
  /**drop food */

  const data = JSON.parse(sessionStorage.getItem("Food_arrays"))

  const [foods, setFoods] = useState(data);

  const filterType = (category) => {
    setFoods(
      data.filter((item) => {
        return item.category === category;
      })
    )
  }
  const filtername = (name) => {
    setFoods(
      data.filter((item) => {
        return item.name.toLowerCase().includes(name.toLowerCase());
      })
    )
  }
  const [input, setInput] = useState("");

  const handleInputChange = (event) => {
    setInput(event.target.value);
    filtername(event.target.value);
  }
  // timesClicked is an object that stores the number of times a item is clicked
  //const timesClicked = new Map();


  const divStyle = {
    color: 'black',
  };
  const SearchQuantity = (id) => {
    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem("products"));
    // Check if the products array exists
    if (products && products.length > 0) {
      // Find the product with the given id
      const product = products.find((item) => item.id === id);

      // If the product is found and has a quantity greater than 0, return the quantity
      if (product && product.quantity && product.quantity > 0) {
        //console.log("hello " + product.quantity)
        return product.quantity;
      }
    }
    //console.log("hello 0")
    // If the product is not found or the quantity is less than or equal to 0, return 0
    return 0;
  };
  const handleDeleteClick = (id) => {
    let products = JSON.parse(sessionStorage.getItem("products"));
    //console.log(products);

    if (products && products.length > 0) {
      // Find the index of the product with the given id
      const productIndex = products.findIndex((item) => item.id === id);

      // If the product is found, decrement its quantity
      if (productIndex !== -1) {
        products[productIndex].quantity -= 1;

        // If the quantity becomes 0, remove the product from the array
        if (products[productIndex].quantity <= 0) {
          products.splice(productIndex, 1);
        }

        // Save the updated array in local storage
        sessionStorage.setItem("products", JSON.stringify(products));
      }

    }
    const calculateTotalQuant = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity), 0);
      // console.log(total)
      $('#cart').attr("data-totalitems", total);
    }
    calculateTotalQuant();

    saveId(Math.random());
  };
  const updateLocalStorage = (id, name, subtotal, image) => {
    //  console.log(id, name, subtotal, image);

    // Check if the array exists in local storage
    if (sessionStorage.getItem("products") === null) {
      // If it doesn't exist, set the value to an empty array
      sessionStorage.setItem("products", JSON.stringify([]));
    }

    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem("products"));

    // Find the product with the matching id
    let product = products.find((product) => product.id === id);

    // If the product exists, update its name, subtotal, image, and timesClicked values
    if (product) {
      product.name = name;
      product.subtotal = subtotal;
      product.image = image;
      product.quantity++;
    } else {
      // If the product doesn't exist, add it to the array
      products.unshift({ id: id, name: name, subtotal: subtotal, image: image, quantity: 1 });

    }

    // Update the array in local storage
    sessionStorage.setItem("products", JSON.stringify(products));

    const calculateTotalQuant = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity), 0);
      // console.log(total)
      $('#cart').attr("data-totalitems", total);
    }
    calculateTotalQuant();
  };

  // for translations sake
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = useMemo(() => {
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const translationsMode = sessionStorage.getItem("translationsMode")

    return (text) => {
      if (trans != null && translationsMode != null) {
        if (trans[text] != null && trans[text][translationsMode] != null) {
          return trans[text][translationsMode];
        }
      }

      return text;
    };
  }, [sessionStorage.getItem("translations"), sessionStorage.getItem("translationsMode")]);
  //const foodTypes = ['burger', 'pizza', 'salad', 'chicken'];
  const foodTypes = [...new Set(JSON.parse(sessionStorage.getItem("Food_arrays")).map(item => item.category))];

  return (

    <div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
      <div className='max-w-[1000px] m-auto px-4 '>
        <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
          {/* Filter Type */}
          <div className='Type' >
            {/* <div className='flex justify-between flex-wrap'> */}

            {/* web mode */}
            {!isMobile && (
  <div className='flex'>
    <div
      className='flex'
      style={{
        width: '70%',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <b className='m-1'>SEARCH & CATEGORY:</b>

      <div style={{ marginLeft: "15px" }}>{isMobile ? JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))[0].Address : ""}</div>

      <div className='container_search'>
        <div className='searchInputWrapper'>
          <input
            className='searchInput'
            style={{ margin: '5px', maxWidth: '90%' }}
            type='text'
            placeholder='Search your food'
            value={input}
            onChange={handleInputChange}
          />
          <i className='searchInputIcon fa fa-search'></i>
        </div>
      </div>
    </div>

    <div
      style={{ marginLeft: '20px', width: '30%', textAlign: 'right' }}
    >
      <div style={{ marginTop: '6px' }}>
      {sessionStorage.getItem('table')!=null && sessionStorage.getItem('table')!=""?
                <b >
                <b style={{backgroundColor: "red", borderRadius: "3px",padding: "3px",color: "white",}}>
                      {sessionStorage.getItem('table')}
                </b>
                </b>:
                <></>

}
        <b
          style={{
            marginLeft:"10px",
            backgroundColor: 'green',
            borderRadius: '10px',
            padding: '3px',
            paddingTop: '2px',
            paddingBottom: '2px',
            color: 'white',
          }}
        >
          OPEN
        </b>
      </div>
      <div>Until 9:00pm</div>
    </div>
  </div>
)}

{isMobile && (
  <div className='flex'>
    {/* parent div of top and bottom div */}
    <div style={{display: "flex",
    flexDirection: "column",
    width: "100%"}}>
      {/* top parent div */}
      <div style={{    display: "flex",
    width: "100%",
    justifyContent: "space-between"}}>
      <div>{JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))[0].Address}</div>

      <div style={{ marginLeft: "20px", width: "30%", textAlign: "right" }}>
                <div>
{sessionStorage.getItem('table')!=null && sessionStorage.getItem('table')!=""?
                <b >
                <b style={{backgroundColor: "red", borderRadius: "3px",padding: "3px",color: "white",}}>
                      {sessionStorage.getItem('table')}
                </b>
                </b>:
                <></>

}



                </div>
              </div>

      </div>

      {/* bottom parent div */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
    <b className='m-1 mt-2'>SEARCH & CATEGORY:</b>
    <b style={{marginLeft: "auto"}}>
    <b 
        style={{ 
            backgroundColor: "green", 
            borderRadius: "10px", 
            padding: "3px",  // Simplified the padding
            color: "white" 
        }}
    >
        OPEN
    </b>
    </b>
</div>
      <div style={{    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"}}>
        {/* bottom search bar */}
        
      <div className='container_search'>
        <div className='searchInputWrapper'>
          <input
            className='searchInput'
            style={{ margin: '5px', maxWidth: '90%' }}
            type='text'
            placeholder='Search your food'
            value={input}
            onChange={handleInputChange}
          />
          <i className='searchInputIcon fa fa-search'></i>
        </div>
      </div>
      <div style={{    display: "flex",
    alignSelf: "center"}}>Until 9:00pm</div>
      </div>

    </div>
  </div>
)}

            {/* end of the top */}
            <div className={isMobile?'scrolling-wrapper-filter mt-2':"mb-2 mt-2 scrolling-wrapper-filter"} style={{borderBottom: "1px solid black"}}>
              
              <button onClick={() => setFoods(data)} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-2 py-2' style={{ display: "inline-block" }}><b>{t("All")}</b></button>

              {foodTypes.map((foodType) => (

                <button
                  key={foodType}
                  onClick={() => filterType(foodType)}
                  className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-2 py-2'
                  style={{ display: "inline-block" }}>
                    <b>
                  {t(foodType.charAt(0).toUpperCase() + foodType.slice(1))}
                  </b>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* diplay food */}
        <AnimatePresence>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 pt-3'>
            {foods.map((item, index) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key={item.id}
                className="border rounded-lg duration-500 cursor-pointer">
                <div class="h-min overflow-hidden rounded-md">
                  <img class="w-full h-[100px] hover:scale-125 transition-all duration-500 cursor-pointer md:h-[125px] object-cover rounded-t-lg" src={item.image} alt={item.name} />
                </div>
                <div className='flex justify-between px-2 py-2 pb-1 grid grid-cols-4 w-full'>

{/* parent div of title + quantity and button parent div */}
<div className="col-span-4" style={{display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
<div className="col-span-4">
  <p className=' mb-1'>{t(item.name)}</p>
</div>

{/* parent div of the quantity and buttons */}
<div style={{    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom:"10px"}}>
<div className="col-span-2" style={{display: "flex",
    justifyContent: "center",
    alignItems: "center"}}>
  <p style={{marginBottom: "0"}}>
    <span>
      ${item.subtotal}
    </span>
    </p>
</div>
                  <div className="col-span-2 flex justify-end">

                    {SearchQuantity(item.id) == 0 ?
                      <>
                        <div className="quantity"
                          style={{ margin: '0px', display: 'flex', whiteSpace: 'nowrap', width: '80px', marginTop: "-17px", paddingTop: "20px", height: "fit-content", display: "flex", justifyContent: "flex-end" }} >

                          <div
                            className="black_hover"
                            style={{
                              padding: '4px',
                              alignItems: 'center',
                              justifyContent: 'center',
                              display: "flex",
                              border: "1px solid", // Adjust the border
                              borderRadius: "50%", // Set borderRadius to 50% for a circle
                              width: "30px", // Make sure width and height are equal
                              height: "30px",

                            }}
                          >
                            <button
                              className="minus-btn"
                              type="button"
                              name="button"
                              style={{
                                marginTop: '0px',
                                width: '20px',
                                height: '20px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                display: "flex",
                              }}
                              onClick={() => {
                                handleDropFood();
                                updateLocalStorage(item.id, item.name, item.subtotal, item.image);
                                saveId(Math.random());
                              }}
                            >
                              <PlusSvg
                                style={{
                                  margin: '0px',
                                  width: '10px',
                                  height: '10px',
                                }}
                                alt=""
                              />
                            </button>
                          </div>
                        </div>
                      </>
                      :
                      <>
                        <div
                          className={animationClass}
                          style={{
                            margin: '0px',
                            display: 'flex',
                            whiteSpace: 'nowrap',
                            width: '80px',
                            marginTop: '-18px',
                            paddingTop: '20px',
                            height: 'fit-content',
                          }}
                        >
                          <div className="quantity"

                            style={{ margin: '0px', display: 'flex', whiteSpace: 'nowrap', width: '80px', marginTop: "-18px", paddingTop: "20px", height: "fit-content" }}>
                            <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderLeft: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "12rem 0 0 12rem", height: "30px" }}>
                              <button

                                className="plus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                                onClick={() => {
                                  handleDeleteClick(item.id);
                                  //saveId(Math.random());
                                }}

                              >
                                <MinusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                              </button>
                            </div>
                            <span

                              type="text"
                              style={{ width: '30px', height: '30px', fontSize: '17px', alignItems: 'center', justifyContent: 'center', borderTop: "1px solid", borderBottom: "1px solid", display: "flex", padding: '0px' }}
                            >

                              <span >
                                {SearchQuantity(item.id)}
                              </span>

                            </span>


                            <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "0 12rem 12rem 0", height: "30px" }}>
                              <button className="minus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                                onClick={() => {
                                  handleDropFood();
                                  updateLocalStorage(item.id, item.name, item.subtotal, item.image);
                                  saveId(Math.random());
                                }}
                              >
                                <PlusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                              </button>
                            </div>
                          </div>

                        </div>




                      </>

                    }
                  </div>

</div>
{/* ^ end of parent div of quantity and button */}

</div>
{/* ^ end of parent div of title + quantity and buttons */}

                </div>

                {/* This is Tony added code */}
                {/* <Button variant="light" style={divStyle} onClick={() => printDescription(item.name)}> <AiFillPlusCircle/> </Button> */}

              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Food

import React from 'react'
import { useState } from 'react';
import './checkout.css';
import { Elements } from '@stripe/react-stripe-js';
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import Dashboard from "../components/dashboard";
import { useUserContext } from "../context/userContext";
import { useRef, useEffect } from 'react';
//import './html.css';
import { MyHookProvider, useMyHook } from './myHook';
import Hero from './Hero';

import './SwitchToggle.css';
import applepay from '../components/applepay.png';
import amex from '../components/amex.png';
import visa from '../components/visa.png';
import discover from '../components/discover.png';
import wechatpay from '../components/wechatpay.png';

import alipay from '../components/alipay.png';
import { useMemo } from 'react';
import { db } from '../firebase/index';
import { query, where, limit, doc, getDoc } from "firebase/firestore";

const App = () => {
  const params = new URLSearchParams(window.location.search);

  const store = params.get('store') ? params.get('store').toLowerCase() : "";
  const tableValue = params.get('table') ? params.get('table').toUpperCase() : "";
  console.log(store)

  /**re-render everytime button clicked from shopping cart */
  const { id, saveId } = useMyHook(null);
  const [products, setProducts] = useState(JSON.parse(sessionStorage.getItem(store)));

  //let products = JSON.parse(sessionStorage.getItem(store));
  useEffect(() => {
    setProducts(JSON.parse(sessionStorage.getItem(store)))
    //console.log(JSON.parse(sessionStorage.getItem(store)))
  }, [id]);
  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);
  /**check if its too small */
  const [cardidth, setCardidth] = useState(0);

  function handleWindowSizeChange() {
    const card2Header = document.getElementById('card2-header');
    setCardidth(card2Header.offsetWidth);
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    const card2Header = document.getElementById('card2-header');
    //setCardidth(card2Header.offsetWidth);
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

  const isTooSmall = cardidth <= 270;

  //fetch data from local stroage products.
  const [totalPrice, setTotalPrice] = useState(products?.length ? products.reduce((acc, item) => parseFloat(acc) + (parseFloat(item?.itemTotalPrice) || 0), 0) : 0);


  useEffect(() => {
    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = products?.length ? products.reduce((acc, item) => parseFloat(acc) + (parseFloat(item?.itemTotalPrice) || 0), 0) : 0
      //console.log(total)
      //console.log(products)
      setTotalPrice(total);
    }
    //console.log(totalPrice)
    calculateTotalPrice();
  }, [products]);


  // tips calculation: in the parent App since needs to be carried in Item() and Checkout() 

  // Add state for tip selection and calculation
  const [selectedTip, setSelectedTip] = useState({ type: "percent", value: "0%" });
  const [tips, setTips] = useState(null);

  // Calculate the tip amount
  const calculateTip = () => {
    if (selectedTip.type === "percent") {
      const percentage = parseInt(selectedTip.value, 10) / 100;
      setTips(Math.round(100 * totalPrice * percentage) / 100);
      return Math.round(100 * totalPrice * percentage) / 100;

    } else {

      // for the "other" tip section, removes the $ if present
      let result = selectedTip.value;
      console.log("before $ remove: " + result)

      if (result.includes("$")) {
        result = result.replace(/\$/g, ""); // Remove dollar sign if it is present
      }

      setTips(Math.round(100 * result) / 100);
      console.log("result " + result);
      console.log("tips:" + tips);
      return result; // assuming value is in USD for fixed type
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (totalPrice === 0) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [totalPrice]);

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
  const storeFromURL = params.get('store') ? params.get('store').toLowerCase() : "";
  const [isKiosk, setIsKiosk] = useState(false);
  const [kioskHash, setkioskHash] = useState("");

  useEffect(() => {
    // Function to check the URL format
    const checkUrlFormat = () => {
      try {
        // Assuming you want to check the current window's URL
        const url = new URL(window.location.href);

        // Check if hash matches the specific pattern
        // This pattern matches hashes like #string-string-string
        const hashPattern = /^#(\w+)-(\w+)-(\w+)$/;
        //console.log(url.hash)
        setkioskHash(url.hash)
        return hashPattern.test(url.hash);
      } catch (error) {
        // Handle potential errors, e.g., invalid URL
        console.error("Invalid URL:", error);
        return false;
      }
    };

    // Call the checkUrlFormat function and log the result
    const result = checkUrlFormat();
    setIsKiosk(result)
    console.log("URL format check result:", result);
  }, []); // Empty dependency array means this effect runs only once after the initial render

  return (

    <div className='mx-auto p-2 max-w-[1200px] '>
      {isLoading ?
        <div>{t("Cart is empty... Please Redirect back to home page")}
          <button
            onClick={event => {
              if (storeFromURL !== '' && storeFromURL !== null) {
                if (isKiosk) {
                  window.location.href = `/store?store=${storeFromURL}${kioskHash}`;
                } else {
                  window.location.href = `/store?store=${storeFromURL}`;
                }

              } else {
                window.location.href = '/';
              }
            }}
            class="text-blue-500 underline bg-white focus:outline-none font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2">
            Click here to redirect
          </button>
        </div> :

        <div className="app-container" style={{ height: "100%" }}>
          <div className="row">
            {isMobile ?
              <div className="col" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Item products={products} totalPrice={totalPrice} selectedTip={selectedTip} tips={tips} setSelectedTip={setSelectedTip} calculateTip={calculateTip} />
                <Checkout totalPrice={totalPrice} tips={tips} calculateTip={calculateTip} />
                {/* <Item products={products} totalPrice={totalPrice} /> */}
                {/* <Checkout totalPrice={totalPrice} /> */}
              </div>
              :
              <React.Fragment>
                <div className="ml-5 col" >
                  <Item products={products} totalPrice={totalPrice} selectedTip={selectedTip} tips={tips} setSelectedTip={setSelectedTip} calculateTip={calculateTip} />
                </div>
                <div className="mr-5 col no-gutters" style={{ height: "100%" }} >
                  <Checkout totalPrice={totalPrice} tips={tips} calculateTip={calculateTip} />
                </div>
              </React.Fragment>
            }

          </div>
        </div>
      }

    </div>
  );
};
/**                    <img src={product.image} style ={{    width: '100px',
  height: '100px',
  'object-fit': 'cover'}}/> */
const Item = (props) => {
  const params = new URLSearchParams(window.location.search);

  const store = params.get('store') ? params.get('store').toLowerCase() : "";
  const tableValue = params.get('table') ? params.get('table').toUpperCase() : "";
  console.log(store)

  //let products = JSON.parse(sessionStorage.getItem(store));
  const [products, setProducts] = useState(JSON.parse(sessionStorage.getItem(store)));


  const { id, saveId } = useMyHook(null);
  useEffect(() => {
  }, [id]);

  const { totalPrice } = props;
  const tax_rate = 0.0825;

  // for translations sake
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //  console.log(trans)
    // console.log(sessionStorage.getItem("translationsMode"))

    if (trans != null) {
      if (sessionStorage.getItem("translationsMode") != null) {
        // return the translated text with the right mode
        if (trans[text] != null) {
          if (trans[text][sessionStorage.getItem("translationsMode")] != null)
            return trans[text][sessionStorage.getItem("translationsMode")]
        }
      }
    }
    // base case to just return the text if no modes/translations are found
    return text
  }

  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);
  /**check if its too small */
  const [cardidth, setCardidth] = useState(0);

  function handleWindowSizeChange() {
    const card2Header = document.getElementById('card2-header');
    setCardidth(card2Header.offsetWidth);
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    const card2Header = document.getElementById('card2-header');
    //setCardidth(card2Header.offsetWidth);
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;


  // for handling tips (default at 18%)
  const { selectedTip, setSelectedTip, calculateTip, tips } = props;
  const [showInput, setShowInput] = useState(false);
  // const [selectedTip, setSelectedTip] = useState(null);

  const handleOtherButtonClick = () => {
    setShowInput(true);
    setSelectedTip({ type: "other", value: "0" });
  };

  const handlePercentButtonClick = (percent) => {
    setShowInput(false);
    setSelectedTip({ type: "percent", value: percent });
  };

  const Button = ({ children, type }) => (
    <button
      // className={`btn ${selectedTip?.value === children ? 'border border-solid border-black' : ''}`}
      className={`tips btn-outline-none shadow-none ${selectedTip?.value === children ? 'border border-solid border-black' : ''}`}
      onClick={() => type === 'other' ? handleOtherButtonClick() : handlePercentButtonClick(children)}
    >
      {children}
    </button>
  );


  return (
    <div className="card2 mb-50" style={!isMobile ? { "box-shadow": 'rgba(0, 0, 0, 0.08) -20px 1 20px -10px' } : { "box-shadow": 'rgba(0, 0, 0, 0.08) 20px -10px -20px -10px' }}>

      <div className="main">
        {/* <div className='mb-2'>

          <a href={`./store?store=${store}`} style={{ color: "blue" }}>
            &lt; Back to store
          </a>
        </div> */}
        <span className='flex' id="sub-title">
          <div className='flex'>

            {sessionStorage.getItem('table') != null && sessionStorage.getItem('table') != "" ?
              <b >
                <b classname="notranslate" style={{ borderRadius: "3px", padding: "3px" }}>
                  {sessionStorage.getItem('table')} have scanned
                </b>
                &nbsp;
              </b> :
              <b> {t("To-Go Order")}
              </b>

            }

          </div>

          <Hero style={{ "marginBottom": "5px" }}>
          </Hero>

        </span>
        <b>No QR Code was Sacnned</b>
        {products.map((product, index) => {
          return (
            <div className="row row-main my-2" key={index}>
              {/* <div className="col-3">
                <div style={{ width: '65px', height: '65px' }} class="image-container">
                  <img src={product.image} alt="" />
                </div>
              </div> */}
              <div className="col-12">
                <div className="row d-flex ">
                  <p className='m-0 pb-0'>
                    <b class="notranslate">
                      {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(product?.CHI) : (product?.name)}
                    </b>

                  </p>
                </div>

                <div className="row d-flex">
                  <p className='m-0 pb-0'>{Object.entries(product.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')}</p>
                </div>

                <div className="d-flex justify-between">
                  <div className="text-muted notranslate">@ ${Math.round(100 * (product.itemTotalPrice / product.quantity)) / 100} {t("each")} x {product.quantity}</div>
                  <div className='notranslate'><b>$ {Math.round(100 * (product.itemTotalPrice)) / 100} </b></div>
                </div>

              </div>
            </div>
          );
        })}
        <hr />
        <div className="total">
          <div className="row">
            <div className="col">
              <b> {t("Subtotal")}:</b>
            </div>
            <div className="col d-flex justify-content-end notranslate">
              <b>$ {Math.round(100 * totalPrice) / 100}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Tax")} 	&#40;8.25%&#41;:</b>
            </div>
            <div className="col d-flex justify-content-end notranslate">
              <b>$ {Math.round(100 * totalPrice * tax_rate) / 100}</b>
            </div>
          </div>
          {sessionStorage.getItem("isDinein") == "true" ?
            <div>
              <div className="row">
                <div className="col">
                  <b> {t("Service Fee (15%):")}</b>
                </div>
                <div className="col d-flex justify-end notranslate">
                  <b>$ {Math.round(100 * totalPrice * 0.15) / 100}</b>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div> {t("A service charge is applied only for dining in.")}</div>
                </div>
              </div>
            </div>

            : <div></div>
          }
          <div className="row">
            <div className="col" style={{ marginBottom: "5px" }}>
              <b> {t("Gratuity:")}</b>
            </div>

            {/* for the buttons arrangement */}
            <div className="flex justify-between">

              <Button type="percent" value="0%">0%</Button>
              <Button type="percent" value="15%">15%</Button>
              <Button type="percent" value="18%">18%</Button>
              <Button type="percent" value="20%">20%</Button>

              {!showInput && <Button type="other">{t("Other")}</Button>}
              {showInput && <input
                type="tel"
                min="0"
                className={`notranslate Gratuity ${selectedTip?.type === "other" ? 'border border-solid border-black' : ''}`}
                placeholder={t("Other")}
                value={(parseFloat(selectedTip?.value || 0)).toFixed(2)}
                onChange={e => {
                  let inputValue = e.target.value;
                  let centValue = (parseFloat(inputValue.replace('.', '')) || 0);
                  centValue = centValue / 100;
                  setSelectedTip({ type: "other", value: centValue.toString() });
                }}
                style={{ textAlign: 'center', width: '20%' }}
                translate="no"
              />}
            </div>

          </div>

          <div className="row">
            <div className="notranslate col d-flex justify-content-end">
              <b>$ {calculateTip()}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Total Amount")}:</b>
            </div>
            <div className="notranslate col d-flex justify-content-end">
              <b>$ {Math.round(100 * (totalPrice * (1 + tax_rate) + tips + (sessionStorage.getItem("isDinein") == "true" ? totalPrice * 0.15 : 0))) / 100}</b>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
};

const Checkout = (props) => {
  const { loading } = useUserContext();
  // const { totalPrice } = props;
  const { totalPrice, tips } = props;
  const tax_rate = 0.0825;

  // for translations sake
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //    console.log(trans)
    //    console.log(sessionStorage.getItem("translationsMode"))

    if (trans != null) {
      if (sessionStorage.getItem("translationsMode") != null) {
        // return the translated text with the right mode
        if (trans[text] != null) {
          if (trans[text][sessionStorage.getItem("translationsMode")] != null)
            return trans[text][sessionStorage.getItem("translationsMode")]
        }
      }
    }
    // base case to just return the text if no modes/translations are found
    return text
  }
  const params = new URLSearchParams(window.location.search);
  const store = params.get('store') ? params.get('store').toLowerCase() : "";
  const [loadedAcct, setLoadedAcct] = useState(false);

  const fetchPost = async (name) => {
    const docRef = doc(db, "TitleLogoNameContent", name);

    try {
      // Fetch the document
      const docSnapshot = await getDoc(docRef);
      // console.log(docSnapshot)
      // Check if a document was found
      if (docSnapshot.exists()) {
        // The document exists
        const docData = docSnapshot.data();
        // Save the fetched data to sessionStorage
        sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(docData));
        setLoadedAcct(true)
      } else {
        console.log("No document found with the given name.");
      }
    } catch (error) {
      console.error("Error fetching the document:", error);
    }
  }

  useEffect(() => {
    fetchPost(store);
    //console.log("hello")
  }, []); // <-- Empty dependency array

  return (
    <div className="checkout ">
      <div className="checkout-container" >
        {loading && !loadedAcct ? <h2>{t("Loading Payment")}...</h2> : <div> <Dashboard totalPrice={Math.round(100 * (totalPrice * (1 + tax_rate) + tips + (sessionStorage.getItem("isDinein") == "true" ? totalPrice * 0.15 : 0))) / 100} /> </div>}
      </div>
    </div>
  )
};

const Input = (props) => (
  <div className="input">
    <label>{props.label}</label>
    <div className="input-field">
      <input type={props.type} name={props.name} translate="no" />
      <img src={props.imgSrc} />
    </div>
  </div>
);

const Button = (props) => (
  <button className="checkout-btn" type="button">{props.text}</button>
);

export default App
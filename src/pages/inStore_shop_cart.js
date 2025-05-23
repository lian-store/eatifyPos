import React from 'react'
import { useState, useRef } from 'react';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import { useEffect, useMemo } from 'react';
import "./modal.css"
import "./shopping_cart.css"
import item_1_pic from "./item-1.png"
import { json, useLocation } from 'react-router-dom';
import { useUserContext } from "../context/userContext";
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import './cartcheckout.css';
import './float.css';
import $ from 'jquery';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faCreditCard, faGift, faDollarSign, faShare, faPencilAlt, faTimes, faExchangeAlt, faArrowRight, faPrint, faBackspace } from '@fortawesome/free-solid-svg-icons';
import logo_transparent from './logo_transparent.png'
//import { flexbox } from '@mui/system';
import "./navbar.css";
import { useMyHook } from './myHook';
import teapotImage from './teapot.png';
import { ReactComponent as DeleteSvg } from './delete-icn.svg';
import { ReactComponent as PlusSvg } from './plus.svg';
import { ReactComponent as MinusSvg } from './minus.svg';
import logo_fork from './logo_fork.png'
import Hero from './Hero'
import cuiyuan from './cuiyuan.png'
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { onSnapshot, query } from 'firebase/firestore';
import QRCode from 'qrcode.react';

import { db } from '../firebase/index';
import cartImage from './shopcart.png';
import "./inStore_shop_cart.css";
import PaymentRegular from "../pages/PaymentRegular";
import { round2digtNum } from "../utils";

import Dnd_Test from '../pages/dnd_test';
//import { isMobile } from 'react-device-detect';
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { faExclamation } from '@fortawesome/free-solid-svg-icons'; // Import the exclamation mark icon
import NumberPad from '../components/NumberPad'; // Import NumberPad component
import KeypadModal from '../components/KeypadModal'; // Import KeypadModal component

const Navbar = ({ OpenChangeAttributeModal, setOpenChangeAttributeModal, setIsAllowed, isAllowed, store, selectedTable, acct, openSplitPaymentModal, TaxRate }) => {
  // Removed startTime prop as it's read from localStorage now
  // startTime = 1744625303617 // Removed hardcoded value

  const serviceFeeInputRef = useRef(null);
  const discountInputRef = useRef(null);
  const cashPayInputRef = useRef(null);

  const [products, setProducts] = useState(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : []);
  const { user, user_loading } = useUserContext();

  const [width_, setWidth_] = useState(window.innerWidth - 64);

  // State for dining duration
  const [diningDuration, setDiningDuration] = useState('');
  // State for formatted start time
  const [startTimeDisplay, setStartTimeDisplay] = useState('');

  useEffect(() => {
    function handleResize() {
      setWidth_(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = width_ <= 768;


  const [isSplitPaymentModalOpen, setSplitPaymentModalOpen] = useState(false);

  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    setProducts(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [])
  }, [id]);

  const translations = [
    { input: "Change Desk", output: "更换餐桌" },
    { input: "Allow Dish Revise", output: "打开菜品修改" },
    { input: "Disallow Dish Revise", output: "关闭菜品修改" },
    { input: "Add Service Fee", output: "添加服务费" },
    { input: "Add Discount", output: "添加折扣" },
    { input: "Send to kitchen", output: "送到厨房" },
    { input: "Print Order", output: "打印订单" },
    { input: "Print Receipt", output: "商户收据" },
    { input: "Split payment", output: "分单付款" },
    { input: "Mark as Unpaid", output: "未付款" },
    { input: "Card Pay", output: "信用卡支付" },
    { input: "Cash Pay", output: "现金支付" },
    { input: "Subtotal", output: "小计" },
    { input: "Tax", output: "税" },
    { input: "Total", output: "总额" },
    { input: "Discount", output: "折扣" },//Disc
    { input: "Disc.", output: "折扣" },//Disc
    { input: "Duration", output: "用餐时长" },//Disc
    { input: "Start", output: "开始时间" },//Disc
    { input: "Service Fee", output: "服务费" },//Tips
    { input: "Tips", output: "小费" },
    { input: "Gratuity", output: "小费" },
    { input: "Revise", output: "修订" },
    { input: "Cash Pay", output: "现金支付" },
    { input: "Enter the Cash Received", output: "输入收到的现金" },
    { input: "Calculate Give Back Cash", output: "计算返还现金" },
    { input: "Receivable Payment", output: "应收付款" },
    { input: "Give Back Cash", output: "返还现金" },
    { input: "Add return cash as a gratuity", output: "添加返还现金作为小费" },
    { input: "Total", output: "总计" },
    { input: "Custom Gratuity", output: "自定义小费" },
    { input: "Other", output: "其他" },
    { input: "Add", output: "添加" },
    { input: "and finalize", output: "并最终确定" },
    { input: "Finalize the Order. Total Gratuity", output: "完成订单。小费总额" },
    { input: "Collect", output: "现收" },
    { input: "including", output: "其中包含" },
    { input: "Gratuity", output: "小费" },
    { input: "Cancel", output: "返回" },
    { input: "Cancel Add", output: "取消添加" },

  ];
  function translate(input) {
    const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
    return translation ? translation.output : "Translation not found";
  }
  function fanyi(input) {
    return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(input) : input
  }

  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);


  const [tips, setTips] = useState('');
  const [discount, setDiscount] = useState('');

  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const [totalQuant, setTotalQuant] = useState(0);
  const [extra, setExtra] = useState(0);

  // Effect to calculate and update dining duration
  useEffect(() => {
    let intervalId = null;

    const updateDuration = () => {
      const startTimeKey = `${store}-${selectedTable}-isSent_startTime`;
      const startTimeValue = localStorage.getItem(startTimeKey);
      if (startTimeValue && !isNaN(parseInt(startTimeValue))) {
        console.log("updateDuration")

        const startTime = parseInt(startTimeValue);
        const now = Date.now();
        const durationMs = now - startTime;

        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

        const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setDiningDuration(formattedDuration);

        // Format and set start time display
        const startDate = new Date(startTime);
        const formattedStartTime = startDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        setStartTimeDisplay(formattedStartTime);
      } else {
        setDiningDuration(''); // Clear duration if no start time or no products
        setStartTimeDisplay(''); // Clear start time display
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    updateDuration(); // Initial calculation

    // Set up interval only if conditions are met initially
    const startTimeKey = `${store}-${selectedTable}-isSent_startTime`;
    const startTimeValue = localStorage.getItem(startTimeKey);
    if (startTimeValue && !isNaN(parseInt(startTimeValue))) {
      intervalId = setInterval(updateDuration, 1000); // Update every 30 seconds
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [products, id]); // Rerun when store, table, or products change

  const toggleAllowance = () => {
    console.log(isAllowed)
    setIsAllowed(!isAllowed);
  };
  const [tableProductInfo, setTableProductInfo] = useState('[]');
  const SetTableInfo = async (table_name, product) => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", table_name);
      await setDoc(docRef, docData);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  function stringTofixed(n) {
    return (Math.round(n * 100) / 100).toFixed(2)
  }

  useEffect(() => {
    // Calculate the height of the shopping cart based on the number of products

    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = (Array.isArray(products) ? products : []).reduce((acc, item) => item && parseFloat(item.itemTotalPrice) ? parseFloat(acc) + parseFloat(item.itemTotalPrice) : parseFloat(acc), 0);
      console.log(total)
      setTotalPrice(total);
      console.log((val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips))
      console.log((val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))
      console.log("finalPrice")
      console.log((Math.round(100 * (total * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(extra) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100))
      setFinalPrice(
        (Math.round(100 * (total * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(extra) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100))
    }
    calculateTotalPrice();
    console.log("change price")
    console.log(tableProductInfo)
    //TO DO: get a better sync. this would write in database twice and this code is not working in mobile unless you get in the shopping cart.
    //GetTableProductInfo(store + "-" + selectedTable)
  }, [products, width, tips, discount, extra]);


  const handleDeleteClick = (productId, count) => {
    // Assuming prevProducts is available in this scope, otherwise, you need to get it from your state
    // Optional: Logging the product to be deleted
    const productToDelete = products.find((product) => product.id === productId && product.count === count);
    if (productToDelete) {
      console.log('Product before deletion:', productToDelete);
    }

    // Filter out the product to be deleted
    const updatedProducts = products.filter((product) => !(product.id === productId && product.count === count));

    // Update the table information with the new set of products
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));
  };

  const handlePlusClick = (productId, targetCount) => {
    // Assuming prevProducts is available in this scope, otherwise, you need to get it from your state
    const updatedProducts = products.map((product) => {
      if (product.id === productId && product.count === targetCount) {
        const newQuantity = product.quantity + 1;
        const newTotalPrice = Math.round(100 * product.itemTotalPrice / product.quantity * newQuantity) / 100;

        return {
          ...product,
          quantity: newQuantity,
          itemTotalPrice: newTotalPrice,
        };
      }
      return product;
    });

    // Call SetTableInfo with updated information
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));

  };


  const handleMinusClick = (productId, targetCount) => {
    // Assuming prevProducts is available in this scope, otherwise, you need to get it from your state
    const updatedProducts = products.map((product) => {
      if (product.id === productId && product.count === targetCount) {
        const newQuantity = Math.max(product.quantity - 1, 0);
        const newTotalPrice = newQuantity > 0 ? Math.round(100 * product.itemTotalPrice / product.quantity * newQuantity) / 100 : 0;

        return {
          ...product,
          quantity: newQuantity,
          itemTotalPrice: newTotalPrice,
        };
      }
      return product;
    });

    // Call SetTableInfo with updated information
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));
  };




  // for translations sake
  const t = useMemo(() => {
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const translationsMode = sessionStorage.getItem("translationsMode")

    return (text) => {
      //console.log(trans)
      //console.log(translationsMode)

      if (trans != null) {
        if (translationsMode != null) {
          if (trans[text] != null) {
            if (trans[text][translationsMode] != null) {
              return trans[text][translationsMode]
            }
          }
        }
      }

      return text
    }
  }, [sessionStorage.getItem("translations"), sessionStorage.getItem("translationsMode")])


  const MerchantReceipt = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "MerchantReceipt"), {
        date: date,
        data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        total: finalPrice,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const CustomerReceipt = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "CustomerReceipt"), {
        date: date,
        data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        total: finalPrice,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const listOrder = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "listOrder"), {
        date: date,
        data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        total: finalPrice,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const SetTableIsSent = async (table_name, product) => {
    try {
      if (localStorage.getItem(table_name) === product) {
        return
      }
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "TableIsSent", table_name);
      await setDoc(docRef, docData);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const SendToKitchen = async () => {
    // Add logic to save start time if it doesn't exist
    const startTimeKey = `${store}-${selectedTable}-isSent_startTime`;
    const currentCart = localStorage.getItem(`${store}-${selectedTable}`);
    if (!localStorage.getItem(startTimeKey) && currentCart && currentCart !== '[]') {
      localStorage.setItem(startTimeKey, Date.now().toString());
      console.log(`Saved start time for ${selectedTable}: ${startTimeKey}`);
    }
    try {

      if (localStorage.getItem(store + "-" + selectedTable) === null || localStorage.getItem(store + "-" + selectedTable) === "[]") {
        if (localStorage.getItem(store + "-" + selectedTable + "-isSent") === null || localStorage.getItem(store + "-" + selectedTable + "-isSent") === "[]") {
          console.log("//no item in the array no item isSent.")
          return //no item in the array no item isSent.
        } else {//delete all items
        }
      }
      compareArrays(JSON.parse(localStorage.getItem(store + "-" + selectedTable + "-isSent")), JSON.parse(localStorage.getItem(store + "-" + selectedTable)))
      SetTableIsSent(store + "-" + selectedTable + "-isSent", localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]")

    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }


  const [arrEmpty, setArrEmpty] = useState([]);
  const [arrOccupied, setArrOccupied] = useState([]);

  useEffect(() => {
    // Ensure the user is defined
    if (!user || !user.uid) return;
    console.log("docs");

    const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table");

    // Listen for changes in the collection
    const unsubscribe = onSnapshot(query(collectionRef), (snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });

      });
      setArrEmpty(docs
        .filter(element => element.product === "[]")
        .map(element => element.id.slice((store + "-").length)))
      setArrOccupied(docs
        .filter(element => element.product !== "[]")
        .map(element => element.id.slice((store + "-").length)))
      //setCheckProduct(docs)
      //console.log()
      //setArr(docs.map(element => element.id.slice((store + "-").length)))


    }, (error) => {
      // Handle any errors
      console.error("Error getting documents:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Dependencies for useEffect

  async function compareArrays(array1, array2) {//array1 isSent array2 is full array
    const array1ById = Object.fromEntries(array1.map(item => [item.count, item]));
    const array2ById = Object.fromEntries(array2.map(item => [item.count, item]));
    const add_array = []
    const delete_array = []
    for (const [count, item1] of Object.entries(array1ById)) {
      const item2 = array2ById[count];
      if (item2) {
        // If item exists in both arrays
        if (item1.quantity > item2.quantity) {
          console.log('Deleted trigger:', {
            ...item1,
            quantity: item1.quantity - item2.quantity,
            itemTotalPrice: (item1.itemTotalPrice / item1.quantity) * (item1.quantity - item2.quantity)
          });
          delete_array.push({
            ...item1,
            quantity: item1.quantity - item2.quantity,
            itemTotalPrice: (item1.itemTotalPrice / item1.quantity) * (item1.quantity - item2.quantity)
          })

        } else if (item1.quantity < item2.quantity) {
          console.log('Added trigger:', {
            ...item2,
            quantity: item2.quantity - item1.quantity,
            itemTotalPrice: (item2.itemTotalPrice / item2.quantity) * (item2.quantity - item1.quantity)
          });
          add_array.push({
            ...item2,
            quantity: item2.quantity - item1.quantity,
            itemTotalPrice: (item2.itemTotalPrice / item2.quantity) * (item2.quantity - item1.quantity)
          })
        }
      } else {
        // If item exists in array 1 but not in array 2
        console.log('Deleted trigger:', item1);
        delete_array.push(item1)
      }
    }

    for (const [count, item2] of Object.entries(array2ById)) {
      const item1 = array1ById[count];
      if (!item1) {
        // If item exists in array 2 but not in array 1
        console.log('Added trigger:', item2);
        add_array.push(item2)
      }
    }
    const promises = [];//make them call at the same time

    if (add_array.length !== 0) {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const addPromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "SendToKitchen"), {
        date: date,
        data: add_array,
        selectedTable: selectedTable
      }).then(docRef => {
        console.log("Document written with ID: ", docRef.id);
      });
      promises.push(addPromise);
    }

    if (delete_array.length !== 0) {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const deletePromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "DeletedSendToKitchen"), {
        date: date,
        data: delete_array,
        selectedTable: selectedTable
      }).then(docRef => {
        console.log("DeleteSendToKitchen Document written with ID: ", docRef.id);
      });
      promises.push(deletePromise);
    }

    // Execute both promises in parallel
    Promise.all(promises).then(() => {
      console.log("All operations completed");
    }).catch(error => {
      console.error("Error in executing parallel operations", error);
    });
  }

  const OpenCashDraw = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "OpenCashDraw"), {
        date: date,
        data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
        selectedTable: selectedTable
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const MarkAsUnPaid = async () => {

    let extra_tip = 0
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      if (localStorage.getItem(store + "-" + selectedTable) === null || localStorage.getItem(store + "-" + selectedTable) === "[]") {
        setProducts([]);
        setExtra(0)
        setInputValue("")
        setDiscount("")
        setTips("")
        return
      }
      // Wrap the addDoc call in a promise
      const addDocPromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "success_payment"), {
        amount: Math.round(Math.round((Math.round(100 * finalPrice) / 100 + Math.round(100 * extra_tip) / 100) * 100) / 100 * 100),
        amount_capturable: 0,
        amount_details: { tip: { amount: 0 } },
        amount_received: Math.round(Math.round((Math.round(100 * finalPrice) / 100 + Math.round(100 * extra_tip) / 100) * 100) / 100 * 100),
        application: "",
        application_fee_amount: 0,
        automatic_payment_methods: null,
        canceled_at: null,
        cancellation_reason: null,
        capture_method: "automatic",
        client_secret: "pi_none",
        confirmation_method: "automatic",
        created: 0,
        currency: "usd",
        customer: null,
        dateTime: date,
        description: null,
        id: "pi_none",
        invoice: null,
        last_payment_error: null,
        latest_charge: "ch_none",
        livemode: true,
        metadata: {
          discount: discount === "" ? 0 : discount,
          isDine: true,
          service_fee: tips === "" ? 0 : tips,
          subtotal: Math.round(100 * totalPrice) / 100,
          tax: Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100,
          tips: Math.round(100 * extra_tip) / 100,
          total: Math.round((Math.round(100 * finalPrice) / 100 + Math.round(100 * extra_tip) / 100) * 100) / 100,
        }, // Assuming an empty map converts to an empty object
        next_action: null,
        object: "payment_intent",
        on_behalf_of: null,
        payment_method: "pm_none",
        payment_method_configuration_details: null,
        payment_method_options: {}, // Assuming an empty map converts to an empty object
        card_present: {}, // Assuming an empty map converts to an empty object
        request_extended_authorization: false,
        request_incremental_authorization_support: false,
        payment_method_types: ["Mark_as_Unpaid"],
        powerBy: "Unpaid",
        processing: null,
        receiptData: localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]",
        receipt_email: null,
        review: null,
        setup_future_usage: null,
        shipping: null,
        source: null,
        statement_descriptor: null,
        statement_descriptor_suffix: null,
        status: "succeeded",
        store: store,
        storeOwnerId: user.uid,
        stripe_store_acct: acct,
        tableNum: selectedTable,
        transfer_data: null,
        transfer_group: null,
        uid: user.uid,
        user_email: user.email,
      });

      // Assuming SetTableInfo and SetTableIsSent are asynchronous and return promises
      // If they are not asynchronous, you can wrap their calls in Promise.resolve to treat them as promises
      const setTableInfoPromise = Promise.resolve(SetTableInfo(store + "-" + selectedTable, "[]"));
      const setTableIsSentPromise = Promise.resolve(SetTableIsSent(store + "-" + selectedTable + "-isSent", "[]"));

      // Execute all promises in parallel
      Promise.all([addDocPromise, setTableInfoPromise, setTableIsSentPromise]).then(() => {
        console.log("All operations completed successfully.");
      }).catch((error) => {
        console.error("Error executing operations:", error);
      });

      setProducts([]);
      setExtra(0)
      setInputValue("")
      setTips("")
      setDiscount("")
      localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time

    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  // console.logg(tips)
  // console.log(typeof(tips))
  //console.logg(Math.round(extra * 100) / 100)
  //console.log(typeof(Math.round(extra * 100) / 100))
  function roundToTwoDecimals(n) {
    return Math.round(n * 100) / 100;
  }
  const CashCheckOut = async (extra, tax, total) => {

    console.log("CashCheckOut")
    let extra_tip = 0
    if (extra !== null) {
      extra_tip = Math.round(extra * 100) / 100
    }
    console.log(extra)
    console.log(extra_tip)
    console.log(tips)
    console.log(roundToTwoDecimals
      (roundToTwoDecimals(extra_tip) + roundToTwoDecimals(tips === "" ? 0 : tips)))
    //console.log(typeof extra_tip)//number
    //console.log(typeof (tips === "" ? 0 : tips))//string
    if (localStorage.getItem(store + "-" + selectedTable) === null || localStorage.getItem(store + "-" + selectedTable) === "[]") {
      setProducts([]);
      setExtra(0)
      setInputValue("")
      setDiscount("")
      setTips("")
      setResult(null)
      localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time
      return
    }
    console.log("CashCheckOut")

    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      // Wrap the addDoc call in a promise
      const addDocPromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "success_payment"), {
        amount: Math.round(total * 100),
        amount_capturable: 0,
        amount_details: { tip: { amount: 0 } },
        amount_received: Math.round(total * 100),
        application: "",
        application_fee_amount: 0,
        automatic_payment_methods: null,
        canceled_at: null,
        cancellation_reason: null,
        capture_method: "automatic",
        client_secret: "pi_none",
        confirmation_method: "automatic",
        created: 0,
        currency: "usd",
        customer: null,
        dateTime: date,
        description: null,
        id: "pi_none",
        invoice: null,
        last_payment_error: null,
        latest_charge: "ch_none",
        livemode: true,
        metadata: {
          discount: discount === "" ? 0 : discount,
          isDine: true,
          service_fee: 0,
          subtotal: Math.round(100 * totalPrice) / 100,
          tax: tax,
          tips: roundToTwoDecimals
            (roundToTwoDecimals(extra_tip) + roundToTwoDecimals(tips === "" ? 0 : tips)),
          total: total
        }, // Assuming an empty map converts to an empty object
        next_action: null,
        object: "payment_intent",
        on_behalf_of: null,
        payment_method: "pm_none",
        payment_method_configuration_details: null,
        payment_method_options: {}, // Assuming an empty map converts to an empty object
        card_present: {}, // Assuming an empty map converts to an empty object
        request_extended_authorization: false,
        request_incremental_authorization_support: false,
        payment_method_types: ["Paid_by_Cash"],
        powerBy: "Paid by Cash",
        processing: null,
        receiptData: localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]",
        receipt_email: null,
        review: null,
        setup_future_usage: null,
        shipping: null,
        source: null,
        statement_descriptor: null,
        statement_descriptor_suffix: null,
        status: "succeeded",
        store: store,
        storeOwnerId: user.uid,
        stripe_store_acct: acct,
        tableNum: selectedTable,
        transfer_data: null,
        transfer_group: null,
        uid: user.uid,
        user_email: user.email,
      });

      // Assuming SetTableInfo and SetTableIsSent are asynchronous and return promises
      // If they are not asynchronous, you can wrap their calls in Promise.resolve to treat them as promises
      const setTableInfoPromise = Promise.resolve(SetTableInfo(store + "-" + selectedTable, "[]"));
      const setTableIsSentPromise = Promise.resolve(SetTableIsSent(store + "-" + selectedTable + "-isSent", "[]"));

      // Execute all promises in parallel
      Promise.all([addDocPromise, setTableInfoPromise, setTableIsSentPromise]).then(() => {
        console.log("All operations completed successfully.");
      }).catch((error) => {
        console.error("Error executing operations:", error);
      });

      setProducts([]);
      setExtra(0)
      setInputValue("")
      setDiscount("")
      setTips("")
      setResult(null)
      localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time

    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // handling the add tips logic + modal
  // Add a new state for the modal
  const [isTipsModalOpen, setTipsModalOpen] = useState(false);

  const [selectedTipPercentage, setSelectedTipPercentage] = useState(null);

  const [customPercentage, setCustomPercentage] = useState("");

  // Create a function to open the modal
  const handleAddTipClick = () => {
    setTipsModalOpen(true);
  };

  const handleCancelTip = () => {
    setTips("");  // reset the tips value

    setSelectedTipPercentage("");
    setTipsModalOpen(false);  // close the modal
  };

  const handlePercentageTip = (percentage) => {
    // If the value is less than 0, set it to 0 (or any other default value)
    if (percentage < 0) {
      percentage = 0;
    }
    const calculatedTip = totalPrice * percentage;
    setTips(calculatedTip.toFixed(2)); // This will keep the tip value to two decimal places
    setSelectedTipPercentage(percentage);
  }

  const handleCustomPercentageChange = (e) => {
    let value = e.target.value;
    // If the value is less than 0, set it to 0 (or any other default value)
    if (value < 0) {
      value = 0;
    }
    setCustomPercentage(value);
    const calculatedTip = totalPrice * (Number(value) / 100);
    setTips(calculatedTip.toFixed(2));
    setSelectedTipPercentage(null);
  }

  // the modal and logic for discounts
  // const [discount, setDiscount] = useState('');  //declared ontop
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedDiscountPercentage, setSelectedDiscountPercentage] = useState(null);
  const [customDiscountPercentage, setCustomDiscountPercentage] = useState("");

  const handleAddDiscountClick = () => {
    setDiscountModalOpen(true);
  };

  const handleCancelDiscount = () => {
    setDiscount('');  // reset the discount value
    setDiscountModalOpen(false);  // close the modal
  };

  const applyDiscount = (value) => {
    if (value < 0) {
      value = 0;
    }
    setDiscount(value.toString());
  };

  const handleDiscountPercentage = (percentage) => {
    if (percentage < 0) {
      percentage = 0;
    }
    const calculatedDiscount = totalPrice * percentage;
    setDiscount(calculatedDiscount.toFixed(2));
    setSelectedDiscountPercentage(percentage);
  }

  const [isMyModalVisible, setMyModalVisible] = useState(false);
  const [received, setReceived] = useState(false)
  const [isPaymentClick, setIsPaymentClick] = useState(false)

  const [isUniqueModalOpen, setUniqueModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [result, setResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [isChangeTableModal, setChangeTableModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // Add keypadProps state
  const [keypadProps, setKeypadProps] = useState({
    numberPadValue: customAmount,
    onNumberPadChange: (newValue) => {
      setInputValue(newValue);
      setErrorMessage('');
      setResult(null);
    },
    onNumberPadConfirm: () => calculateResult(),
    onQuickAmountClick: (amount) => {
      setInputValue(amount.toString());
      setErrorMessage('');
      setResult(null);
    },
    key: "main-input", // Key for the main input field
    activeInputType: "main" // Type of the active input field
  });

  // Reset keypadProps to default values (linked to the main input field)
  const resetKeypadProps = () => {
    setKeypadProps({
      numberPadValue: inputValue,
      onNumberPadChange: (newValue) => {
        setInputValue(newValue);
        setErrorMessage('');
        setResult(null);
      },
      onNumberPadConfirm: () => calculateResult(),
      onQuickAmountClick: (amount) => {
        setInputValue(amount.toString());
        setErrorMessage('');
        setResult(null);
      },
      key: "main-input", // Key for the main input field
      activeInputType: "main" // Type of the main input field
    });
  };

  // Update numberPadValue in keypadProps
  useEffect(() => {
    if (keypadProps.numberPadValue === inputValue) {
      setKeypadProps(prev => ({
        ...prev,
        numberPadValue: inputValue
      }));
    }
  }, [inputValue]);

  // When custom tip amount is updated
  useEffect(() => {
    if (keypadProps.numberPadValue === customAmount) {
      setKeypadProps(prev => ({
        ...prev,
        numberPadValue: customAmount
      }));
    }
  }, [customAmount]);

  // Listen for reset-keypad events
  useEffect(() => {
    const handleResetKeypad = () => {
      resetKeypadProps();
    };

    window.addEventListener('reset-keypad', handleResetKeypad);

    return () => {
      window.removeEventListener('reset-keypad', handleResetKeypad);
    };
  }, [inputValue]);

  const openUniqueModal = () => {
    setUniqueModalOpen(true);
    resetKeypadProps(); // Reset keypadProps to default values
  };
  const closeUniqueModal = () => setUniqueModalOpen(false);

  // Effect for closing number pad removed - now controlled by KeypadModal

  const handleChange = (event) => {
    let value = event.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

    // Only allow positive numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      // Maintain original format even with decimal at the end
      setInputValue(value);
    }
    setErrorMessage(``)

    setResult(null);
  };

  const handleCustomAmountChange = (event) => {
    let value = event.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

    // Only allow positive numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
    }
  };


  const calculateResult = () => {
    // For input ending with decimal point, temporarily add 0 for calculation
    let valueToCheck = inputValue;
    if (inputValue.endsWith('.')) {
      valueToCheck = inputValue + '0'; // Add 0 to make it a valid number
    }

    const x = parseFloat(valueToCheck);
    if (!isNaN(x) && x > finalPrice) {
      setResult(x);
    } else {
      setErrorMessage(`Please enter a number greater than total amount`);
      // Keep the input value to allow user to continue editing
    }
  };


  const calculateExtra = (percentage) => {
    const extraAmount = (totalPrice * percentage) / 100;
    setExtra(extraAmount);
    setFinalResult(totalPrice + extraAmount);
  };

  const calculateCustomAmount = (customAmoun_t) => {
    let amount;
    amount = parseFloat(customAmoun_t)
    if (!isNaN(amount)) {
      setExtra(amount);
      setFinalResult(totalPrice + amount);
    } else {
      alert("Please enter a valid number");
    }
  };

  const uniqueModalStyles = {
    overlayStyle: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isUniqueModalOpen ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalStyle: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '400px',
      position: 'relative',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    closeBtnStyle: {
      position: 'absolute',
      right: '30px',
      top: '0',
      background: 'none',
      border: 'none',
      fontSize: '48px',
      cursor: 'pointer',
    },
    inputStyle: {
      width: '100%',
      padding: '12px',
      boxSizing: 'border-box',
      marginBottom: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
    buttonStyle: {
      backgroundColor: '#007bff',
      color: '#fff',
      padding: '12px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '100%',
      marginBottom: '10px',
    },
  };
  const [isCustomAmountVisible, setCustomAmountVisible] = useState(false);

  const toggleCustomAmountVisibility = () => {
    setCustomAmountVisible(!isCustomAmountVisible);
  };

  const isPC = width >= 1024;

  // NumberPad state management code removed - now handled by KeypadModal

  // these dndTestKey allows the dnd_test to reset by switching to a different key
  const [dndTestKey, setDndTestKey] = useState(0); // initial key set to 0

  const resetDndTest = () => {
    setDndTestKey(prevKey => prevKey + 1); // increment key to force re-render
  };
  function groupAndSumItems(items) {
    const groupedItems = {};
    items.reverse();
    items.forEach(item => {
      // Create a unique key based on id and JSON stringified attributes
      const key = `${item.id}-${JSON.stringify(item.attributeSelected)}`;

      if (!groupedItems[key]) {
        // If this is the first item of its kind, clone it (to avoid modifying the original item)
        groupedItems[key] = { ...item };
      } else {
        // If this item already exists, sum up the quantity and itemTotalPrice
        groupedItems[key].quantity += item.quantity;
        groupedItems[key].itemTotalPrice = Math.round((groupedItems[key].itemTotalPrice + item.itemTotalPrice) * 100) / 100;
        // The count remains from the first item
      }
    });

    // Convert the grouped items object back to an array
    return Object.values(groupedItems).reverse();
  }

  const mergeProduct = async (table_name) => {
    ///combine toble


    SetTableInfo_(`${store}-${table_name}`, JSON.stringify(groupAndSumItems(
      [...JSON.parse(localStorage.getItem(`${store}-${selectedTable}`)), ...JSON.parse(localStorage.getItem(`${store}-${table_name}`))]
    )))
    SetTableInfo_(`${store}-${selectedTable}`, JSON.stringify([]))
    SetTableIsSent(`${store}-${table_name}-isSent`, JSON.stringify(groupAndSumItems(
      [...JSON.parse(localStorage.getItem(store + "-" + selectedTable + "-isSent")), ...JSON.parse(localStorage.getItem(store + "-" + table_name + "-isSent"))])
    ))
    SetTableIsSent(`${store}-${selectedTable}-isSent`, JSON.stringify([]))

  };

  const SetTableInfo_ = async (table_name, product, id) => {
    try {

      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", table_name);
      await setDoc(docRef, docData);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  //   {startTimeDisplay && (
  //     <div className={`${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
  //       Start time: <span className="notranslate text-blue-600">{startTimeDisplay}</span>
  //     </div>
  //   )}

  //   {/* Display Dining Duration */}
  // {diningDuration && (
  //   <div className={`${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
  //     Elapsed time: <span className="notranslate text-green-600">{diningDuration}</span>
  //   </div>
  // )}
  // console.log("Products from instroe_shop_cart", products)
  return (

    <div>

      <div class=''>
        <div className="mb-1 p-2 border-b-2 bg-white space-y-3">
          <div className="flex justify-between w-full">
            <div className="text-left">
              {startTimeDisplay && (
                <div className={`${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                  {fanyi("Start")}: <span className="notranslate">{startTimeDisplay}</span>
                </div>
              )}
            </div>
            <div className="text-left">
              {diningDuration && (
                <div className={`${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                  {fanyi("Duration")}: <span className="notranslate">{diningDuration}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between w-full">
            <div className="text-left">
              {(extra !== null && extra !== 0) && (
                <div className={`notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                  {fanyi("Tips")}: <span className="notranslate text-green-600">${stringTofixed(Math.round((extra) * 100) / 100)}</span>
                </div>
              )}
            </div>
            <div className="text-left">
              <div className={`text-right notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                {fanyi("Subtotal")}: <span className="notranslate text-blue-600">${stringTofixed(Math.round(100 * totalPrice) / 100)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between w-full">
            <div className="text-left">
              {tips && (
                <div className={`notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                  {fanyi("Service Fee")}: <span className="notranslate text-green-600">${stringTofixed(tips)}</span>
                </div>
              )}
            </div>
            <div className="text-left">
              <div className={`text-right notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                {fanyi("Tax")}:<span className="notranslate text-blue-600">${stringTofixed((Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100))}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between w-full">
            <div className="text-left">
              {discount && (
                <div className={`notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                  {fanyi("Disc.")}: <span className="notranslate text-red-600">${stringTofixed(discount)}</span>
                </div>
              )}
            </div>
            <div className="text-left">
              <div className={`text-right notranslate ${!isMobile ? 'text-lg font-bold' : 'font-semibold'}`}>
                {fanyi("Total")}: <span className="notranslate text-red-600">${stringTofixed(finalPrice)}</span>
              </div>
            </div>
          </div>

        </div>
        <div className="flex w-full">

          <div className={`flex-grow flex-shrink overflow-auto ${!isMobile ? 'm-2' : 'm-2'}`} style={{ minWidth: "150px", maxWidth: "calc(100vw - 180px)" }} >

            <div style={{ overflowY: 'auto', height: `calc(100vh - 355px)` }} >
              {(Array.isArray(products) ? products : []).map((product) => (
                // the parent div
                // can make the parent div flexbox
                <div className="cart-item bg-white rounded-lg shadow-sm p-2 mb-2">
                  <div className='flex items-start'>
                    <DeleteSvg className='delete-btn mt-1 ml-1 mr-3 cursor-pointer' style={{ width: '20px', flexShrink: 0 }}
                      onClick={() => {
                        handleDeleteClick(product.id, product.count)
                      }}></DeleteSvg>
                    <div className={`flex flex-col w-full ${!isMobile ? 'text-lg' : ''} notranslate`}>
                      <div className="flex justify-between w-full">
                        <span className="product-title" style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
                          {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(product?.CHI) : (product?.name)}
                        </span>
                        <span className="product-price ml-2" style={{ flexShrink: 0 }}>${(Math.round(product.itemTotalPrice * 100) / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className='pl-8 mt-1'>
                    <div className="mb-2">
                      <span className="notranslate text-gray-600 text-sm">
                        {Object.entries(product.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')}
                      </span>
                    </div>

                    <div className="quantity flex justify-between items-center">
                      <a
                        onClick={() => {
                          setOpenChangeAttributeModal(product)
                        }}
                        className="btn btn-sm btn-outline-dark mx-1 px-3 py-1 text-sm hover:bg-gray-200 transition-colors">
                        <span>Revise</span>
                      </a>

                      <div className="quantity-control">
                        <button className="minus-btn" type="button" name="button"
                            onClick={() => {
                              if (product.quantity === 1) {
                                handleDeleteClick(product.id, product.count);
                              } else {
                                handleMinusClick(product.id, product.count)
                              }
                            }}>
                          <MinusSvg style={{ width: '12px', height: '12px' }} alt="" />
                          </button>

                        <span className='notranslate'>{product.quantity}</span>

                        <button className="plus-btn" type="button" name="button"
                            onClick={() => {
                              handlePlusClick(product.id, product.count)
                            }}>
                          <PlusSvg style={{ width: '12px', height: '12px' }} alt="" />
                          </button>
                        </div>
                      </div>
                    </div>
                </div>

              ))}

            </div>

          </div>
          <div className='flex flex-col space-y-2 flex-shrink-0' style={isMobile ? { width: "120px" } : { width: "150px" }}>
            {/* Display Start Time */}
            <a
              onClick={() => { SendToKitchen(); setChangeTableModal(true); }}
              className="mt-3 bg-white btn btn-sm btn-link mx-1 border-black"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Change Desk")}</span>
            </a>
            {/* <a
              onClick={toggleAllowance}
              className={`mt-3 btn btn-sm ${isAllowed ? 'btn-light' : 'btn-dark'} mx-1`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? null : (
                <span className="pe-2">
                  <FontAwesomeIcon icon={isAllowed ? faToggleOn : faToggleOff} />
                </span>
              )}
              <span className='notranslate'>{isAllowed ? fanyi('Allow Dish Revise') : fanyi('Disallow Dish Revise')}</span>
            </a> */}

            <a
              onClick={handleAddTipClick}
              className="mt-3 btn btn-sm btn-success mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Add Service Fee")}</span>
            </a>

            <a
              onClick={handleAddDiscountClick}
              className="mt-3 btn btn-sm btn-danger mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Add Discount")}</span>
            </a>

            <a
              onClick={() => { listOrder(); }}
              className="mt-3 btn btn-sm btn-secondary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Print Order")}</span>
            </a>

            <a
              onClick={() => { CustomerReceipt(); MerchantReceipt(); }}
              className="mt-3 btn btn-sm btn-secondary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Print Receipt")}</span>
            </a>

            <a
              onClick={() => { setSplitPaymentModalOpen(true); SendToKitchen(); localStorage.setItem("splitSubtotalTotalPrice", Math.round(totalPrice * 100) / 100); localStorage.setItem("splitSubtotalCurrentPrice", 0) }}
              className="mt-3 btn btn-sm btn-warning mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >



              <span className='notranslate'>{fanyi("Split Payment")}</span>
            </a>
            <a
              onClick={() => { SendToKitchen(); MarkAsUnPaid(); }}
              className="mt-3 bg-white btn btn-sm btn-outline-danger mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Mark as Unpaid")}</span>
            </a>
            <a
              onClick={() => { setMyModalVisible(true); SendToKitchen() }}
              className="mt-3 btn btn-sm btn-primary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Card Pay")}</span>
            </a>

            <a
              onClick={() => {
                openUniqueModal(); SendToKitchen();
                setInputValue("")
                setResult(null);
                setExtra(0)


              }}
              className="mt-3 btn btn-sm btn-info mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Cash Pay")}</span>
            </a>
          </div>
        </div>
        <div>
        </div>
      </div>
      {/* popup content */}
      <div style={{ margin: "auto", height: "fit-content" }}>

        <div className="flex flex-col flex-row">
          {isUniqueModalOpen && (
            <KeypadModal
              isOpen={isUniqueModalOpen}
              onClose={() => {
                setUniqueModalOpen(false);
                setInputValue("");
                setResult(null);
                setExtra(0);
              }}
              headerContent={
                    <a
                      onClick={() => { OpenCashDraw(); }}
                  className="mt-3 btn btn-md btn-info"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                    >
                      <span>Open Cash Drawer</span>
                    </a>
              }
              showCloseButton={true}
              numberPadValue={keypadProps.numberPadValue}
              onNumberPadChange={keypadProps.onNumberPadChange}
              onNumberPadConfirm={keypadProps.onNumberPadConfirm}
              onQuickAmountClick={keypadProps.onQuickAmountClick}
              activeInputType={keypadProps.activeInputType}
              showOneHundred={true}
            >
              <div>
                    <p className="mb-2">{fanyi("Enter the Cash Received")}</p>
                    <input
                  type="text"
                  inputMode="decimal"
                      value={inputValue}
                      onChange={handleChange}
                      style={uniqueModalStyles.inputStyle}
                      className="mb-4 p-2 w-full border rounded-md"
                      translate="no"
                  ref={cashPayInputRef}
                  onClick={() => {
                    // When clicking the main input field, reset keypadProps
                    resetKeypadProps();
                  }}
                    />
                    <button
                      onClick={calculateResult}
                      style={uniqueModalStyles.buttonStyle}
                      className="mb-4 bg-gray-500 text-white px-4 py-2 rounded-md w-full"
                    >
                      {fanyi("Calculate Give Back Cash")}
                    </button>
                    {errorMessage && (
                      <div className="text-red-500 font-semibold mt-2">
                        {errorMessage}
                      </div>
                    )}

                <p className="mb-4">{fanyi("Gratuity")}:</p>
                    <div className="flex justify-between mb-4">
                      <button onClick={() => { calculateExtra(15); setCustomAmountVisible(false) }} className="bg-purple-500 text-white px-4 py-2 rounded-md w-full mr-2">
                        15%
                      </button>
                      <button onClick={() => { calculateExtra(18); setCustomAmountVisible(false) }} className="bg-purple-500 text-white px-4 py-2 rounded-md w-full mx-1">
                        18%
                      </button>
                      <button onClick={() => { calculateExtra(20); setCustomAmountVisible(false) }} className="bg-purple-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        20%
                      </button>
                      <button onClick={() => { calculateExtra(0); setCustomAmountVisible(false) }} className="bg-orange-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        0
                      </button>
                      <button onClick={toggleCustomAmountVisibility} className="bg-orange-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        {fanyi("Other")}
                      </button>
                    </div>

                    {isCustomAmountVisible && (
                      <div className='notranslate'>
                        <p className="mb-2">{fanyi("Custom Gratuity")}:</p>
                        <div className="flex">
                          <input
                            type="text"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            style={uniqueModalStyles.inputStyle}
                            className="p-2 w-full border rounded-md mr-2"
                        onClick={() => {
                          // When clicking the custom tip input field, modify association to custom tip input
                          setKeypadProps({
                            // Use the current value of custom tip
                            numberPadValue: customAmount,
                            onNumberPadChange: (newValue) => {
                              setCustomAmount(newValue);
                            },
                            onNumberPadConfirm: () => {
                              calculateCustomAmount(customAmount);
                            },
                            onQuickAmountClick: (amount) => {
                              setCustomAmount(amount.toString());
                            },
                            key: "custom-amount", // Key for the custom tip input field
                            activeInputType: "custom" // Type of the custom tip input field
                          });
                        }}
                          />
                          <button
                            onClick={() => calculateCustomAmount(customAmount)}
                            className="bg-orange-500 text-white p-2 rounded-md w-1/3"
                          >
                            {fanyi("Add")}
                          </button>
                        </div>
                      </div>
                    )}

                    {(extra !== null && extra !== 0) && (
                  <p className="mt-4">{fanyi("Gratuity")}: <span className='notranslate'>${Math.round((extra) * 100) / 100} </span></p>
                    )}
                    <p className="mt-1">{fanyi("Receivable Payment")}: <span className='notranslate'>${finalPrice}</span> </p>

                    {result !== null && (
                      <div>
                        <p className="mt-1 mb-4 ">
                          {fanyi("Give Back Cash")}: <span className='notranslate'>${Math.round((result - finalPrice) * 100) / 100}</span>
                        </p>
                        <button
                          onClick={() => {
                        setCustomAmount(Math.round((result - finalPrice) * 100) / 100);
                        calculateCustomAmount(Math.round((result - finalPrice) * 100) / 100);
                        CashCheckOut(
                          Math.round((result - finalPrice + extra) * 100) / 100,
                          stringTofixed((Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100)),
                          inputValue
                        );
                            closeUniqueModal();
                          }}
                          style={uniqueModalStyles.buttonStyle}
                          className="notranslate mt-2 mb-2 bg-gray-500 text-white px-4 py-2 rounded-md w-full"
                        >
                          {fanyi("Collect")} ${stringTofixed(Math.round(inputValue * 100) / 100)},
                          {fanyi("including")} ${Math.round((result - finalPrice + extra) * 100) / 100}
                          {fanyi("Gratuity")}.
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                    CashCheckOut(
                      extra,
                      stringTofixed((Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100)),
                      finalPrice
                    );
                        closeUniqueModal();
                  }}
                      style={uniqueModalStyles.buttonStyle}
                      className="notranslate mt-2 mb-2 bg-blue-500 text-white px-4 py-2 rounded-md w-full"
                    >
                      {fanyi("Collect")} ${stringTofixed(finalPrice)},
                      {fanyi("including")} ${Math.round((extra) * 100) / 100}
                      {fanyi("Gratuity")}.
                    </button>
                  </div>
            </KeypadModal>
          )}
          {isSplitPaymentModalOpen && (
            <div
              id="addTipsModal"
              className="modal fade show"
              role="dialog"
              style={{
                display: 'block',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                className="modal-dialog"
                role="document"
                style={{ maxWidth: '95%', width: '95%', height: "90%", margin: '0 auto', marginTop: '20px' }}
              >
                <div className="modal-content">

                  <div
                    className="modal-body p-2 pt-0"
                    style={{ overflowX: 'auto', maxWidth: '100%' }}
                  >
                    <div className='flex p-2 pt-4'>
                      <Button className='mr-2' variant="danger" style={{ marginTop: "auto" }} onClick={resetDndTest}>
                        Reset
                      </Button>
                      <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                        <div>
                          <div>
                            ✅ Paid Subtotal:&nbsp;
                            <span className='notranslate'>${round2digtNum(localStorage.getItem("splitSubtotalCurrentPrice")).toFixed(2)}</span>
                          </div>
                          <div>
                            💰Total Subtotal:&nbsp;
                            <span className='notranslate'>${round2digtNum(localStorage.getItem("splitSubtotalTotalPrice")).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setSplitPaymentModalOpen(false); }}>
                        &times;
                      </button>
                    </div>
                    <Dnd_Test store={store} acct={acct} selectedTable={selectedTable} key={dndTestKey} main_input={products}
                      TaxRate={TaxRate}
                    />
                  </div>
                </div>
              </div>
            </div>

          )
          }

          {isChangeTableModal && (
            <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Select Dining Desk to Merge for {selectedTable}</h5>
                    <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setChangeTableModal(false); }}>
                      &times;
                    </button>
                  </div>
                  <div className="modal-body pt-0">
                    <div>Empty Dining Desk(s): </div>
                    {arrEmpty.map((option) => (

                      <button
                        type="button"
                        className="btn btn-primary mb-2 mr-2 notranslate"
                        onClick={() => {
                          mergeProduct(option); setChangeTableModal(false);
                          localStorage.setItem(`${store}-${option}-isSent_startTime`, localStorage.getItem(`${store}-${selectedTable}-isSent_startTime`)); // Clear start time
                          localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time
                        }}
                        style={{ backgroundColor: '#966f33' }}
                      >
                        {option}
                      </button>

                    ))}
                    <hr></hr>
                    <div>Dining Desk(s) in Use:</div>
                    {arrOccupied.map((option) => (

                      <button
                        key={option}
                        type="button"
                        className="btn btn-primary mb-2 mr-2 notranslate"
                        onClick={() => {
                          mergeProduct(option); setChangeTableModal(false);
                          localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time
                        }}
                      >
                        {option}
                      </button>

                    ))}
                  </div>
                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>

          )
          }
          {isMyModalVisible && (
            <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Select your POS Machine:</h5>
                    <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setMyModalVisible(false); setReceived(false) }}>
                      &times;
                    </button>
                  </div>
                  <div className="modal-body pt-0">

                    <PaymentRegular setDiscount={setDiscount} setTips={setTips} setExtra={setExtra} setInputValue={setInputValue} setProducts={setProducts} setIsPaymentClick={setIsPaymentClick} isPaymentClick={isPaymentClick} received={received} setReceived={setReceived} selectedTable={selectedTable} storeID={store}
                      chargeAmount={finalPrice} discount={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount)} service_fee={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips)} connected_stripe_account_id={acct} totalPrice={Math.round(totalPrice * 100)} />
                    <span className="mb-2 notranslate">Or Customer Can Scan To Pay The Whole Table (扫码支付本桌)</span>

                    <div className="qrCodeItem flex flex-col items-center mt-1">
                      <QRCode value={`https://7dollar.delivery/store?store=${store}&table=${selectedTable}`} size={100} />
                    </div>

                  </div>

                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* the modal for tips */}
          {isTipsModalOpen && (
            <KeypadModal
              isOpen={isTipsModalOpen}
              onClose={() => setTipsModalOpen(false)}
              title={fanyi("Add Service Fee")}
              numberPadValue={tips}
              onNumberPadChange={(newValue) => {
                // Handle decimal point input
                setTips(newValue);
              }}
              onNumberPadConfirm={(confirmedValue) => {
                // Process value when confirming
                let valueToConfirm = confirmedValue;
                setTips(valueToConfirm);
                setTipsModalOpen(false);
              }}
              onQuickAmountClick={(amount) => {
                setTips(amount.toString());
              }}
            >
              <div>
                    <div className="flex justify-between mb-4">
                      <button onClick={() => handlePercentageTip(0.15)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full mr-2">
                        15%
                      </button>
                      <button onClick={() => handlePercentageTip(0.18)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full mx-1">
                        18%
                      </button>
                      <button onClick={() => handlePercentageTip(0.20)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        20%
                      </button>
                      <button onClick={() => handlePercentageTip(0.25)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        25%
                      </button>
                    </div>
                    <input
                  type="text"
                  inputMode="decimal"
                      placeholder="Enter service fee by amount"
                      value={tips}
                  className="form-control tips-no-spinners"
                      onChange={(e) => {
                    let value = e.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

                    // Only allow numbers and decimal point
                    if (/^\d*\.?\d*$/.test(value)) {
                        setTips(value.toString());  // Update the state with the raw input value
                        setSelectedTipPercentage(null);
                    }
                      }}
                  ref={serviceFeeInputRef}
                      translate="no"
                    />
                <div className="mt-4 text-right">
                  <button type="button" className="btn btn-secondary mr-2" onClick={() => handleCancelTip()}>
                    <FontAwesomeIcon icon={faTimes} className="mr-1" /> {fanyi("Cancel Add")}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => setTipsModalOpen(false)}>
                    {fanyi("Add Service Fee")}
                  </button>
                  </div>
                  </div>
            </KeypadModal>
          )}

          {isDiscountModalOpen && (
            <KeypadModal
              isOpen={isDiscountModalOpen}
              onClose={() => setDiscountModalOpen(false)}
              title={fanyi("Add Discount")}
              numberPadValue={discount}
              onNumberPadChange={(newValue) => {
                // Handle decimal point input
                applyDiscount(newValue);
              }}
              onNumberPadConfirm={(confirmedValue) => {
                // Process value when confirming
                let valueToConfirm = confirmedValue;
                applyDiscount(valueToConfirm);
                setDiscountModalOpen(false);
              }}
              onQuickAmountClick={(amount) => {
                // Use the button amount value directly
                setDiscount(amount.toString());
              }}
            >
              <div>
                    <div className="flex justify-between mb-4">
                      <button onClick={() => handleDiscountPercentage(0.10)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full mr-2">
                        10%
                      </button>
                      <button onClick={() => handleDiscountPercentage(0.15)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full mx-1">
                        15%
                      </button>
                      <button onClick={() => handleDiscountPercentage(0.20)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        20%
                      </button>
                      <button onClick={() => handleDiscountPercentage(0.25)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        25%
                      </button>
                    </div>

                    <input
                  type="text"
                  inputMode="decimal"
                      placeholder="Enter discount by amount"
                      value={discount}
                  className="form-control tips-no-spinners"
                      onChange={(e) => {
                    let value = e.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

                    // Only allow numbers and decimal point
                    if (/^\d*\.?\d*$/.test(value)) {
                      applyDiscount(value);
                        setSelectedTipPercentage(null);
                    }
                      }}
                  ref={discountInputRef}
                      translate="no"
                    />

                <div className="mt-4 text-right">
                  <button type="button" className="btn btn-secondary mr-2" onClick={handleCancelDiscount}>
                    <FontAwesomeIcon icon={faTimes} className="mr-1" /> {fanyi("Cancel Add")}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => setDiscountModalOpen(false)}>
                    {fanyi("Add Discount")}
                  </button>
                  </div>
                  </div>
            </KeypadModal>
          )}
        </div>


      </div>
      {/* Standalone NumberPad component removed - now integrated in KeypadModal */}
    </div>
  )
}

export default Navbar


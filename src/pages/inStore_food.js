import React, { useState, useEffect, useRef } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import Button from 'react-bootstrap/Button';
import { BsPlusCircle } from 'react-icons/bs';
import './Food.css';
import $ from 'jquery';
import './fooddropAnimate.css';
import { useMyHook } from './myHook';
import { useMemo } from 'react';
import { ReactComponent as PlusSvg } from './plus.svg';
import { ReactComponent as MinusSvg } from './minus.svg';
import { FiSearch } from 'react-icons/fi';
import { db } from '../firebase/index';
import { doc } from "firebase/firestore";
import { useUserContext } from "../context/userContext";
import { setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import pinyin from "pinyin";
import LazyLoad from 'react-lazy-load';
import { onSnapshot } from "firebase/firestore"; // Make sure to import onSnapshot
import { faList } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as DeleteSvg } from './delete-icn.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDoc, updateDoc } from "firebase/firestore";
import KeypadModal from '../components/KeypadModal'; // Import KeypadModal component
import NumberPad from '../components/NumberPad'; // Import NumberPad component
import TableTimingModal, { BILLING_RULES, calculatePriceForBillingRule } from '../components/TableTimingModal';

function convertToPinyin(text) {
  return pinyin(text, {
    style: pinyin.STYLE_NORMAL,
  }).join('');
}

const Food = ({ setIsVisible, OpenChangeAttributeModal, setOpenChangeAttributeModal, setIsAllowed, isAllowed, store, selectedTable, view, TaxRate }) => {
  const initialGlobal = [
    { "type": "外卖", "price": 0, "typeCategory": "要求添加" },
    { "type": "加酱料", "price": 0, "typeCategory": "要求添加" },
    { "type": "加饭", "price": 0, "typeCategory": "要求添加" },
    { "type": "加面", "price": 0, "typeCategory": "要求添加" },
    { "type": "加粉", "price": 0, "typeCategory": "要求添加" },
    { "type": "加米", "price": 0, "typeCategory": "要求添加" },
    { "type": "加肉", "price": 0, "typeCategory": "要求添加" },
    { "type": "加菜", "price": 0, "typeCategory": "要求添加" },
    { "type": "加辣", "price": 0, "typeCategory": "要求添加" },
    { "type": "加盐", "price": 0, "typeCategory": "要求添加" },
    { "type": "加油", "price": 0, "typeCategory": "要求添加" },
    { "type": "加醋", "price": 0, "typeCategory": "要求添加" },
    { "type": "加糖", "price": 0, "typeCategory": "要求添加" },
    { "type": "加葱", "price": 0, "typeCategory": "要求添加" },
    { "type": "加芫荽", "price": 0, "typeCategory": "要求添加" },
    { "type": "加蒜", "price": 0, "typeCategory": "要求添加" },
    { "type": "堂食", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要酱料", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要饭", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要面", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要粉", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要米", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要肉", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要菜", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要辣", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要盐", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要油", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要醋", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要糖", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要葱", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要芫荽", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要蒜", "price": 0, "typeCategory": "要求减少" }
  ]
  const [global, setGlobal] = useState(initialGlobal);
  //const params = new URLSearchParams(window.location.search);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [totalPrice, setTotalPrice] = useState(0); // State to store the total price
  const [count, setCount] = useState(0);  // Set up a state
  const [selectedFoodItem, setSelectedFoodItem] = useState('')

  // 开台计时弹窗相关状态
  const [isTableTimingModalOpen, setIsTableTimingModalOpen] = useState(false);
  const [selectedTableItem, setSelectedTableItem] = useState(null);

  // 将 useMyHook 的调用移到这里，确保 saveId 在 useEffect 之前初始化
  const { id, saveId } = useMyHook(null);

  // 开台成功后的回调函数
  // tableItemFromModal 是从 TableTimingModal 传递过来的，包含了它生成的 count
  const handleTableStart = (tableItemFromModal) => {
    if (tableItemFromModal && tableItemFromModal.id && tableItemFromModal.count) {
      const receivedCount = tableItemFromModal.count; // 使用 TableTimingModal 生成的 count

      // setCount(receivedCount); // 这个setCount是Food.js内部的，用于属性修改弹窗，如果不需要同步可以考虑移除或调整
      // setSelectedAttributes({}); // 这些状态重置可能也需要根据逻辑调整
      // setTotalPrice(0);

      // 为开台商品添加特殊属性，确保'开台商品'标记和时间戳的一致性
      // tableItemFromModal.attributeSelected 可能已经包含了备注
      const tableSpecialAttributes = {
        ...(tableItemFromModal.attributeSelected || {}), // 保留模态框中已有的属性（如备注）
        '开台商品': [`开台时间-${Date.now()}`] // 添加或覆盖'开台商品'标记，确保时间戳最新
      };

      addSpecialFood(
        tableItemFromModal.id,
        tableItemFromModal.name,
        tableItemFromModal.subtotal,
        tableItemFromModal.image,
        tableSpecialAttributes, // 使用更新后的属性
        receivedCount, // 使用从模态框传入的 count
        tableItemFromModal.CHI,
        tableItemFromModal, // 可以传递原始的 tableItemFromModal 作为基础对象
        tableItemFromModal.availability,
        tableItemFromModal.attributesArr,
        1, // quantity
        true, // isTableItem - 标记为开台商品
        tableItemFromModal.tableRemarks // 确保备注被传递
      );

      // 立即设置开台状态的 startTime，使用传入的 id 和 count
      const startTimeKey = `${store}-${tableItemFromModal.id}-${receivedCount}-isSent_startTime`;
      localStorage.setItem(startTimeKey, Date.now().toString());

      // 注意：此函数不再需要返回商品对象，因为 TableTimingModal 已不再依赖其返回值来获取 count
    } else {
      console.error('handleTableStart (Food.js) 接收到的 tableItem 无效或缺少 count:', tableItemFromModal);
    }
  };

  // 结台成功后的回调函数
  const handleTableEnd = (tableItem, finalPrice, tableNameFromTimer) => {
    const targetTable = tableNameFromTimer || selectedTable;
    if (!targetTable) {
      console.error('[Food.js] handleTableEnd: targetTable is undefined or null. Props selectedTable:', selectedTable, 'tableNameFromTimer:', tableNameFromTimer);
      return;
    }
    const cartKey = `${store}-${targetTable}`;
    console.log(`[Food.js] handleTableEnd received. Target Table: ${targetTable}, Cart Key: ${cartKey}, Item ID: ${tableItem.id}, Item Count: ${tableItem.count}, Final Price: ${finalPrice}`);

    let products = JSON.parse(localStorage.getItem(cartKey));
    if (products && products.length > 0) {
      const productIndex = products.findIndex(product =>
        product.id === tableItem.id &&
        product.count === tableItem.count &&
        product.isTableItem && // Check if it's currently an active table item
        product.attributeSelected && product.attributeSelected['开台商品']
      );

      console.log(`[Food.js] handleTableEnd: Attempting to find product in cart. Resulting index: ${productIndex}. Searching for ID: ${tableItem.id}, Count: ${tableItem.count}`);
      if (productIndex !== -1) {
        console.log(`[Food.js] handleTableEnd: Found product '${products[productIndex].name}' at index ${productIndex}. Updating its status and price.`);

        // Update price to the final calculated fee
        products[productIndex].subtotal = finalPrice;
        products[productIndex].itemTotalPrice = Math.round(finalPrice * (products[productIndex].quantity || 1) * 100) / 100;

        // Mark the item as no longer an active timed item
        // products[productIndex].isTableItem = false;
        console.log(`[Food.js] handleTableEnd: Product '${products[productIndex].name}' status updated. isTableItem: ${products[productIndex].isTableItem}, Attributes:`, products[productIndex].attributeSelected);

        SetTableInfo(cartKey, JSON.stringify(products));
        saveId(Math.random());
        console.log(`[Food.js] handleTableEnd: Cart for table '${targetTable}' saved. UI update triggered.`);
      } else {
        console.error(`[Food.js] handleTableEnd: Did not find matching active product in cart for table '${targetTable}'. Item ID: ${tableItem.id}, Count: ${tableItem.count}. This might happen if item was already processed or removed.`);
        console.log('[Food.js] handleTableEnd: Current cart items for table:', products.map(p => ({ id: p.id, count: p.count, name: p.name, isTableItem: p.isTableItem, attrs: Object.keys(p.attributeSelected || {}) })));
      }
    } else {
      console.warn(`[Food.js] handleTableEnd: Cart for table '${targetTable}' is empty or not found upon trying to finalize table item. CartKey:`, cartKey);
    }
  };

  const [priceError, setPriceError] = useState("");  // Set up a state
  const SetTableInfo = async (table_name, product) => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);

      const docData = { product: product, date: date };

      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", table_name);
      await setDoc(docRef, docData);
      //localStorage.setItem(table_name, product)

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };


  const handleAttributeSelect = (attributeName, variationType, id, count, updateSelectedAttributes, init) => {
    let updatedSelectedAttributes;

    if (Object.keys(updateSelectedAttributes).length === 0) {
      updatedSelectedAttributes = { ...selectedAttributes };

    } else {
      updatedSelectedAttributes = { ...updateSelectedAttributes };

    }

    // Create a copy of the selectedAttributes state
    //const updatedSelectedAttributes = { ...selectedAttributes };

    //console.log(updatedSelectedAttributes[attributeName])
    //console.log(selectedFoodItem.attributesArr[attributeName].isSingleSelected)
    if (selectedFoodItem.attributesArr[attributeName].isSingleSelected) {
      // If isSingleSelected is true, set the selected variation as a string
      if (updatedSelectedAttributes[attributeName] === null) {
        updatedSelectedAttributes[attributeName] = variationType;
      }
      if (updatedSelectedAttributes[attributeName] === variationType) {
        delete updatedSelectedAttributes[attributeName];

      } else {
        updatedSelectedAttributes[attributeName] = variationType;
      }
    } else {
      // If isSingleSelected is false, allow multiple selections as an array
      if (!updatedSelectedAttributes[attributeName]) {
        console.log("If the attribute is not selected yet, initialize it as an array")

        updatedSelectedAttributes[attributeName] = [variationType];
      } else {
        console.log("If the attribute is already selected, add or remove from the array")
        if (init) {
        } else {
          // If the attribute is already selected, add or remove from the array
          if (updatedSelectedAttributes[attributeName].includes(variationType)) {
            console.log("remove")
            updatedSelectedAttributes[attributeName] = updatedSelectedAttributes[attributeName].filter(
              (selected) => selected !== variationType
            );

          } else {
            console.log("add")
            updatedSelectedAttributes[attributeName] = [
              ...updatedSelectedAttributes[attributeName],
              variationType,
            ];
          }
        }


        // If the array becomes empty after modification, delete it from the object
        if (updatedSelectedAttributes[attributeName].length === 0) {

          delete updatedSelectedAttributes[attributeName];
        } else {
          // Sort the array if it is not empty
          updatedSelectedAttributes[attributeName].sort();
        }
      }
    }
    const newTotalPrice = TotalAttributePrice(updatedSelectedAttributes, selectedFoodItem.attributesArr);
    const products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));
    const product = products.find((product) => product.id === id && product.count === count);

    if (Math.round(100 * ((parseFloat(newTotalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100 >= 0) {
      console.log('click ok')
      setTotalPrice(newTotalPrice);
      // Update the state with the new selected attributes
      setSelectedAttributes(updatedSelectedAttributes);

      // After updating selectedAttributes, recalculate the total price
      product.attributeSelected = updatedSelectedAttributes
      product.itemTotalPrice = Math.round(100 * ((parseFloat(newTotalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100
      // SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))
      // 编辑过程中只更新localStorage，不调用SetTableInfo避免频繁数据库操作
      localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products))
    } else {
      console.error('select error: price error')
    }


    saveId(Math.random());

  };


  // Function to calculate the total price based on selected attributes
  const TotalAttributePrice = (selectedAttributes, attributesArr) => {
    let total = 0;

    for (const attributeName in selectedAttributes) {
      const selectedVariations = selectedAttributes[attributeName];
      const attributeDetails = attributesArr[attributeName];

      if (attributeDetails?.isSingleSelected) {
        // For single selection attributes, find the selected variation and add its price
        const selectedVariation = attributeDetails?.variations.find(
          (variation) => variation.type === selectedVariations
        );
        if (selectedVariation) {
          total += selectedVariation.price;
        }
      } else {
        // For multiple selection attributes, iterate through selected variations
        selectedVariations?.forEach((selectedVariation) => {
          const variation = attributeDetails?.variations?.find(
            (variation) => variation.type === selectedVariation
          );
          if (variation) {
            total += variation.price;
          }
        });
      }
    }

    return total;
  };


  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams(window.location.search);

  const storeValue = store

  //console.log(storeValue)

  const [data, setData] = useState([]);
  const [storeInfo, setStoreInfo] = useState({});
  const [foodTypes, setFoodTypes] = useState([]);
  const [foodTypesCHI, setFoodTypesCHI] = useState([]);
  const formatPriceDisplay = (price) => {
    return price > 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`;
  };

  const fetchPost = async (name) => {
    const docRef = doc(db, "TitleLogoNameContent", name);
    // Get a reference to the specific document with ID equal to store
    try {
      // Listen for document updates
      const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        console.log(docSnapshot);
        // Check if a document was found
        if (docSnapshot.exists()) {
          // The document exists
          const docData = docSnapshot.data();
          setGlobal(JSON.parse(docSnapshot.data().globalModification || [])); // Assuming the data structure includes `globalModification`

          // Save the fetched data to sessionStorage
          sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(docData));
          // Assuming you want to store the key from the fetched data as "Food_arrays"
          localStorage.setItem("Food_arrays", docData.key);
          setData(JSON.parse(docData.key));
          console.log("JSON.parse(docData.key)")
          console.log(JSON.parse(docData.key))
          setFoods(JSON.parse(docData.key));
          setFoodTypes([...new Set(JSON.parse(docData.key).map(item => item.category))]);
          setFoodTypesCHI([...new Set(JSON.parse(docData.key).map(item => item.categoryCHI))]);
          console.log(JSON.parse(docData.key));
          console.log([...new Set(JSON.parse(docData.key).map(item => item.category))]);
          setFoods(
            JSON.parse(docData.key).filter((item) => {
              return item.category === [...new Set(JSON.parse(docData.key).map(item => item.category))][0];
            })
          )
          setSelectedFoodType([...new Set(JSON.parse(docData.key).map(item => item.category))][0]);

        } else {
          setGlobal(JSON.parse(docSnapshot.data().globalModification || [])); // Assuming the data structure includes `globalModification`
          if (!localStorage.getItem("Food_arrays") || localStorage.getItem("Food_arrays") === "") {
            localStorage.setItem("Food_arrays", "[]");
            setFoodTypes([...new Set([].map(item => item.category))]);
            setFoodTypesCHI([...new Set([].map(item => item.categoryCHI))]);
            setData([]);
            setFoods([]);
          } else {
            setFoodTypes([...new Set(JSON.parse(localStorage.getItem("Food_arrays")).map(item => item.category))]);
            setFoodTypesCHI([...new Set(JSON.parse(localStorage.getItem("Food_arrays")).map(item => item.categoryCHI))]);
            setData(JSON.parse(localStorage.getItem("Food_arrays")));
            setFoods(JSON.parse(localStorage.getItem("Food_arrays")));
          }
          console.log("No document found with the given name.");
        }
      });

      return unsubscribe; // Returns the unsubscribe function to stop listening for updates
    } catch (error) {
      if (!localStorage.getItem("Food_arrays") || localStorage.getItem("Food_arrays") === "") {
        localStorage.setItem("Food_arrays", "[]");
        setData([]);
        setFoods([]);
      } else {
        setData(JSON.parse(localStorage.getItem("Food_arrays")));
        setFoods(JSON.parse(localStorage.getItem("Food_arrays")));
      }
      console.error("Error fetching the document:", error);
    }
  }

  useEffect(() => {
    fetchPost(storeValue);
    //console.log("hello")
  }, []); // <-- Empty dependency array

  // 新增：页面加载时检查和恢复所有定时器
  useEffect(() => {
    const checkAllTimers = () => {
      console.log(`[Food.js] checkAllTimers called at ${new Date().toLocaleTimeString()}. Store:`, store);
      if (!store) {
        console.warn('[Food.js] checkAllTimers: store is not yet available. Aborting timer check.');
        return;
      }
      const timersToProcess = [];
      console.log('[Food.js] Scanning localStorage. Total items:', localStorage.length);
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`activeTimer-${store}-`)) {
          console.log('[Food.js] Found potential timer key:', key);
          try {
            const timerDetailsString = localStorage.getItem(key);
            if (timerDetailsString) {
              const timerDetails = JSON.parse(timerDetailsString);
              console.log('[Food.js] Parsed timerDetails for key:', key, timerDetails);
              // CORRECTED: Validate based on itemSnapshot and its essential fields
              if (timerDetails &&
                timerDetails.action &&
                typeof timerDetails.absoluteEndTime === 'number' &&
                timerDetails.originalStore === store && // Ensure it's for the current store
                timerDetails.itemSnapshot &&           // Ensure itemSnapshot object exists
                typeof timerDetails.itemSnapshot.id !== 'undefined' &&  // Ensure id exists within itemSnapshot
                typeof timerDetails.itemSnapshot.count !== 'undefined' // Ensure count exists within itemSnapshot
              ) {
                timersToProcess.push({ key, ...timerDetails });
              } else {
                console.warn('[Food.js] Invalid or incomplete timer data (e.g., missing itemSnapshot or essential fields like id/count within snapshot) for key:', key, 'Details:', timerDetails, 'Expected store:', store);
                // Optionally, clean up invalid timer entries from localStorage
                // localStorage.removeItem(key);
              }
            }
          } catch (error) {
            console.error('[Food.js] Error parsing timer data from localStorage for key:', key, error);
          }
        }
      }

      console.log(`[Food.js] Timers to process after filtering for store '${store}':`, timersToProcess.length, timersToProcess.map(t => ({ key: t.key, action: t.action, table: t.originalSelectedTable })));

      timersToProcess.forEach(timer => {
        const now = Date.now();
        // Destructure itemSnapshot from the timer object
        const { key, action, absoluteEndTime, originalSelectedTable, itemSnapshot } = timer;

        // Validate that itemSnapshot exists and has the necessary fields (itemId, itemCount)
        if (!itemSnapshot || typeof itemSnapshot.id === 'undefined' || typeof itemSnapshot.count === 'undefined') {
          console.error(`[Food.js] Invalid or missing itemSnapshot in timer ${key}. Cleaning up. Snapshot:`, itemSnapshot);
          localStorage.removeItem(key); // Clean up problematic timer
          return; // Skip this timer
        }

        // Now use itemId and itemCount from the validated itemSnapshot for logging or other non-critical paths
        const { id: itemId, count: itemCount } = itemSnapshot;

        console.log(`[Food.js] Processing timer: ${key}, Table: ${originalSelectedTable}, Item from Snapshot: ${itemId}-${itemCount}, Action: ${action}, EndTime: ${new Date(absoluteEndTime).toLocaleTimeString()}, Now: ${new Date(now).toLocaleTimeString()}`);

        if (now >= absoluteEndTime) {
          console.log(`[Food.js] Timer ${key} for table ${originalSelectedTable} has EXPIRED. Action: ${action}. Executing now.`);
          if (action === 'Auto Checkout') {
            executeRestoredAutoCheckout(key, originalSelectedTable, itemSnapshot); // CORRECTED: Pass itemSnapshot object
          } else if (action === 'Continue Billing') {
            console.log(`[Food.js] ${originalSelectedTable} (Restored Timer) - Continue Billing. Removing timer key: ${key}`);
            localStorage.removeItem(key);
          } else {
            console.warn(`[Food.js] Unknown action '${action}' for expired timer ${key}. Removing.`);
            localStorage.removeItem(key);
          }
        } else {
          const remainingTime = absoluteEndTime - now;
          console.log(`[Food.js] Restoring timer ${key} for table ${originalSelectedTable}. Action: ${action}. Remaining: ${Math.floor(remainingTime / 1000)}s`);
          setTimeout(() => {
            const stillExists = localStorage.getItem(key);
            if (stillExists) {
              console.log(`[Food.js] setTimeout for ${key} (table ${originalSelectedTable}) fired at ${new Date().toLocaleTimeString()}. Action: ${action}.`);
              // Re-parse in case it was updated, though unlikely for this flow
              // const currentTimerDetails = JSON.parse(stillExists);
              if (action === 'Auto Checkout') {
                // itemSnapshot is captured in the closure of setTimeout
                executeRestoredAutoCheckout(key, originalSelectedTable, itemSnapshot); // CORRECTED: Pass itemSnapshot object
              } else if (action === 'Continue Billing') {
                console.log(`[Food.js] ${originalSelectedTable} (Restored Timer via setTimeout) - Continue Billing. Removing timer key: ${key}`);
                localStorage.removeItem(key);
              } else {
                console.warn(`[Food.js] Unknown action '${action}' for pending timer ${key} in setTimeout. Removing.`);
                localStorage.removeItem(key);
              }
            } else {
              console.log(`[Food.js] setTimeout for ${key} (table ${originalSelectedTable}) fired, but key no longer exists. Assuming already processed.`);
            }
          }, remainingTime);
        }
      });
    };

    const executeRestoredAutoCheckout = (timerKey, tableName, itemSnapshotFromStorage) => {
      // itemSnapshotFromStorage now contains the rich item details
      const { id: itemId, count: itemCount, subtotal: itemBasePrice, name: itemName, CHI: itemCHI, image: itemImage, availability: itemAvailability, attributesArr: itemAttributesArr, attributeSelected: itemOriginalAttributeSelected, tableRemarks: itemRemarks, quantity: itemQuantity } = itemSnapshotFromStorage;

      console.log(`[Food.js] executeRestoredAutoCheckout for table: ${tableName}, itemID: ${itemId}, itemCount: ${itemCount}. TimerKey: ${timerKey}`);

      // Retrieve the full timer details to get the billing rule
      const timerDetailsString = localStorage.getItem(timerKey);
      let restoredBillingRule = BILLING_RULES.RULE_5; // Initialize with a default value (exact_minute)
      let restoredCustomConfig = null; // For custom rule parameters

      if (timerDetailsString) {
        try {
          const timerDetails = JSON.parse(timerDetailsString);
          if (timerDetails.billingRule) {
            restoredBillingRule = timerDetails.billingRule;
            console.log(`[Food.js][executeRestoredAutoCheckout] Using billing rule from stored timer: ${restoredBillingRule}`);
            if (restoredBillingRule === BILLING_RULES.CUSTOM_RULE) {
              // Ensure custom parameters are present in timerDetails if it's a custom rule
              if (timerDetails.customFirstBlockDuration !== undefined &&
                timerDetails.customInitialSegmentMinutes !== undefined &&
                timerDetails.customSubsequentSegmentMinutes !== undefined) {
                restoredCustomConfig = {
                  firstBlockDuration: timerDetails.customFirstBlockDuration,
                  initialSegmentMinutes: timerDetails.customInitialSegmentMinutes,
                  subsequentSegmentMinutes: timerDetails.customSubsequentSegmentMinutes
                };
                console.log("[Food.js][executeRestoredAutoCheckout] Loaded custom config for timer:", restoredCustomConfig);
              } else {
                console.warn(`[Food.js][executeRestoredAutoCheckout] Custom rule selected for timer ${timerKey}, but custom parameters are missing. Defaulting custom config.`);
                // Defaulting custom config might lead to incorrect pricing. Consider how to handle.
                // For now, it might fall back to default custom rule behavior if calculatePriceForBillingRule handles null config for custom.
              }
            }
          } else {
            console.warn(`[Food.js][executeRestoredAutoCheckout] Billing rule not found in timerDetails for ${timerKey}. Defaulting to ${restoredBillingRule}.`);
          }
        } catch (e) {
          console.error("[Food.js][executeRestoredAutoCheckout] Error parsing timer details from localStorage for key:", timerKey, e);
          console.warn(`[Food.js][executeRestoredAutoCheckout] Defaulting to ${restoredBillingRule} due to parsing error.`);
        }
      } else {
        console.warn(`[Food.js][executeRestoredAutoCheckout] Timer details not found in localStorage for key: ${timerKey}. Defaulting to ${restoredBillingRule} for billing rule.`);
      }

      // Key for checking if item is still in the cart (uses tableName for cart key)
      const cartKeyForTableValidation = `${store}-${tableName}`;
      const currentCartString = localStorage.getItem(cartKeyForTableValidation);
      const currentCart = JSON.parse(currentCartString || "[]");
      const itemStillInCart = currentCart.find(p => p.id === itemId && p.count === itemCount && p.isTableItem);

      if (!itemStillInCart) {
        console.warn(`[Food.js] executeRestoredAutoCheckout: Item ${itemId}-${itemCount} for table ${tableName} no longer in cart. Skipping auto-checkout and cleaning up timer.`);
        localStorage.removeItem(timerKey);
        // Also clean up item-specific keys if they exist, using the CORRECTED format
        const itemSpecificKeyPrefixForOrphaned = `${store}-${itemId}-${itemCount}`;
        localStorage.removeItem(`${itemSpecificKeyPrefixForOrphaned}-isSent_startTime`);
        localStorage.removeItem(`${itemSpecificKeyPrefixForOrphaned}-basePrice`);
        console.log(`[Food.js] Cleaned orphaned item-specific keys for ${itemId}-${itemCount} due to item not in cart. Prefix: ${itemSpecificKeyPrefixForOrphaned}`);
        return;
      }
      console.log(`[Food.js] executeRestoredAutoCheckout: Item ${itemId}-${itemCount} for table ${tableName} confirmed to be in cart. Proceeding with checkout.`);

      // CORRECTED KEY FORMAT: Use ${store}-${itemId}-${itemCount} for item-specific data
      // tableName is NOT part of these item-specific keys.
      const itemSpecificKeyPrefix = `${store}-${itemId}-${itemCount}`;
      const itemStartTimeKey = `${itemSpecificKeyPrefix}-isSent_startTime`;
      const itemOriginalBasePriceKey = `${itemSpecificKeyPrefix}-basePrice`;

      console.log(`[Food.js] Reading item-specific data using corrected keys. StartTimeKey: ${itemStartTimeKey}, BasePriceKey: ${itemOriginalBasePriceKey}`);

      const storedStartTime = localStorage.getItem(itemStartTimeKey);
      let rawFinalPrice = 0.001; // Default minimum before rounding

      if (storedStartTime && !isNaN(parseInt(storedStartTime))) {
        const durationMinutes = Math.floor((Date.now() - parseInt(storedStartTime)) / (1000 * 60));
        const storedOriginalBasePrice = localStorage.getItem(itemOriginalBasePriceKey);
        // itemBasePrice from snapshot is the base price at the time timer was set.
        let actualBasePriceToUse = parseFloat(storedOriginalBasePrice || itemBasePrice || 1.00);
        if (actualBasePriceToUse <= 0) {
          actualBasePriceToUse = 1.00;
        }
        // const basePricePerMinute = actualBasePriceToUse / 60; // Old calculation
        // rawFinalPrice = Math.max(durationMinutes * basePricePerMinute, 0.001); // Old calculation

        // Apply the restored billing rule for price calculation
        const currentHourlyRate = actualBasePriceToUse;
        const minsElapsed = durationMinutes;

        if (currentHourlyRate > 0 && minsElapsed >= 0) {
          // 调用导入的计费函数
          rawFinalPrice = calculatePriceForBillingRule(minsElapsed, currentHourlyRate, restoredBillingRule, restoredCustomConfig);
        } else {
          rawFinalPrice = 0.00; // Default if rate or duration is invalid
        }

        console.log(`[Food.js] Calculated for ${tableName}: Duration ${durationMinutes}m, BasePrice ${actualBasePriceToUse}, BillingRule: ${restoredBillingRule}, CustomConfig: ${JSON.stringify(restoredCustomConfig)}, Raw Fee ${rawFinalPrice}`);
      } else {
        console.warn(`[Food.js] Auto checkout for ${tableName}, item ${itemId}-${itemCount}: Start time not found at ${itemStartTimeKey}. Using minimum fee.`);
        rawFinalPrice = 0.001; // Set to a minimal fee if start time missing, or handle as error
      }

      const finalPrice = Math.max(rawFinalPrice, 0.00); // Ensure final price isn't negative, can be 0.

      // Directly use itemSnapshotFromStorage for itemForCheckout as it contains all necessary fields
      const itemForCheckout = { ...itemSnapshotFromStorage }; // Use a shallow copy to be safe

      console.log('[Food.js] Calling handleTableEnd with itemSnapshotFromStorage (as itemForCheckout):', itemForCheckout, `Final Price (rounded): ${finalPrice.toFixed(2)}`, tableName);
      handleTableEnd(itemForCheckout, finalPrice, tableName);

      console.log('[Food.js] Cleaning up localStorage after restored checkout (using corrected keys):');
      console.log('  Removing itemStartTimeKey:', itemStartTimeKey);
      localStorage.removeItem(itemStartTimeKey);
      console.log('  Removing itemOriginalBasePriceKey:', itemOriginalBasePriceKey);
      localStorage.removeItem(itemOriginalBasePriceKey);
      console.log('  Removing timerKey (activeTimer-...):', timerKey); // This key (timerKey) correctly includes tableName (as originalSelectedTable)
      localStorage.removeItem(timerKey);

      // alert(`${tableName} ${fanyi("(Restored Timer) Auto checkout processed.")}\n${fanyi("Final Fee")}: $${finalPrice.toFixed(2)}`);
    };

    if (store) {
      console.log('[Food.js] Scheduling checkAllTimers in 2.5 seconds.');
      setTimeout(checkAllTimers, 2500); // Increased delay further for safety
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, saveId]); // Assuming saveId is a stable function or related to cart updates that might clear timers indirectly.
  // handleTableEnd should be stable or included if it changes.

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
  // const {id, saveId} = useMyHook(null); // 从这里移走
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  useEffect(() => {
    saveId(Math.random());
  }, [products]);

  const displayAllProductInfo = () => {
    return JSON.parse(localStorage.getItem(store + "-" + selectedTable));
  };

  /**dorp food */


  const [width, setWidth] = useState(window.innerWidth - 64);

  useEffect(() => {

    function handleResize() {
      setWidth(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = width <= 768;
  const isPC = width >= 1024;


  const scrollingWrapperRef = useRef(null);

  useEffect(() => {

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        scrollingWrapperRef.current.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    const wrapper = scrollingWrapperRef.current;
    wrapper.addEventListener('wheel', handleWheel);

    // Cleanup event listener when the component unmounts
    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, []); // Empty dependency array means this useEffect runs once when component mounts


  /**drop food */

  const [foods, setFoods] = useState([]);
  const [selectedFoodType, setSelectedFoodType] = useState(null);


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
  const filterTypeCHI = (categoryCHI) => {
    setFoods(
      data.filter((item) => {
        return item.categoryCHI === categoryCHI;
      })
    )
  }
  const filternameCHI = (CHI) => {
    setFoods(
      data.filter((item) => {
        if (CHI === "") {
          return true;
        }
        const pinyinCHI = convertToPinyin(item.CHI).toLowerCase();
        return item.CHI.includes(CHI) || pinyinCHI.includes(CHI.toLowerCase());
      })
    );
  }
  const [input, setInput] = useState("");

  const handleInputChange = (event) => {
    setInput(event.target.value);
    if (localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中")) {
      filternameCHI(event.target.value);

    } else {
      filtername(event.target.value);

    }
  }
  // timesClicked is an object that stores the number of times a item is clicked
  //const timesClicked = new Map();
  const modalRef = useRef(null);

  const openModalList = () => {
    modalRef.current.style.display = 'block';
    // Retrieve the array from local storage
  };
  const closeModalList = () => {

    modalRef.current.style.display = 'none';


  };

  const divStyle = {
    color: 'black',
  };
  const { user, user_loading } = useUserContext();
  const addSpecialFood = (id, name, subtotal, image, attributeSelected, count, CHI, item, availability, attributesArr, quant, isTableItem = false, tableRemarks = '') => {

    // Check if the array exists in local storage
    if (localStorage.getItem(store + "-" + selectedTable) === null) {
      // If it doesn't exist, set the value to an empty array
      SetTableInfo(store + "-" + selectedTable, JSON.stringify([]))
    }
    if (!localStorage.getItem(store + "-" + selectedTable)) {
      // If it doesn't exist, set the value to an empty array
      SetTableInfo(store + "-" + selectedTable, JSON.stringify([]))
    }
    // Retrieve the array from local storage

    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));

    // Find the product with the matching id
    //let product = products.find((product) => product.id === id);
    const product = products?.find((product) => product.id === id && product.count === count);
    // If the product exists, update its name, subtotal, image, and timesClicked values
    if (product) {
      product.name = name;
      product.subtotal = subtotal;
      product.image = image;
      product.quantity++;
      product.attributeSelected = attributeSelected;
      product.count = count;
      product.itemTotalPrice = Math.round(100 * ((parseFloat(totalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100;
      product.CHI = CHI;
      product.availability = availability
      product.attributesArr = attributesArr
      product.isTableItem = isTableItem; // 添加开台标识
      product.tableRemarks = tableRemarks; // Explicitly add tableRemarks
    } else {
      // If the product doesn't exist, add it to the array
      products?.unshift({
        attributesArr: attributesArr,
        availability: availability,
        id: id,
        name: name,
        subtotal: subtotal,
        image: image,
        quantity: quant ? quant : 1,
        attributeSelected: attributeSelected,
        count: count,
        itemTotalPrice: Math.round(100 * subtotal) / 100,
        CHI: CHI,
        isTableItem: isTableItem, // 添加开台标识
        tableRemarks: tableRemarks, // Explicitly add tableRemarks
      });
    }
    //product.itemTotalPrice= Math.round(100 *((parseFloat(totalPrice)+parseFloat(product.subtotal))*parseFloat(product.quantity))/ 100)
    console.log(product)
    // Update the array in local storage
    //SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))
    //  handleAttributeSelect("Customized Option", "外卖TakeOut", id, count, {}, false)
    //8   console.log(selectedFoodItem)

    if (!item || !item.attributesArr) {

      SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))
      return;
    }

    SetTableInfo(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(products)));
    // setSelectedFoodItem(products)


  };


  const deleteSpecialFood = (id, count, attributeSelected, isDelete) => {
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));
    if (products && products.length > 0) {
      // Find the index of the product with the given id
      //const productIndex = products.findIndex((item) => item.id === id);
      let productIndex = products.findIndex((product) => product.id === id && product.count === count);

      // If the product is found, decrement its quantity
      if (productIndex !== -1) {

        products[productIndex].quantity -= 1;
        if (isDelete === 0) {//0 means false
          console.log("delete now")
          products.splice(productIndex, 1);
          SetTableInfo(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(products)))
          saveId(Math.random());
          setModalVisibility(false);
          handleRemoveAllCustomVariants();
          return
        }
        // If the quantity becomes 0, remove the product from the array
        if (products[productIndex].quantity <= 0) {
          console.log("delete now")
          products.splice(productIndex, 1);

          SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))
          saveId(Math.random());
          setModalVisibility(false);
          handleRemoveAllCustomVariants();
          return
        }
        const product = products.find((product) => product.id === id && product.count === count);
        console.log(products[productIndex])
        console.log(product)
        product.itemTotalPrice = Math.round(100 * ((parseFloat(totalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100
        // Save the updated array in local storage

        SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))
      }

    }
    saveId(Math.random());
  };
  const searchSpeicalFoodQuantity = (id, count) => {
    // Retrieve the array from local storage
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));
    const product = products?.find((product) => product.id === id && product.count === count);
    // If the product is not found or the quantity is less than or equal to 0, return 0
    return product ? product.quantity : 0;
  };

  const [translationsMode_, settranslationsMode_] = useState("en");

  // 本地翻译数组
  const localTranslations = [
    { input: "Start Table", output: "开台" },
    { input: "End Table", output: "结台" },
    { input: "Table Timing", output: "开台计时" },
    { input: "Search Food Item", output: "搜索食品" },
    { input: "Start", output: "开始时间" },
  ];

  function translateLocal(input) {
    const translation = localTranslations.find(t => t.input.toLowerCase() === input.toLowerCase());
    return translation ? translation.output : null;
  }

  function fanyi(input) {
    return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translateLocal(input) || input : input;
  }

  // for translations sake
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = useMemo(() => {
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const translationsMode = sessionStorage.getItem("translationsMode")
    settranslationsMode_(sessionStorage.getItem("translationsMode"))
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
  // for businessHours
  // getting today's date
  const tempDate = new Date();
  const currentWeekday = tempDate.getDay();

  function parseTime(timeStr) {
    if (timeStr == "xxxx") {
      return { closed: true }
    }

    // console.log("timeString")
    const [hourStr, minuteStr] = timeStr.match(/\d{2}/g);
    // console.log(hourStr + " " + minuteStr)
    return {
      hours: parseInt(hourStr),
      minutes: parseInt(minuteStr),
      closed: false
    };
  }

  // grabs a timeStr and convert to 12 hr format such as "10:30AM"
  function convertTo12HourFormat(timeStr) {

    // console.log("timeStr in 12 hr: " + JSON.stringify(timeStr))
    const timeObj = parseTime(timeStr)
    if (timeObj.closed) {
      return 'Closed';
    }

    let hours = timeObj.hours;
    let minutes = timeObj.minutes;

    // Determine if it's AM or PM
    let period = 'AM';
    if (hours >= 12 && hours != 24) {
      period = 'PM';

      // Convert from 24 hour time to 12 hour time
      if (hours > 12) {
        hours = hours - 12;
      }
    } else if (hours === 0) {
      // Adjust for 00:xx time
      hours = 12;
    } else if (hours == 24) {
      hours = 0;
    }

    // Return the formatted time string
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
  }


  // currentDayData is basically businessHours
  function isWithinTimeRange(currentDayData) {
    const offset = JSON.parse(sessionStorage.getItem("timezoneOffsets"));
    const offsetHours = parseInt(offset["hours"]);
    const offsetMinutes = parseInt(offset["minutes"]);

    const now = new Date();
    now.setHours(now.getHours() - offsetHours);
    now.setMinutes(now.getMinutes() - offsetMinutes);
    // console.log(now.toUTCString())

    const currentUTCDay = now.getUTCDay(); // Get the current day of the week in UTC (0-6)

    // console.log("currentUTCDay: ", currentUTCDay)
    // console.log(currentDayData[currentUTCDay])
    const { timeRanges, timezone } = currentDayData[currentUTCDay];

    var result = false;
    // const timeRanges = data[day].timeRanges;
    for (const range of timeRanges) {
      const openTime = range.openTime;
      const closeTime = range.closeTime;
      // loop through all the time ranges for the day to see if we are within range
      const openTimeParsed = parseTime(openTime);
      const closeTimeParsed = parseTime(closeTime);

      // if the opening Hours is "xxxx", it is closed for today
      if (openTimeParsed.closed == true) {
        result = false;
        break;
      }

      const openDate = new Date(now);
      openDate.setUTCHours(openTimeParsed.hours);
      openDate.setUTCMinutes(openTimeParsed.minutes);
      // console.log(openDate.toUTCString())

      const closeDate = new Date(now);
      closeDate.setUTCHours(closeTimeParsed.hours);
      closeDate.setUTCMinutes(closeTimeParsed.minutes);
      // console.log(openDate.toUTCString())

      if (closeDate <= openDate) {
        // Add 1 day to the closeDate in UTC
        closeDate.setUTCDate(closeDate.getUTCDate() + 1);
      }

      result = (now >= openDate && now <= closeDate);
      if (result == true) {
        break;
      }
    }
    return result;
  }
  const [isModalVisible, setModalVisibility] = useState(false);
  const [OpenChangeAttributeTrigger, setOpenChangeAttributeTrigger] = useState(false);

  useEffect(() => {
    // Place your side-effect logic here.
    // For example, if OpenChangeAttributeModal is a function you want to call:
    if (OpenChangeAttributeModal === false) {
      //init
    } else {
      showModal(OpenChangeAttributeModal)
      setOpenChangeAttributeTrigger(true)

      //open one
    }

  }, [OpenChangeAttributeModal]); // An empty dependency array means this effect runs once after the initial render

  // useEffect(() => {
  //   if (OpenChangeAttributeTrigger === false) {
  //     setTimeout(() => {
  //       SetTableInfo(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable)))))
  //     }, 100);

  //   }

  // }, [OpenChangeAttributeTrigger]); // An empty dependency array means this effect runs once after the initial render

  const [randomNum, setRandomNum] = useState(null);


  // Function to show the modal
  const showModal = (item) => {
    setCustomVariant({ name: '改价', price: '' })
    const randomNum = uuidv4()
    setSelectedFoodItem(item);//attributeSelected
    console.log("sajows")
    console.log(item)
    setCount(randomNum);  // Increment the count every time the modal is opened

    setTotalPrice(0);
    const attributeSelected = item?.attributeSelected ? item.attributeSelected : {}
    setSelectedAttributes(attributeSelected)
    addSpecialFood(item.id, item.name, item.subtotal, item.image, attributeSelected, randomNum, item.CHI, null, item.availability, item.attributesArr, item.quantity)
    setModalVisibility(true);
    setRandomNum(Math.random())
    saveId(Math.random());
  }
  useEffect(() => {
    if (randomNum !== null) {
      for (let i = 0; i < global?.length; i++) {
        handleAddSpecialVariant(global[i].type, global[i].price, count, selectedFoodItem?.id, global[i].typeCategory);
      }
    }

  }, [randomNum]);  // Execute when count is updated

  // Function to hide the modal
  const hideModal = () => {
    setModalVisibility(false);
    handleRemoveAllCustomVariants();
    // SetTableInfo(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable)))))
    // saveId(Math.random)
    setRandomNum(null)
  }

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
        //groupedItems[key].itemTotalPrice += item.itemTotalPrice;
        groupedItems[key].itemTotalPrice = Math.round((groupedItems[key].itemTotalPrice + item.itemTotalPrice) * 100) / 100;

        // The count remains from the first item
      }
    });

    // Convert the grouped items object back to an array
    return Object.values(groupedItems).reverse();
  }


  const [customVariant, setCustomVariant] = useState({ name: '改价', price: '' });


  const handleAddSpecialVariant = (name, priceString, count, id, category) => {
    console.log(JSON.stringify(name, priceString, count, id, category))
    const price = parseFloat(priceString) || 0;  // Convert price to number here

    if (!name || isNaN(priceString)) {
      alert('Please enter a valid name and price');
      return;
    }

    const updatedFoodItem = { ...selectedFoodItem };
    const updatedAttributes = { ...selectedAttributes };

    if (!updatedFoodItem.attributesArr[category]) {
      updatedFoodItem.attributesArr[category] = {
        isSingleSelected: false,
        variations: [],
      };
    }

    const existingVariantIndex = updatedFoodItem.attributesArr[category].variations.findIndex(
      (variation) => variation.type === name
    );

    if (existingVariantIndex !== -1) {
      // Update price if variant already exists
      updatedFoodItem.attributesArr[category].variations[existingVariantIndex].price = price;
    } else {
      // Add new variant if it doesn't exist
      updatedFoodItem.attributesArr[category].variations.push({
        type: name,
        price: price,
      });
    }

    // Automatically select the new or updated variant
    // updatedAttributes[category] = updatedAttributes[category] || [];
    // console.log(updatedAttributes[category])
    // console.log(name)
    // if (!updatedAttributes[category].includes(name)) {
    //   updatedAttributes[category].push(name);

    // }
    // console.log(category, name, id, count, {})
    // console.log(updatedFoodItem.attributesArr)

    // Assuming 'store', 'selectedTable', 'count', and 'updatedFoodItem' are your variables
    let storeKey = store + "-" + selectedTable;
    let items = JSON.parse(localStorage.getItem(storeKey)); // Step 1 & 2
    console.log(items)
    console.log(updatedFoodItem.attributesArr)
    // Update the item with a specific 'count' ID
    items.forEach(item => { // Step 3
      if (item.count === count) {
        item.attributesArr = updatedFoodItem.attributesArr; // Step 4: Assuming you want to set it to updatedFoodItem's attributesArr
      }
    });

    // Convert the updated array back to a JSON string and save it in local storage
    localStorage.setItem(storeKey, JSON.stringify(items)); // Step 5 & 6
    //handleAttributeSelect(category, name, id, count, {}, true)
    //setSelectedFoodItem(updatedFoodItem);
    //setSelectedAttributes(updatedAttributes);

    setTotalPrice(TotalAttributePrice(updatedAttributes, updatedFoodItem.attributesArr));
    setCustomVariant({ name: '改价', price: '' }); // Reset custom variant input

  };



  const handleAddCustomVariant = (name, priceString, count, id, increase) => {
    let price = parseFloat(priceString) || 0;  // 保存原价，不做免税计算
    if (increase) {
    } else {
      if (parseFloat(selectedFoodItem.itemTotalPrice) > price) {
        price = -(parseFloat(priceString) || 0);  // 保存原价，不做免税计算
      } else {

        alert('Please enter a valid name and price');
        return
      }
    }


    if (!name || isNaN(priceString)) {
      alert('Please enter a valid name and price');
      return;
    }

    const updatedFoodItem = { ...selectedFoodItem };
    const updatedAttributes = { ...selectedAttributes };

    if (!updatedFoodItem.attributesArr['Customized Option']) {
      updatedFoodItem.attributesArr['Customized Option'] = {
        isSingleSelected: false,
        variations: [],
      };
    }

    const existingVariantIndex = updatedFoodItem.attributesArr['Customized Option'].variations.findIndex(
      (variation) => variation.type === name
    );

    if (existingVariantIndex !== -1) {
      // Update price if variant already exists
      updatedFoodItem.attributesArr['Customized Option'].variations[existingVariantIndex].price = price;
    } else {
      // Add new variant if it doesn't exist
      updatedFoodItem.attributesArr['Customized Option'].variations.push({
        type: name,
        price: price,
      });
    }

    // Automatically select the new or updated variant
    updatedAttributes['Customized Option'] = updatedAttributes['Customized Option'] || [];
    console.log(updatedAttributes['Customized Option'])
    console.log(name)
    if (!updatedAttributes['Customized Option'].includes(name)) {
      updatedAttributes['Customized Option'].push(name);

    }
    console.log('Customized Option', name, id, count, {})
    console.log(updatedFoodItem.attributesArr)

    // Assuming 'store', 'selectedTable', 'count', and 'updatedFoodItem' are your variables
    let storeKey = store + "-" + selectedTable;
    let items = JSON.parse(localStorage.getItem(storeKey)); // Step 1 & 2
    console.log(items)
    console.log(updatedFoodItem.attributesArr)
    // Update the item with a specific 'count' ID
    items.forEach(item => { // Step 3
      if (item.count === count) {
        item.attributesArr = updatedFoodItem.attributesArr; // Step 4: Assuming you want to set it to updatedFoodItem's attributesArr
      }
    });

    // Convert the updated array back to a JSON string and save it in local storage
    localStorage.setItem(storeKey, JSON.stringify(items)); // Step 5 & 6
    handleAttributeSelect('Customized Option', name, id, count, {}, true)
    setSelectedFoodItem(updatedFoodItem);
    setSelectedAttributes(updatedAttributes);

    setTotalPrice(TotalAttributePrice(updatedAttributes, updatedFoodItem.attributesArr));
    setCustomVariant({ name: '改价', price: '' }); // Reset custom variant input

  };

  const handleRemoveAllCustomVariants = () => {
    const updatedFoodItem = { ...selectedFoodItem };
    const updatedAttributes = { ...selectedAttributes };

    if (updatedFoodItem.attributesArr['Customized Option']) {
      delete updatedFoodItem.attributesArr['Customized Option'];
      delete updatedAttributes['Customized Option'];

      setSelectedFoodItem(updatedFoodItem);
      setSelectedAttributes(updatedAttributes);
      setTotalPrice(TotalAttributePrice(updatedAttributes, updatedFoodItem.attributesArr));
    } else {
      //alert('No custom variants to remove');
    }
  };
  const [dynamicHeight, setDynamicHeight] = useState('60vh');
  const [dynamicHeightLazy, setDynamicHeightLazy] = useState('60vh');

  useEffect(() => {
    // Function to calculate the dynamic height
    const updateHeight = () => {
      if (scrollingWrapperRef.current) {
        const wrapperHeight = scrollingWrapperRef.current.getBoundingClientRect().height;
        const viewportHeight = window.innerHeight; // Get the viewport height
        const dynamicHeightValue = isMobile ? `calc(80vh - ${wrapperHeight}px)` : `calc(60vh - ${wrapperHeight}px)`; // Calculate the dynamic height
        setDynamicHeight(dynamicHeightValue); // Set the dynamic height
        setDynamicHeightLazy(isMobile ? `calc(80vh - ${wrapperHeight - 4}px)` : `calc(60vh - ${wrapperHeight - 4}px)`)
      }
    };

    // Call updateHeight initially and also on window resize
    updateHeight();
    window.addEventListener('resize', updateHeight);

    // Cleanup function to remove the event listener
    return () => window.removeEventListener('resize', updateHeight);
  }, [scrollingWrapperRef, isMobile]); // Add isMobile to the dependency array if the layout changes with it

  if (false) {
    return <p>  <div className="pan-loader">
      Loading...
    </div></p>;
  } else {


    return (

      <div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>

        {isModalVisible && (

          <div id={count} className="fixed top-0 left-0 right-0 bottom-0 z-[9999] w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-h-full ">
              <div className="relative bg-white rounded-lg border-black shadow">

                <div className='p-4 pt-3 pb-0'>
                  <div className='mb-1 flex flex-col md:flex-row gap-3'>
                    <div className='flex-1'>
                      <h4 className='notranslate'>
                        {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(selectedFoodItem?.CHI) : (selectedFoodItem?.name)}
                      </h4>

                      <div
                        style={{
                          border: '1px solid #ccc',
                          padding: '1rem',
                          borderRadius: '5px',
                        }}
                      >
                        <div className="flex flex-row gap-3 mb-2">
                          <div className="w-1/2">
                            <label className="form-label">
                              {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? "更改理由（比如加蒜）" : "Update Reason (E.g. add garlic)"}

                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="customVariantName"
                              placeholder="Reason for price change"
                              value={customVariant.name}
                              onChange={(e) =>
                                setCustomVariant({ ...customVariant, name: e.target.value })
                              }
                              translate="no"
                            />

                          </div>

                          <div className="w-1/2">
                            <label htmlFor="customVariantPrice" className="form-label">Amount Update (Enter "0" if no change)</label>
                            <input
                              type="text"
                              className="form-control"
                              id="customVariantPrice"
                              placeholder="0"
                              value={customVariant.price}
                              onChange={(e) =>
                                setCustomVariant({ ...customVariant, price: e.target.value })
                              }
                              translate="no"
                            />
                          </div>
                        </div>

                        <div className='flex justify-start mt-3 gap-2'>
                          <button
                            className="btn btn-warning mb-1 "
                            type="button"
                            style={{ whiteSpace: 'nowrap', "display": "inline" }}
                            onClick={() => handleAddCustomVariant(customVariant.name, customVariant.price, count, selectedFoodItem?.id, true)}
                          >
                            Add <span
                              className='notranslate'>${customVariant.price === '' ? 0 : customVariant.price}</span>
                          </button>
                          <button
                            className="btn btn-info mb-1 "
                            type="button"
                            style={{ whiteSpace: 'nowrap', "display": "inline" }}
                            onClick={() => handleAddCustomVariant(customVariant.name, customVariant.price, count, selectedFoodItem?.id, false)}
                          >
                            Subtract <span
                              className='notranslate'>${customVariant.price === '' ? 0 : customVariant.price}</span>
                          </button>
                          <button
                            className="btn btn-primary mb-1"
                            type="button"
                            style={{ whiteSpace: 'nowrap', "display": "inline" }}
                          >
                            Tax Exempt
                          </button>

                        </div>
                      </div>


                    </div>

                    {isPC && (
                      <div className='flex-1 flex'>
                        {/* 数字键盘 */}
                        <div className="w-2/3 pr-2">
                          <NumberPad
                            inputValue={customVariant.price}
                            onInputChange={(value) => setCustomVariant({ ...customVariant, price: value })}
                            onCancel={() => { }}
                            show={true}
                            embedded={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {Object.keys(selectedFoodItem?.attributesArr).length > 0 && (
                    <div>
                      Choose the Revise: (Green-highlighted revise are already chosen)
                    </div>
                  )}
                  {Object.entries(selectedFoodItem?.attributesArr).map(([attributeName, attributeDetails]) => (

                    <div key={attributeName}>
                      <p className="mb-1">
                        <span className='text-black' style={{ cursor: "pointer", display: "inline-block" }}>
                          {attributeName} {attributeDetails.isSingleSelected ? "(Choose 1)" : "(多选)"}
                        </span>
                      </p>

                      <div className='flex flex-wrap'>
                        {attributeDetails.variations.map((variation, idx) => (
                          <div key={idx}>
                            <div
                              className={`mb-1 mr-1 mt-1 btn btn-light ${attributeDetails.isSingleSelected
                                ? selectedAttributes[attributeName] === variation.type
                                  ? 'selected-variation bg-success text-white'
                                  : ''
                                : selectedAttributes[attributeName]?.includes(variation.type)
                                  ? 'selected-variation bg-success text-white'
                                  : ''
                                }`}
                              style={{
                                position: 'relative',
                                fontFamily: "Suisse Int'l",
                                fontStyle: 'normal',
                                fontWeight: 600,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                              }}
                              onClick={(e) => {
                                handleAttributeSelect(attributeName, variation.type, selectedFoodItem.id, count, {}, false);
                                if (attributeName === "Customized Option") {
                                  setCustomVariant({ ...customVariant, name: variation.type });
                                }
                              }}
                            >
                              <span class="notranslate">
                                {variation.type}
                              </span>
                              <span class="notranslate">
                                ({formatPriceDisplay(variation.price)})
                              </span>
                            </div>
                          </div>
                        ))}


                      </div>
                    </div>
                  ))}

                  {/* <pre>{JSON.stringify(selectedAttributes, null, 2)}</pre>
                  <div>{searchSpeicalFoodQuantity(selectedFoodItem.id, count)}</div> */}
                </div>
                {/* {OpenChangeAttributeTrigger ?
                  null
                  :
                  <div className='p-4 pt-3 flex justify-between'>
                    <div>

                      <div>
                        <span class="text-lg notranslate">
                          ${(Math.round(100 * ((parseFloat(selectedFoodItem.subtotal) + parseFloat(totalPrice)) * parseFloat(searchSpeicalFoodQuantity(selectedFoodItem.id, count)))) / 100).toFixed(2)}
                        </span>
                        {priceError}
                      </div>

                    </div>
                    <div>
                      <span>

                        <div>
                          <div className="d-flex align-items-center">
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                deleteSpecialFood(selectedFoodItem.id, count, selectedAttributes, 1);
                                //saveId(Math.random());
                              }}
                            >
                              Delete
                            </button>
                            <span className="mx-4 notranslate text-lg font-bold">
                              {searchSpeicalFoodQuantity(selectedFoodItem.id, count)}
                            </span>
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                addSpecialFood(selectedFoodItem.id, selectedFoodItem.name, selectedFoodItem.subtotal, selectedFoodItem.image, selectedAttributes, count, selectedFoodItem.CHI, null, selectedFoodItem.availability, selectedFoodItem.attributesArr);
                                saveId(Math.random());
                              }}
                            >
                              Add
                            </button>
                          </div>

                        </div>


                      </span>
                    </div>

                  </div>} */}
                <div className="flex justify-between p-4 ">

                  <button type="button" onClick={() => {
                    deleteSpecialFood(selectedFoodItem.id, count, selectedAttributes, 0);
                    setOpenChangeAttributeTrigger(false);
                    setOpenChangeAttributeModal(false)
                  }} className="btn btn-danger">Cancel</button>
                  <button type="button" className="btn btn-success" onClick={() => {
                    if (OpenChangeAttributeTrigger === false) {
                      hideModal();//no change
                    } else {
                      function sortObject(obj) {
                        return Object.keys(obj).sort().reduce((result, key) => {
                          result[key] = obj[key];
                          return result;
                        }, {});
                      }

                      function compareObjects(obj1, obj2) {
                        const sortedObj1 = sortObject(
                          JSON.parse(localStorage.getItem(store + "-" + selectedTable)).find(product => product.count === selectedFoodItem.count).attributeSelected);
                        const sortedObj2 = sortObject(
                          JSON.parse(localStorage.getItem(store + "-" + selectedTable)).find(product => product.count === count).attributeSelected);

                        const serializedObj1 = JSON.stringify(sortedObj1);
                        const serializedObj2 = JSON.stringify(sortedObj2);
                        return serializedObj1 === serializedObj2;
                      }
                      //1st is old, second is new.
                      console.log(selectedFoodItem.attributeSelected)
                      console.log(selectedAttributes)
                      if (compareObjects(selectedFoodItem.attributeSelected, selectedAttributes)) {//no attr changes
                        if (totalPrice != selectedFoodItem.totalPrice) {
                          deleteSpecialFood(selectedFoodItem.id, selectedFoodItem.count, selectedAttributes, 0);//delete old one
                          //SetTableInfo(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable)))))
                          console.log("confirm the change")
                          setOpenChangeAttributeTrigger(false);//confirm the change
                          setOpenChangeAttributeModal(false)
                        } else {
                          deleteSpecialFood(selectedFoodItem.id, count, selectedAttributes, 0);//delete new one

                            console.log("cancel the change")
                            setOpenChangeAttributeTrigger(false);
                            setOpenChangeAttributeModal(false)

                          }

                        } else {
                          deleteSpecialFood(selectedFoodItem.id, selectedFoodItem.count, selectedAttributes, 0);//delete old one

                          console.log("confirm the change")
                          setOpenChangeAttributeTrigger(false);//confirm the change
                          setOpenChangeAttributeModal(false)

                        }

                        // 确认后统一调用SetTableInfo保存最终状态到数据库
                        setTimeout(() => {
                          SetTableInfo(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable)))))
                        }, 100);


                    }


                  }}>Confirm</button>
                </div>
              </div>
            </div>
          </div>
        )
        }
        <div ref={modalRef} className="foodcart-modal modal">


          {/* popup content */}
          <div className="shopping-cart" >
            <div className='title pb-1 border-0'>

              <div className=' flex justify-end mb-2'>


                <DeleteSvg className="delete-btn " style={{ cursor: 'pointer', margin: '0' }} onClick={closeModalList}></DeleteSvg>
              </div>
              {/* shoppig cart */}

            </div>
            <div style={width > 575 ? { overflowY: "auto", borderBottom: "1px solid #E1E8EE" } : {
              overflowY: "auto",
              borderBottom: "1px solid #E1E8EE"
            }}>
              <div className={` ${!isMobile ? "mx-4 my-2" : "mx-4 my-2"}`}>

                <div style={{ width: "-webkit-fill-available" }}>
                  <div className="description" style={{ width: "-webkit-fill-available" }}>

                    <div className='' style={{ width: "-webkit-fill-available" }}>
                      <div
                        className="text-black text-lg"
                        style={{
                          color: "black",
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start"
                        }}
                      >
                        {foodTypes.slice().reverse().map((foodType) => (
                          <button
                            key={foodType}
                            onClick={() => {
                              filterType(foodType);
                              setSelectedFoodType(foodType);
                              closeModalList()
                            }}

                            className={`border-black-600 rounded-xl px-2 py-2 ${selectedFoodType === foodType ? 'bg-gray-200 text-black-600' : 'text-gray-600'}`}
                            style={{
                              width: "100%",
                              display: 'block',
                              textUnderlineOffset: '0.5em',
                              textAlign: 'left'
                            }}
                          >
                            <div>
                              {foodType && foodType.length > 1
                                ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1))
                                : ''}
                            </div>
                          </button>
                        ))}
                      </div>


                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
        <div className='m-auto '>

          <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
            {/* Filter Type */}
            <div className='Type'>
              {/* <div className='flex justify-between flex-wrap'> */}

              {/* web mode */}
              {!view ?
                <div>
                  <div className='hstack gap-2 mt-2'>
                    <form className="w-full w-lg-full">
                      <div className='input-group input-group-sm input-group-inline shadow-none'>
                        <span className='input-group-text pe-2 rounded-start-pill'>
                          <i className='bi bi-search'></i>
                        </span>

                        <input
                          type="search"
                          class="form-control text-base shadow-none rounded-end-pill"
                          placeholder={t('Search Food Item')}
                          onChange={handleInputChange}
                          translate="no"
                          style={{ fontSize: '16px' }}
                          value={input}

                        />

                      </div>
                    </form >
                  </div>
                </div>
                : null}
              {/* end of the top */}

              <div ref={scrollingWrapperRef}>
                {!view ?


                  <div className='flex rounded-lg'>
                    {/* <div
                      className="m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 text-lg absolute z-10 right-0 scroll-gradient-right"
                      style={{ pointerEvents: 'none' }}
                    >
                      &nbsp;
                    </div> */}

                    {/* <div onClick={() => {
                      openModalList()
                    }} className="mt-2 m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 text-lg ">
                      <FontAwesomeIcon icon={faList} />
                    </div> */}

                    <></>
                    <div
                      className="scrolling-wrapper-filter relative mt-2">
                      {foodTypes.map((foodType, index) => {
                        // Ensure we don't go out of bounds
                        if (index % 2 !== 0) return null;

                        const nextFoodType = foodTypes[index + 1];

                        return (
                          <button
                            key={foodType}

                            style={{ display: "inline-block", textUnderlineOffset: "0.5em" }}
                          >
                            <div
                              onClick={() => {
                                filterType(foodType);
                                setSelectedFoodType(foodType);
                                setInput("");
                              }}
                              className={`rounded-xl px-2 py-2 text-black m-2 ${selectedFoodType === foodType ? "bg-gray-400" : "bg-gray-200"
                                }`}
                            >
                              {foodType && foodType.length > 1
                                ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1))
                                : ""}
                            </div>
                            {nextFoodType && (
                              <div
                                onClick={() => {
                                  filterType(nextFoodType);
                                  setSelectedFoodType(nextFoodType);
                                  setInput("");
                                }}
                                className={`rounded-xl px-2 py-2 text-black m-2 ${selectedFoodType === nextFoodType ? "bg-gray-400" : "bg-gray-200"
                                  }`}
                              >
                                {nextFoodType.length > 1
                                  ? t(nextFoodType.charAt(0).toUpperCase() + nextFoodType.slice(1))
                                  : ""}
                              </div>
                            )}
                          </button>
                        );
                      })}


                    </div>
                  </div>
                  :
                  null}

              </div>


            </div>

          </div>
          {!view ?
            <LazyLoad>

              {/* diplay food */}
              <AnimatePresence>
                <div className='flex flex-wrap gap-3 pt-3 px-2' style={{
                  overflowY: 'auto',
                  maxHeight: `calc(100vh - 370px)`
                }}>
                  {foods.filter(item => !(item?.name === "Enter Meal Name" && item?.CHI === "填写菜品名称")).map((item, index) => (
                    <motion.div
                      onClick={(e) => {
                        e.stopPropagation(); // This stops the click from propagating to the parent elements
                        if (item.CHI.includes("开台")) {
                          setSelectedTableItem(item);
                          setIsTableTimingModalOpen(true);
                        } else {
                          if (Object.keys(item.attributesArr).length > 0) {
                            showModal(item);
                          } else {
                            const randomNum = uuidv4()
                            setCount(randomNum);  // Increment the count every time the modal is opened
                            setSelectedAttributes({})
                            setTotalPrice(0);
                            addSpecialFood(item.id, item.name, item.subtotal, item.image, {}, randomNum, item.CHI, item, item.availability, item.attributesArr)
                          }
                        }


                      }}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      key={item.id}
                              className="border border-black rounded cursor-pointer"
                              style={{
                                width: isMobile
                                  ? 'calc(100% - 12px)'  // 移动端：每行一个，减去gap间距
                                  : 'calc(33.333% - 8px)',  // 桌面端：固定三列宽度
                                minWidth: isMobile ? '280px' : '300px',  // 最小宽度
                                maxWidth: isMobile ? 'none' : 'calc(33.333% - 8px)',  // 最大宽度也固定
                                flexShrink: 0,  // 防止收缩
                                flexGrow: 0     // 防止增长
                              }}>
                      <div className='flex'>
                        <div style={{ width: "100%" }}>
                          <div className='flex-row px-2 pb-1 w-full'>

                            {/* parent div of title + quantity and button parent div */}
                            <div className="col-span-4" style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between"
                            }}>
                              <div className="col-span-4 ">
                                <p class="notranslate text-md">
                                  ${(Math.round(item.subtotal * 100) / 100).toFixed(2)}&nbsp;
                                  {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(item?.CHI) : (item?.name)}
                                </p></div>

                              {/* parent div of the quantity and buttons */}

                              {/* ^ end of parent div of quantity and button */}
                            </div>
                                                        <div
                              className='mt-2'
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "10px",
                                flexWrap: "nowrap",  // 防止按钮换行
                                gap: "4px",  // 减少按钮之间的间距
                                alignItems: "center"  // 垂直居中对齐
                              }}>
                              {!item.CHI.includes("开台") ?

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // This stops the click from propagating to the parent elements
                                    showModal(item)
                                  }}
                                  className="btn btn-outline-dark btn-sm d-flex align-items-center"
                                  style={{ whiteSpace: 'nowrap', height: '30px', fontSize: '15px', padding: '2px 8px' }}
                                >
                                  <i className="bi bi-pencil-square me-1"></i>
                                  Edit
                                </button>

                                :
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTableItem(item);
                                    setIsTableTimingModalOpen(true);
                                  }}
                                  className="btn btn-outline-primary btn-sm d-flex align-items-center notranslate"
                                  style={{ whiteSpace: 'nowrap', height: '30px', fontSize: '15px', padding: '2px 8px' }}
                                >
                                  <i className="bi bi-clock me-1"></i>
                                  {fanyi("Start Table")}
                                </button>

                              }


                              <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
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
                                    flexShrink: 0
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
                            </div>
                            {/* ^ end of parent div of title + quantity and buttons */}
                          </div>
                          {/* This is Tony added code */}
                        </div>
                      </div>


                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </LazyLoad> : null
          }


        </div>

          {/* 开台计时弹窗 */}
          <TableTimingModal
              isOpen={isTableTimingModalOpen}
              onClose={() => {
                  setIsTableTimingModalOpen(false);
                  setSelectedTableItem(null);
              }}
              selectedTable={selectedTable}
              store={store}
              tableItem={selectedTableItem}
              onTableStart={handleTableStart}
              onTableEnd={handleTableEnd}
              onRemarksUpdate={SetTableInfo} // 传递SetTableInfo函数用于保存备注到数据库
              forceStartMode={true}
          />
      </div>
    )
  }
}

export default Food

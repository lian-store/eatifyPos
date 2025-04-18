import React, { useState, useEffect } from 'react'
import './Food.css';
import $ from 'jquery';
import './fooddropAnimate.css';
import { useMyHook } from './myHook';
import { useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Button_ from '@mui/material/Button'
import { getFirestore, collection, getDoc, setDoc, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useUserContext } from "../context/userContext";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import QRCode from 'qrcode.react';
import intro_pic from './Best-Free-Online-Ordering-Systems-for-Restaurants.png';
import useGeolocation from '../components/useGeolocation';
import pinyin from 'pinyin';


const Food = () => {
  const [location, getLocation] = useGeolocation();
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const handleFormSubmit = async (e, name, storeNameCHI, TaxRate,address, image, id, physical_address, Description, State, ZipCode, Phone) => {
    console.log(name)
    e.preventDefault();
    if (isCreatingStore) {
      console.log("Already creating store, preventing duplicate submission.");
      return;
    }
    setIsCreatingStore(true);
    setError('');

    try {
      const submitData = {
        storeName: formValues.storeName !== '' ? formValues.storeName : name ? name : "",
        storeNameCHI: formValues.storeNameCHI !== '' ? formValues.storeNameCHI : storeNameCHI,
        TaxRate:formValues.TaxRate !== '' ? formValues.TaxRate : TaxRate,
        Image: formValues.picture !== '' ? formValues.picture : image,
        city: formValues.city !== '' ? formValues.city : address,
        Phone: formValues.Phone !== '' ? formValues.Phone : Phone,
        ZipCode: formValues.ZipCode !== '' ? formValues.ZipCode : ZipCode,
        State: formValues.State !== '' ? formValues.State : State,
        physical_address: formValues.physical_address !== '' ? formValues.physical_address : physical_address,
        Description: formValues.Description !== '' ? formValues.Description : Description,
      }
      const storeNewId = generateIDs(submitData)

      if (!storeNewId) {
        setError("Could not generate a unique store ID. Please check inputs.");
        throw new Error("Store ID generation failed.");
      }

      console.log(storeNewId);
      
      const docRefCheck = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeNewId); 
      const docSnapCheck = await getDoc(docRefCheck);

      if (docSnapCheck.exists()) {
        setError('Store ID already exists!');
        console.error('Store ID already exists!');
      } else {
        setNewIds(storeNewId);
        await handleDemoStoreNameSubmit(storeNewId, submitData);
      }
    } catch (error) {
      console.error("Error during store creation process:", error);
      if (typeof setError === 'function' && !error) {
        setError("An unexpected error occurred during creation.");
      }
      setIsCreatingStore(false);
    } finally {
      // 成功跳转，先不让他按
      // setIsCreatingStore(false);
    }
  };
  const [formValues, setFormValues] = useState({
    storeName: '',
    storeNameCHI: '',
    TaxRate:"",
    city: '',
    picture: '',
    physical_address: '',
    Description: '',

    State: '',
    ZipCode: '',
    Phone: ''
  });


  const [data, setData] = useState({
    storeName: 'demo',
    storeNameCHI: 'demoStore',
    TaxRate:"8.625",
    Address: 'San Francisco',
    picture: '',
    physical_address: '123 Main Street',
    Description: '',

    State: 'CA',
    ZipCode: '90011',
    Phone: '4155551234'
  });
  const handleInputChange = (e) => {


    const { name, value } = e.target;
    console.log(name)
    console.log(value)
    // 特别为 'TaxRate' 字段进行数字验证
    if (name === 'TaxRate') {
      if (/^\d*\.?\d*$/.test(value) || value === "") { // 允许数字和小数点
        setFormValues({
          ...formValues,
          [name]: value
        });
        setError(''); // 清除错误信息
      } else {
        setError('Please enter a valid number for the tax rate.'); // 显示错误信息
      }
    } else {
      // 其他字段不进行数字验证
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };
  function checkGeolocation() {
    getLocation().then((newLocation) => {
      console.log(newLocation.latitude, newLocation.longitude);
      async function getAddress(lat, lng, apiKey) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        try {
          const response = await fetch(`${url}?latlng=${lat},${lng}&key=${apiKey}`);
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
          } else {
            return "No address found for the given coordinates.";
          }
        } catch (error) {
          return `Error: ${error.message}`;
        }
      }

      // Example usage
      const latitude = newLocation.latitude;
      const longitude = newLocation.longitude;
      const apiKey = "AIzaSyCzQFlkWHAXd9NUcxXA2Xl7eCj6lM_w6Ww"; // Replace with your API key

      getAddress(latitude, longitude, apiKey)
        .then(address => {
          console.log(address)
          const addressParts = address.split(", ");
          const [street, city, stateZip] = addressParts;
          const [state, zipCode] = stateZip.split(" ");


          setFormValues({
            ...formValues,
            ["physical_address"]: street.trim(),
            ["city"]: city.trim(),
            ["State"]: state.trim(),
            ["ZipCode"]: zipCode.trim(),
          });
          alert(address + " added successfully!"); // Alert message for successful upload
        })
        .catch(err => console.error(err));
    });
  }
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);


  const { user, user_loading } = useUserContext();

  const handleDemoStoreNameSubmit = async (DemoStorename, submitData) => {
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
    const storeName = DemoStorename;
    const address = "San Francisco";
    const Open_time = "null";
    const data = JSON.stringify([
      {
        "name": "Filet Mignon",
        "category": "Steak Cuts",
        "CHI": "菲力牛排",
        "image": "https://img1.baidu.com/it/u=1363595818,3487481938&fm=253&fmt=auto&app=138&f=JPEG?w=891&h=500",
        "id": "b5fe9fb8-0f83-4b78-8ed5-c9cc3355aa76",
        "subtotal": 1,
        "attributes": [],
        "attributes2": [],
        "attributesArr": {},
        "availability": [
          "Morning",
          "Afternoon",
          "Evening"
        ]
      },
      {
        "name": "Rib Eye Steak",
        "category": "Steak Cuts",
        "CHI": "肋眼牛排",
        "image": "https://img2.baidu.com/it/u=3430421176,2577786938&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
        "id": "8d2579fc-bd3a-4df0-bde5-8884bcbd2919",
        "subtotal": 1,
        "attributes": [],
        "attributes2": [],
        "attributesArr": {},
        "availability": [
          "Morning",
          "Afternoon",
          "Evening"
        ]
      },
      {
        "name": "Porterhouse for Two",
        "category": "Steak Cuts",
        "CHI": "上等腰肉牛排二人份",
        "image": "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
        "id": "267d3107-1532-4084-ab3b-b62ceda0b75c",
        "subtotal": 1,
        "attributes": [],
        "attributes2": [],
        "attributesArr": {},
        "availability": [
          "Morning",
          "Afternoon",
          "Evening"
        ]
      }
    ])
    const clock = { "0": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "1": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "2": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "3": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "4": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "5": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "6": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "7": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" } }
    const restaurant_seat_arrangement = { "table": [{ "type": "rect", "left": 165, "top": 75, "width": 60, "height": 60, "scaleX": 1, "scaleY": 1, "tableName": "A3", "id": "spkjh6o6", "snapAngle": 45, "angle": 0 }, { "type": "rect", "left": 15, "top": 75, "width": 60, "height": 60, "scaleX": 1, "scaleY": 1, "tableName": "A1", "id": "6od2zceo", "snapAngle": 45, "angle": 0 }, { "type": "rect", "left": 90, "top": 75, "width": 60, "height": 60, "scaleX": 1, "scaleY": 1, "tableName": "A2", "id": "cf9612mu", "snapAngle": 45, "angle": 0 }], "chair": [], "wall": [] }
    let docRef;

    try {
      docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeName);
      const newDoc = {
        Name: submitData.storeName === "" ? DemoStorename : submitData.storeName,
        Address: submitData.city,
        Open_time: JSON.stringify(clock),
        key: data,
        Image: "https://s3-media0.fl.yelpcdn.com/bphoto/byOMYO520SGEYxKAbK_PYw/l.jpg",
        stripe_store_acct: "",
        storeOwnerId: user.uid,
        restaurant_seat_arrangement: JSON.stringify(restaurant_seat_arrangement),
        storeNameCHI: submitData.storeNameCHI,
        TaxRate:submitData.TaxRate,
        ZipCode: submitData.ZipCode,
        State: submitData.State,
        Phone: submitData.Phone,
        physical_address: submitData.physical_address,
        Description: 'chinese restaurant that sells food product',
        dailyPayout: false,
        globalModification: JSON.stringify(initialGlobal)
      };
      const tableData = {
        product: "[]",
      };
      try {
        await setDoc(docRef, newDoc);
        await setDoc(doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeName,
          "Table", storeName + "-A1"
        ), tableData);
        await setDoc(doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeName,
          "Table", storeName + "-A2"
        ), tableData);
        await setDoc(doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeName,
          "Table", storeName + "-A3"
        ), tableData);
        window.location.hash = `${DemoStorename}`;
        console.log("Document added successfully!");
      } catch (error) {
        console.error("Error adding document: ", error);
        if (typeof setError === 'function') {
          setError("Failed to save store details. Please try again.");
        } else {
          alert("Failed to save store details. Please try again.");
        }
        throw error;
      }
    } catch (error) {
      console.error("Error within handleDemoStoreNameSubmit: ", error);
      if (typeof setError === 'function') {
        setError("An error occurred saving the store.");
      } else {
        alert("An error occurred saving the store.");
      }
      throw error;
    }
  };
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = width <= 768;
  // Function to convert storeName based on character type
  const convertStoreName = (storeName) => {
    if (/[\u3400-\u9FBF]/.test(storeName)) { // Regex to check for Chinese characters
      return pinyin(storeName, { style: pinyin.STYLE_NORMAL }).join(''); // Convert Chinese to Pinyin without spaces
    } else if (/^[a-zA-Z0-9 ]+$/.test(storeName)) { // Regex to check for English characters and numbers
      return storeName;
    } else {
      return 'aapp'; // Default for other non-English, non-Chinese names
    }
  };

  // Function to generate city initials based on the number of words in the city name
  const getCityInitials = (city) => {
    const words = city?.split(' ');
    if (words?.length > 1) {
      return words.map(word => word[0]).join('').toUpperCase(); // Get first letter of each word
    }
    return city?.slice(0, 2).toUpperCase(); // Get first two letters if only one word
  };

  // Generate a list of potential IDs
  const generateIDs = (data) => {

    const storeNameProcessed = convertStoreName(data.storeName);

    const firstWordOfStoreName = storeNameProcessed?.split(' ')[0];
    const cityInitials = getCityInitials(data.city);
    const zipCode = data.ZipCode;
    let uniqueIds = [];
    for (let i = 0; i < 1000; i++) {
      const randomSuffix = Math.floor(Math.random() * 1000); // Random number to ensure uniqueness
      uniqueIds.push(`${firstWordOfStoreName}-${cityInitials}-${zipCode}-${randomSuffix}`);
    }
    const firstUniqueID = uniqueIds.find(id => !existingIds.includes(id)); // Find the first unique ID
    return firstUniqueID.toLowerCase() || "";
  };

  //const existingIds = ['store1-SF-94118-354-123']; // Example of existing IDs
  const [existingIds, setExistingIds] = useState([]);

  const [newIds, setNewIds] = useState([]);

  const [error, setError] = useState('');



  return (

    <div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>



      <div className={isMobile ? 'flex flex-col' : 'flex flex-row'}>


        <form
          className='mt-4'
          onSubmit={(e) => {
            e.preventDefault(); // Prevent form submission
            handleFormSubmit(e, data?.storeName, data?.storeNameCHI, data?.TaxRate, data?.Address, data?.Image, data?.id, data?.physical_address, data?.Description, data?.State, data?.ZipCode, data?.Phone);
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: isMobile ? '0px' : '20px',
            width: isMobile ? '100%' : '45%',
            borderRadius: !isMobile ? "8px" : "0px", // Apply borderRadius if isMobile is true, otherwise, set it to 0px
            boxShadow: !isMobile ? "0px 0px 10px rgba(0,0,0,0.1)" : "none" // Apply boxShadow if isMobile is true, otherwise, set it to "none"
          }}
        >
          <div className='flex justify-between w-full'>
            <button
              type="button" // Ensures this button doesn't submit the form
              onClick={() => checkGeolocation()}
              className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isCreatingStore}
            >
              <i className="bi bi-geo-alt-fill me-2"></i>
              Auto Fill Address
            </button>

            <button
              type="submit"
              className={`bg-blue-500 text-white font-bold py-2 px-4 rounded flex items-center justify-center ${isCreatingStore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              disabled={isCreatingStore}
            >
              {isCreatingStore ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-house me-2" style={{ color: "#FFFFFF" }}></i>
                  Create Store
                </>
              )}
            </button>
          </div>



          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="storeName">
                Store Display Name
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                id="storeName"
                type="text"
                name="storeName"
                value={formValues.storeName}
                onChange={handleInputChange}
                placeholder={data?.storeName}
                translate="no"
              />
            </div>

            <div className="w-full px-3">
              <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="storeNameCHI">
                Store Display Name in Second Language (Optional)
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                id="storeNameCHI"
                type="text"
                name="storeNameCHI"
                value={formValues.storeNameCHI}
                onChange={handleInputChange}
                placeholder={data?.storeNameCHI}
                translate="no"
              />

            </div>
            <div className="w-full px-3">
              <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="TaxRate">
                Tax Rate (%)
              </label>
              <input
                className={`appearance-none block w-full bg-gray-200 text-gray-700 border ${error ? 'border-red-500' : 'border-gray-300'} rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white`}
                id="TaxRate"
                type="text"
                name="TaxRate"
                value={formValues.TaxRate}
                onChange={handleInputChange}
                placeholder={data?.TaxRate}
                translate="no"
              />
              {error && <p className="text-red-500 text-xs italic">{error}</p>}
            </div>
            <div className="w-full px-3">
              <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="physical_address">
                Street
              </label>
              <input
                className=
                "no translate appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="physical_address"
                type="text"
                name="physical_address"
                value={formValues.physical_address}
                onChange={handleInputChange}
                placeholder={data?.physical_address}
                translate="no"
              />
            </div>
            <div className="w-full px-3">
              <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="city">
                City
              </label>
              <input
                className="no translate appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="city"
                type="text"
                name="city"
                value={formValues.city}
                onChange={handleInputChange}
                placeholder={data?.Address}
                translate="no"
              />
            </div>

            <div className="w-full px-3">
              <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="State">
                State
              </label>
              <input
                className=
                "no translate appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="State"
                type="text"
                name="State"
                value={formValues.State}
                onChange={handleInputChange}
                placeholder={data?.State}
                translate="no"
              />
            </div>
            <div className="w-full px-3">
              <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="ZipCode">
                Zip Code
              </label>
              <input
                className=
                "no translate appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="ZipCode"
                type="text"
                name="ZipCode"
                value={formValues.ZipCode}
                onChange={handleInputChange}
                placeholder={data?.ZipCode}
                translate="no"
              />
            </div>
            <div className="w-full px-3">
              <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="Phone">
                Phone
              </label>
              <input
                className=
                "no translate appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="Phone"
                type="text"
                name="Phone"
                value={formValues.Phone}
                onChange={handleInputChange}
                placeholder={data?.Phone}
                translate="no"
              />
            </div>
          </div>

        </form>


        {/* <form
          className='mt-4 ml-3'
          onSubmit={(e) => {
            e.preventDefault(); // Prevent form submission
            handleFormSubmit(e, data?.Name, data?.storeNameCHI, data?.Address, data?.Image, data?.id, data?.physical_address, data?.Description, data?.State, data?.ZipCode, data?.Phone);
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: isMobile ? '0px' : '20px',
            width: isMobile ? '100%' : '45%',
            borderRadius: !isMobile ? "8px" : "0px", // Apply borderRadius if isMobile is true, otherwise, set it to 0px
            boxShadow: !isMobile ? "0px 0px 10px rgba(0,0,0,0.1)" : "none" // Apply boxShadow if isMobile is true, otherwise, set it to "none"
          }}
        >
          hello
        </form> */}
      </div>
    </div>
  )
}

export default Food
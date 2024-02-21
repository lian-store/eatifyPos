import React from 'react';
import './style.css';
import { useCallback, useState, useEffect } from 'react';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useMyHook } from '../pages/myHook';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import icons8Drawer from './icons8-drawer-32.png'; // Tell webpack this JS file uses this image
import plusSvg from '../pages/plus.svg';
import minusSvg from '../pages/minus.svg';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Row, Col, Container } from "react-bootstrap"
import { useRef } from "react";
import { useUserContext } from "../context/userContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import { data_ } from '../data/data.js'

/**
         const selectedNumber = this.number;
        window.parent.postMessage(selectedNumber, "*");
 */

const theme = createTheme();
function Iframe({ src, width, height }) {
    const iframeRef = useRef();


    useEffect(() => {
        const fetchHtml = async () => {
            try {
                const response = await fetch(src);
                const html = await response.text();
                iframeRef.current.contentWindow.document.open();
                iframeRef.current.contentWindow.document.write(html);
                iframeRef.current.contentWindow.document.close();
            } catch (error) {
                console.error('Error fetching HTML:', error);
            }
        };

        fetchHtml();
    }, [src]);

    return <iframe ref={iframeRef} title="Seat" width={width} height={height} />;
}

function App() {

    const [orders, setOrders] = useState();
    const [Food_array, setFood_array] = useState("");
    const [Food_arrays, setFood_arrays] = useState(JSON.parse(sessionStorage.getItem("Food_arrays")));
    /**listen to localtsorage */
    const { id, saveId } = useMyHook(null);
    useEffect(() => {
        setFood_arrays(JSON.parse(sessionStorage.getItem("Food_arrays")));
    }, [id]);
    const [selectedItem, setSelectedItem] = useState('Order');

    function handleItemClick(item) {
        setSelectedItem(item);
        saveId(Math.random())
        console.log(selectedItem)
    }
    /**change app namne and logo */
    // const [faviconUrl, setFaviconUrl] = useState('https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/LUwithShield-CMYK.svg/1200px-LUwithShield-CMYK.svg.png');
    const [pageTitle, setPageTitle] = useState("Title1");
    const handleOpenCashDraw = async () => {
        try {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
            const docRef = await addDoc(collection(db, "open_cashdraw"), {
                date: date
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    const handleAdminCheckout = async () => {
        if (sessionStorage.getItem("tableMode") == "table-NaN") {
            return
        }

        //console.log(sessionStorage.getItem(sessionStorage.getItem("tableMode")))
        const food_array = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode")));
        const matched_food_array = food_array.map(({ id, quantity }) => {
            const matched_food = JSON.parse(sessionStorage.getItem("Food_arrays")).find(foodItem => foodItem.id === id);
            return { ...matched_food, quantity };
        });

        console.log(matched_food_array);
        const total_ = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
            return accumulator + task.quantity * task.subtotal;
        }, 0).toFixed(2)
        try {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
            const docRef = await addDoc(collection(db, "success_payment"), {
                dateTime: date,
                receiptData: JSON.stringify(matched_food_array),
                //charges.data[0].billing_details.name = "DineIn"
                amount: total_ * 100,
                amount_received: total_ * 100,
                user_email: "Admin@gmail.com",
                charges: {
                    data: [
                        {
                            billing_details: { name: "DineIn" }
                        }
                    ]
                }
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    // const handleClickFavicon = (e) => {
    //     e.preventDefault();
    //     console.log(e.target.faviconURL.value);
    //     if (faviconUrl === 'https://upload.wikimedia.org/wikipedia/en/thumb/6/65/LehighMountainHawks.svg/1200px-LehighMountainHawks.svg.png')
    //         setFaviconUrl('https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/LUwithShield-CMYK.svg/1200px-LUwithShield-CMYK.svg.png');
    //     else
    //         setFaviconUrl('https://upload.wikimedia.org/wikipedia/en/thumb/6/65/LehighMountainHawks.svg/1200px-LehighMountainHawks.svg.png')
    //     updateFavicon();
    // }

    const handleClickTitle = (e) => {
        e.preventDefault();
        console.log(e.target.title.value);

        document.title = e.target.title.value;// update title

    }

    // const updateFavicon = () => {
    //     const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    //     link.type = 'image/x-icon';
    //     link.rel = 'shortcut icon';
    //     link.href = `${faviconUrl}?t=${Date.now()}`;
    //     document.getElementsByTagName('head')[0].appendChild(link);
    // }

    /**change app namne and logo */


    //for the add
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState("");
    const [price, setPrice] = useState("");
    const [subtotal, setSubtotal] = useState("");
    //for the add
    //for the update
    const [updateId, setUpdateId] = useState('');
    const [updateName, setUpdateName] = useState('');
    const [updateCategory, setUpdateCategory] = useState('');
    const [updateImage, setUpdateImage] = useState('');
    const [updatePrice, setUpdatePrice] = useState('');
    const [updateSubtotal, setUpdateSubtotal] = useState('');
    // for json update

    /* stringify data
    // [{"id":"price_1MJTkrFOhUhkkYOhL4UIti6Z","name":"Ceasar Salad","category":"salad","image":"https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8c2FsYWQlMjBjZWFzYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"2"},{"id":"price_1MJTlDFOhUhkkYOhbkBbKREK","name":"Bacon Cheeseburger","category":"burger","image":"https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGJ1cmdlcnN8ZW58MHx8MHx8&auto=format&fit=crop&w=1400&q=60","price":"$","subtotal":"3"},{"id":"price_1MJTlfFOhUhkkYOh0hVnh4ib","name":"Mushroom Burger","category":"burger","image":"https://images.unsplash.com/photo-1608767221051-2b9d18f35a2f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGJ1cmdlcnN8ZW58MHx8MHx8&auto=format&fit=crop&w=1400&q=60","price":"$$","subtotal":"4"},{"id":"price_1MJTlvFOhUhkkYOhK9M6CIhT","name":"Loaded Burger","category":"burger","image":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YnVyZ2Vyc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400&q=60","price":"$$$","subtotal":"5"},{"id":"price_1MJTmHFOhUhkkYOhqNKAtICv","name":"Wings","category":"chicken","image":"https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y2hpY2tlbiUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"6"},{"id":"price_1MJTmUFOhUhkkYOhLrfJCvPt","name":"Supreme Pizza","category":"pizza","image":"https://images.unsplash.com/photo-1604382355076-af4b0eb60143?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8cGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"7"},{"id":"price_1MJTmyFOhUhkkYOhwRXs0fFv","name":"Meat Lovers","category":"pizza","image":"https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fHBpenphfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"8"},{"id":"price_1MJTnGFOhUhkkYOhPh3eAAuk","name":"Chicken Tenders","category":"chicken","image":"https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaWNrZW4lMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"9"},{"id":"price_1MJTnVFOhUhkkYOhYfbsRz3J","name":"Kale Salad","category":"salad","image":"https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8c2FsYWQlMjBjZWFzYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"10"},{"id":"price_1MJTnkFOhUhkkYOhbBfiLpoG","name":"Double Cheeseburger","category":"burger","image":"https://images.unsplash.com/photo-1607013251379-e6eecfffe234?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnVyZ2Vyc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400&q=60","price":"$$$$","subtotal":"12"},{"id":"price_1MJTo0FOhUhkkYOhUWpPQMyj","name":"Chicken Kabob","category":"chicken","image":"https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fGNoaWNrZW4lMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"13"},{"id":"price_1MJToHFOhUhkkYOhrwh3DnFN","name":"Fruit Salad","category":"salad","image":"https://images.unsplash.com/photo-1564093497595-593b96d80180?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8ZnJ1aXQlMjBzYWxhZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"14"},{"id":"price_1MJToVFOhUhkkYOhtGfbubON","name":"Feta & Spinnach","category":"pizza","image":"https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8cGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"15"},{"id":"price_1MJTokFOhUhkkYOhdVrB44HD","name":"Baked Chicken","category":"chicken","image":"https://images.unsplash.com/photo-1594221708779-94832f4320d1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8Y2hpY2tlbiUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"16"},{"id":"price_1MJTp0FOhUhkkYOhWfwVHIuU","name":"Cheese Pizza","category":"pizza","image":"https://images.unsplash.com/photo-1548369937-47519962c11a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8Y2hlZXNlJTIwcGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"17"},{"id":"price_1MJTpGFOhUhkkYOhzMtHrVLT","name":"Loaded Salad","category":"salad","image":"https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsYWR8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"18"},{"id":"price_1MJTpGFOhUhkkYOhzMtHrVL2","name":"1/4lb Cheese Deluxe","category":"burger","image":"https://s7d1.scene7.com/is/image/mcdonalds/DC_202201_4282_QuarterPounderCheeseDeluxe_Shredded_832x472:product-header-desktop?wid=830&hei=458&dpr=off","price":"$$$$","subtotal":"19"}]
    */

    const [inputData, setInputData] = useState([]);
    const [searchData, setSearchData] = useState([]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setInputData(event.target.inputData.value);
        console.log(inputData)
        let temp = data_
        console.log(temp)//convert string to json.
        for (let i = 0; i < temp.length; i++) {
            console.log(temp[i])
            console.log(addJson_array(temp[i].name, temp[i].category, temp[i].image, temp[i].price, temp[i].subtotal))
        }
        await getDocs(collection(db, "food_data"))
            .then((querySnapshot) => {
                console.log("read card")
                const newData = querySnapshot.docs
                    .map((doc) => ({ ...doc.data(), id: doc.id }));
                console.log(JSON.stringify(newData))
                sessionStorage.setItem("Food_arrays", JSON.stringify(newData));
            })
        saveId(Math.random())
    }

    const addJson_array = async (name, category, image, price, subtotal) => {
        try {
            const docRef = await addDoc(collection(db, "food_data"), {
                name: name,
                category: category,
                image: image,
                price: "$",
                subtotal: subtotal,
            });
            console.log("Document written with ID: ", docRef.id);


        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    //for json update
    const handleUpdateForm = (id) => {
        setUpdateId(id);
        setUpdateName(Food_arrays.find(item => item.id === id).name);
        setUpdateCategory(Food_arrays.find(item => item.id === id).category);
        setUpdateImage(Food_arrays.find(item => item.id === id).image);
        setUpdatePrice(Food_arrays.find(item => item.id === id).price);
        setUpdateSubtotal(Food_arrays.find(item => item.id === id).subtotal);

    }
    //for the update
    const addFood_array = async (updatedFood_array) => {

        console.log(updatedFood_array)
        try {
            const docRef = await addDoc(collection(db, "food_data"), {
                name: updatedFood_array.name,
                category: updatedFood_array.category,
                image: updatedFood_array.image,
                price: updatedFood_array.price,
                subtotal: updatedFood_array.subtotal,
            });
            console.log("Document written with ID: ", docRef.id);
            await getDocs(collection(db, "food_data"))
                .then((querySnapshot) => {
                    const newData = querySnapshot.docs
                        .map((doc) => ({ ...doc.data(), id: doc.id }));
                    console.log(JSON.stringify(newData))
                    sessionStorage.setItem("Food_arrays", JSON.stringify(newData));
                })
            saveId(Math.random())
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const updateFood_array = async (id, updatedFood_array) => {
        //(id, updatedFood_array).preventDefault();

        try {
            await updateDoc(doc(db, "food_data", id), updatedFood_array);
            console.log("Document updated with ID: ", id);
            await getDocs(collection(db, "food_data"))
                .then((querySnapshot) => {
                    const newData = querySnapshot.docs
                        .map((doc) => ({ ...doc.data(), id: doc.id }));
                    console.log(JSON.stringify(newData))
                    sessionStorage.setItem("Food_arrays", JSON.stringify(newData));
                })
            saveId(Math.random())
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    const deleteFood_array = async (id) => {
        console.log(id)
        try {
            await deleteDoc(doc(db, "food_data", id));
            console.log("Document deleted with ID: ", id);
            await getDocs(collection(db, "food_data"))
                .then((querySnapshot) => {
                    const newData = querySnapshot.docs
                        .map((doc) => ({ ...doc.data(), id: doc.id }));
                    console.log(JSON.stringify(newData))
                    sessionStorage.setItem("Food_arrays", JSON.stringify(newData));
                })
            saveId(Math.random())
        } catch (e) {
            console.error("Error deleting document: ", e);
        }
    }
    //Food_arrays = 
    // margin: auto;
    // max-width: 1240px;
    // display: grid;
    // justify-self: center;
    // justify-content: center;
    // align-items: stretch;

    // for translate
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const t = (text) => {
        // const trans = sessionStorage.getItem("translations")
        //console.log(trans)
        //console.log(sessionStorage.getItem("translationsMode"))

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


    const [revenueData, setRevenueData] = useState([
        { date: '3/14/2023', revenue: 30 }
    ]);




    const moment = require('moment');

    const fetchPost = async () => {
        console.log("fetchPost2");
        await getDocs(collection(db, "success_payment")).then((querySnapshot) => {
            const newData = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            newData.sort((a, b) =>
                moment(b.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf() -
                moment(a.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf()
            );

            const newItems = []; // Declare an empty array to hold the new items

            newData.forEach((item) => {
                const formattedDate = moment(item.dateTime, "YYYY-MM-DD-HH-mm-ss-SS")
                    .subtract(7, "hours")
                    .format("M/D/YYYY h:mma");
                const newItem = {
                    id: item.id.substring(0, 4), // use only the first 4 characters of item.id as the value for the id property
                    receiptData: item.receiptData,
                    date: formattedDate,
                    email: item.user_email,
                    dineMode: item.isDinein,
                    status: "pending",
                    total: parseInt(item.amount_received) / 100,
                    name: item.charges.data[0].billing_details.name,
                };
                newItems.push(newItem); // Push the new item into the array
            });
            setOrders(newItems)
            console.log(newItems); // Log the array to the console or do whatever you want with it


            // Create an object to store daily revenue totals
            const dailyRevenue = {};

            // Loop through each receipt and sum up the total revenue for each date
            newItems.forEach(receipt => {
                // Extract the date from the receipt
                const date = receipt.date.split(' ')[0];
                //console.log(receipt)
                // Extract the revenue from the receipt (for example, by parsing the receiptData string)
                const revenue = receipt.total; // replace with actual revenue calculation
                // Add the revenue to the dailyRevenue object for the appropriate date
                if (dailyRevenue[date]) {
                    dailyRevenue[date] += revenue;
                } else {
                    dailyRevenue[date] = revenue;
                }
            });
            console.log("hello")
            // Convert the dailyRevenue object into an array of objects with date and revenue properties
            const dailyRevenueArray = Object.keys(dailyRevenue).map(date => {
                return {
                    date: date,
                    revenue: dailyRevenue[date]
                };
            });

            // Example output: [{date: '3/14/2023', revenue: 10}, {date: '3/13/2023', revenue: 10}, {date: '3/4/2023', revenue: 10}]
            console.log(dailyRevenueArray);
            console.log(revenueData);
            setRevenueData(dailyRevenueArray)

        });
    };





    useEffect(() => {
        fetchPost();
    }, [])



    const [expandedOrderIds, setExpandedOrderIds] = useState([]);

    const toggleExpandedOrderId = (orderId) => {
        if (expandedOrderIds.includes(orderId)) {
            setExpandedOrderIds(expandedOrderIds.filter(id => id !== orderId));
        } else {
            setExpandedOrderIds([...expandedOrderIds, orderId]);
        }
    };
    //REVENUE CHART 31 DAYS FROM NOW
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000); // 7 days ago

    const filteredData = revenueData.filter((dataPoint) => {
        const dataPointDate = new Date(dataPoint.date);
        return dataPointDate >= oneWeekAgo && dataPointDate <= today;
    });
    const sortedData = filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));



    if (!sessionStorage.getItem("tableMode")) {
        sessionStorage.setItem("tableMode", "table-NaN");
    }
    if (!sessionStorage.getItem("table-NaN")) {
        sessionStorage.setItem("table-NaN", "[]");
    }
    if (!sessionStorage.getItem(sessionStorage.getItem("tableMode"))) {
        sessionStorage.setItem("table-NaN", "[]");
        sessionStorage.setItem("tableMode", "table-NaN");
    }

    const [src, setSrc] = useState(window.PUBLIC_URL + "/seat.html");
    const [initialSrc, setInitialSrc] = useState(window.PUBLIC_URL + "/seat.html");
    const [isLoading, setIsLoading] = useState(false); // added state variable
    const iframeRef = useRef(null);

    const messageHandler = useCallback((event) => {
        if (event.data === 'buttonClicked') {
            console.log('Button clicked2!');
        }
    }, []);

    useEffect(() => {
        window.addEventListener('message', messageHandler);

        // Remove the event listener when the component is unmounted
        return () => {
            window.removeEventListener('message', messageHandler);
        };
    }, [messageHandler]);

    useEffect(() => {
        if (iframeRef.current) {
            setInitialSrc(iframeRef.current.src);
        }
    }, []);

    useEffect(() => {
        if (iframeRef.current) {
            setIsLoading(true); // set isLoading to true when the iframe starts loading
            iframeRef.current.src = src;
        }
    }, [src, selectedItem]);

    //listen to table
    useEffect(() => {
        const handleIframeMessage = event => {
            const selectedNumber = event.data;
            listenNumber(selectedNumber);
        };
        window.addEventListener("message", handleIframeMessage);
        return () => {
            window.removeEventListener("message", handleIframeMessage);
        };
    }, []);
    //JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode")))
    function listenNumber(number) {
        var tableName = "table-" + parseInt(number);
        if (tableName == "table-NaN") {
            return
        }

        console.log(tableName)
        if (!sessionStorage.getItem(tableName)) {
            // Create the table if it does not exist
            console.log("creating table ", number);
            sessionStorage.setItem(tableName, "[]");
        } else {
            // Switch to the existing table
            var tableMode = sessionStorage.getItem("tableMode");
            if (tableMode == null) {
                // If tableMode does not exist, create it and set the selected table number
                sessionStorage.setItem("tableMode", tableName);
            } else {
                // If tableMode exists, update it with the selected table number
                sessionStorage.setItem("tableMode", tableName);
            }
        }
        sessionStorage.setItem("tableMode", tableName);
        saveId(Math.random());
    }

    /**admin shopping cart */

    //const [shopItem, setShopItem] = useState(JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []);
    const [tableItem, setTableItem] = useState([]);

    //JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode")))

    const shopAdd = (id) => {
        if (sessionStorage.getItem("tableMode") == "table-NaN") {
            return
        }
        const foodItem = Food_arrays.find(item => item.id === id);
        const dictArray = {
            id: id,
            name: foodItem.name,
            category: foodItem.category,
            image: foodItem.image,
            price: foodItem.price,
            subtotal: foodItem.subtotal,
            quantity: 1
        };
        console.log(dictArray);
        // Check if shopItem exists in sessionStorage

        // Retrieve the shopItem array from sessionStorage

        const shopItem = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []

        // Check if the id already exists in the shopItem array
        const idExists = shopItem.some(item => item.id === dictArray.id);

        if (!idExists) {
            // If the id does not exist, add the dictArray object to the shopItem array
            shopItem.push(dictArray);
            // Save the updated shopItem array back to sessionStorage
            sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(shopItem))
            //sessionStorage.setItem('shopItem', JSON.stringify(shopItem));
            //setShopItem(shopItem)
        } else {
            clickedAdd(id)
        }

        saveId(Math.random());
        //searchItemFromShopItem("cheese")
        //search
    }
    const clickedAdd = (id) => {
        if (sessionStorage.getItem("tableMode") == "table-NaN") {
            return
        }
        const cartItems = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []
        // Find the item in the cartItems array with the matching id
        const item = cartItems.find(item => item.id === id);

        // If the item is found, increase its quantity by 1
        if (item) {
            item.quantity += 1;
        }
        console.log(cartItems)
        sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(cartItems));
        // Return the updated cartItems array
        //sessionStorage.setItem('shopItem', JSON.stringify(cartItems));
    }
    const clickedMinus = (id) => {
        if (sessionStorage.getItem("tableMode") == "table-NaN") {
            return
        }
        const cartItems = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []
        // Find the item in the cartItems array with the matching id
        const item = cartItems.find(item => item.id === id);

        // If the item is found and its quantity is greater than 1, decrease its quantity by 1
        if (item && item.quantity > 1) {
            item.quantity -= 1;
        }
        console.log(cartItems)
        sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(cartItems));
        // Return the updated cartItems array
        //sessionStorage.setItem('shopItem', JSON.stringify(cartItems));
    }
    const deleteItem = (id) => {
        const cartItems = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []
        // Find the index of the item in the cartItems array with the matching id
        const index = cartItems.findIndex(item => item.id === id);

        // If the item is found, remove it from the cartItems array using the splice() method
        if (index !== -1) {
            cartItems.splice(index, 1);
        }

        console.log(cartItems)
        sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(cartItems));
    }
    const [cheeseItems_, setCheeseItems_] = useState(JSON.parse(sessionStorage.getItem('Food_arrays')) || []);
    const searchItemFromShopItem = (input) => {
        const shopItem_ = JSON.parse(sessionStorage.getItem('Food_arrays')) || [];

        // Filter the items that have "cheese" in their name
        const cheeseItems = shopItem_.filter(item => item.name.toLowerCase().includes(input));

        // Return the cheeseItems array
        console.log(cheeseItems)
        setCheeseItems_(cheeseItems)
        saveId(Math.random());
    }

    let search_food = !searchData ? Food_arrays : cheeseItems_;

    return (
        <div style={{ maxWidth: '1240px', display: 'grid', justifySelf: 'center', justifyContent: 'center', margin: 'auto', alignContent: 'center' }}>
            <section className="container2">
                <nav>
                    <section className="navigation">


                        <ul className="main-nav" style={{ "padding": 0 }}>
                            <li className="main-nav__item">
                                <a className="main-nav__link" style={{ background: "#e1ecf4", display: "inline-block" }} onClick={handleOpenCashDraw}>
                                    <img src={icons8Drawer} alt="Icons8 Drawer" style={{ display: "inline-block" }} />
                                    {t("OPEN DRAWER")}
                                </a>
                            </li>
                            <li className="main-nav__item">
                                <a className="main-nav__link" onClick={() => handleItemClick('Item')}>
                                    Item
                                </a>
                            </li>
                            <li className="main-nav__item">
                                <a className="main-nav__link" onClick={() => handleItemClick('Revenue')}>
                                    Revenue
                                </a>
                            </li>
                            <li className="main-nav__item">
                                <a className="main-nav__link" onClick={() => handleItemClick('Order')}>
                                    Order
                                </a>
                            </li>
                            <li className="main-nav__item">
                                <a className="main-nav__link" onClick={() => { handleItemClick('History'); fetchPost(); }}>
                                    History
                                </a>

                            </li>
                            <li className="main-nav__item">
                                <a className="main-nav__link" onClick={() => handleItemClick('Settings')}>
                                    Settings
                                </a>
                            </li>
                        </ul>
                    </section>
                </nav>
                <main>
                    {selectedItem === 'Item' ? <div>

                        <header className="main-header">

                            <div className="search-wrap">
                                <form style={{ display: 'flex', justifyContent: 'center', margin: '10px' }} onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-2" style={{ width: '100%' }}>
                                        <input
                                            type="text"
                                            name="inputData"
                                            placeholder={t("Input Json Data")}
                                            className="search-bar"
                                            style={{ marginLeft: "5%", height: '50px', width: "150%" }}
                                            onChange={(e) => setInputData(e.target.value)}
                                            value={inputData}
                                            translate="no"
                                        />
                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            sx={{ mt: 3, mb: 2 }}
                                            style={{ margin: "0", marginLeft: "60%", height: '50px', width: "30%", float: 'right' }}
                                        >
                                            {t("Submit")}
                                        </Button>
                                    </div>
                                </form>

                            </div>

                        </header>

                        <ThemeProvider theme={theme} >

                            <Container component="main" maxWidth="xs">

                                <CssBaseline />
                                <Box
                                    sx={{
                                        marginTop: 0,

                                        marginLeft: 2,

                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box component="form" noValidate sx={{ mt: 1 }}>

                                        <Grid container spacing={0}>

                                            <div style={{ width: "100%" }}>

                                                <div class="grid grid-cols-2">
                                                    <div class="col-span-1">
                                                        <div style={{ width: "200px", height: "200px", padding: "5px", borderRadius: '0.625rem' }} class="image-container">
                                                            <img src={updateImage} alt="" />
                                                        </div>
                                                    </div>
                                                    <div class="col-span-1 text-right">
                                                        <div className="folder-card"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                addFood_array({ name: updateName, category: updateCategory, image: updateImage, price: updatePrice, subtotal: updateSubtotal })
                                                            }}
                                                            style={{ float: 'right', width: '200px', height: '200px', padding: '20px', display: 'flex', flexDirection: 'column', marginRight: "0", justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                            <div className="folder-card__icon" style={{ marginBottom: '10px' }}></div>
                                                            <span className="folder-card__title">Add New Food</span>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                id="Name"
                                                label={t("Name")}
                                                name="Name"
                                                autoComplete="Name"
                                                autoFocus
                                                value={updateName}
                                                onChange={(e) => {
                                                    setName(e.target.value);
                                                    setUpdateName(e.target.value);
                                                }}
                                            />
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                id="Category"
                                                label={t("Category")}
                                                name="Category"
                                                autoComplete="Category"
                                                autoFocus
                                                value={updateCategory}
                                                onChange={(e) => {
                                                    setUpdateCategory(e.target.value);
                                                    setCategory(e.target.value);
                                                }}
                                            />

                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                id="Image"
                                                label={t("Image")}
                                                name="Image"
                                                autoComplete="Image"
                                                autoFocus
                                                value={updateImage}
                                                onChange={(e) => {
                                                    setUpdateImage(e.target.value);
                                                    setImage(e.target.value);
                                                }}
                                            />
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                id="Price"
                                                label={t("Price")}
                                                name="Price"
                                                autoComplete="Price"
                                                autoFocus
                                                value={updatePrice}
                                                onChange={(e) => {
                                                    setUpdatePrice(e.target.value);
                                                    setPrice(e.target.value);
                                                }}
                                            />
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                id="Subtotal"
                                                label={t("Subtotal")}
                                                name="Subtotal"
                                                autoComplete="Subtotal"
                                                autoFocus
                                                value={updateSubtotal}
                                                onChange={(e) => {
                                                    setUpdateSubtotal(e.target.value);
                                                    setSubtotal(e.target.value);
                                                }}
                                            />

                                        </Grid>
                                        <Grid container>

                                            <Button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    updateFood_array(updateId, { name: updateName, category: updateCategory, image: updateImage, price: updatePrice, subtotal: updateSubtotal })
                                                }}
                                                fullWidth
                                                variant="contained"
                                                sx={{ mt: 3, mb: 2 }}
                                            >
                                                {t("Update")}
                                            </Button>

                                        </Grid>
                                        <Grid container>
                                            <Grid item xs>
                                            </Grid>
                                            <Grid item>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </Container>

                        </ThemeProvider>

                        <section className="task-list" style={{ marginTop: "-100px" }}>
                            <h2>Food Items</h2>
                            <div className="task-wrap" style={{ minHeight: '750px', maxHeight: '750px', overflowY: 'scroll' }}>
                                {Food_arrays.sort((a, b) => (a.name > b.name) ? 1 : -1).map((task) => (


                                    <div className={`task-card ${task.checked ? "task-card--done" : ""}`}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <div style={{ width: "50px", height: "50px", padding: "5px" }} class="image-container">
                                                <img src={task.image} alt="" />
                                            </div>
                                            <div style={{ marginLeft: "10px" }}>{task.name}</div>
                                        </div>
                                        <span style={{ cursor: 'pointer' }}
                                            onClick={() => handleUpdateForm(task.id)}
                                            className="task-card__tag task-card__tag--marketing">{t("Edit")}</span>
                                        <span className="task-card__option">
                                            <span style={{ cursor: 'pointer' }}
                                                onClick={() => deleteFood_array(task.id)}
                                                className="task-card__tag task-card__tag--design">{t("Delete")}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div> :



                        selectedItem === 'Revenue' ? <div>
                            <b x="20" y="30" fill="#000" style={{ 'fontSize': '17px' }}>
                                Revenue earned on a daily basis over a period of 31 days
                            </b>
                            <br></br>
                            <BarChart width={600} height={300} data={sortedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#8884d8" />
                            </BarChart>
                        </div> :






                            selectedItem === 'Order' ?

                                <div>
                                    <header className="main-header" style={{ height: "100px" }}>

                                        <div className="search-wrap">
                                        </div>
                                    </header>
                                    <div style={{ marginTop: "-100px" }}>
                                        <Iframe src={`${process.env.PUBLIC_URL}/seat.html`} width="540px" height="800px" />
                                    </div>

                                    <section className="task-list" style={{ marginTop: "-100px" }}>
                                        <div className="task-wrap" style={{ minHeight: '350px', maxHeight: '350px', overflowY: 'scroll' }}>
                                            <div className={`task-card ${"task.checked" ? "task-card--done" : ""}`}>
                                                <div style={{ display: "flex", alignItems: "center" }}>



                                                    <div>


                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "5px" }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '10px' }}>
                                                                {sessionStorage.getItem("tableMode") === "table-NaN" ? (
                                                                    <div>Did not select table</div>
                                                                ) : (
                                                                    <div>{sessionStorage.getItem("tableMode")}</div>
                                                                )}
                                                            </span>
                                                            <Button variant="contained" onClick={handleAdminCheckout}>
                                                                {t("Checkout")} $ {(JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
                                                                    return accumulator + task.quantity * task.subtotal;
                                                                }, 0) * 1.086).toFixed(2)}
                                                            </Button>
                                                        </div>
                                                        <hr />

                                                        {sessionStorage.getItem(sessionStorage.getItem("tableMode")) == "[]" ? <div>Void</div> : <div></div>}

                                                        {JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).map((task) => (
                                                            <div
                                                                key={task.id}
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    width: '100%',
                                                                }}
                                                            >
                                                                <div style={{ width: "175px" }}>
                                                                    <div style={{ marginLeft: '10px' }}>{task.name}</div>
                                                                    <div style={{ marginLeft: '10px' }}>
                                                                        <span>${task.subtotal} x {task.quantity} = ${task.quantity * task.subtotal}</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="quantity" style={{ marginRight: '0px', display: 'flex', whiteSpace: 'nowrap', width: '80px', paddingTop: '5px', height: 'fit-content' }}>
                                                                        <div style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: 'flex', borderLeft: '1px solid', borderTop: '1px solid', borderBottom: '1px solid', borderRadius: '12rem 0 0 12rem', height: '30px' }}>
                                                                            <button className="plus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: 'flex' }} onClick={() => {
                                                                                if (task.quantity === 1) {
                                                                                    deleteItem(task.id);
                                                                                    saveId(Math.random());
                                                                                } else {
                                                                                    clickedMinus(task.id);
                                                                                    saveId(Math.random());
                                                                                }
                                                                            }}>
                                                                                <img style={{ margin: '0px', width: '10px', height: '10px' }} src={minusSvg} alt="" />
                                                                            </button>
                                                                        </div>
                                                                        <span type="text" style={{ width: '30px', height: '30px', fontSize: '17px', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid', borderBottom: '1px solid', display: 'flex', padding: '0px' }}>{task.quantity}</span>
                                                                        <div style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: 'flex', borderRight: '1px solid', borderTop: '1px solid', borderBottom: '1px solid', borderRadius: '0 12rem 12rem 0', height: '30px' }}>
                                                                            <button className="minus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: 'flex' }} onClick={() => {
                                                                                clickedAdd(task.id)
                                                                                saveId(Math.random());
                                                                            }}>
                                                                                <img style={{ margin: '0px', width: '10px', height: '10px' }} src={plusSvg} alt="" />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                </div>



                                                            </div>
                                                        ))}
                                                        <div>
                                                            <hr />
                                                            <div>Subtotal: $ {JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
                                                                return accumulator + task.quantity * task.subtotal;
                                                            }, 0).toFixed(2)}</div>

                                                            <div>Tax: $ {(JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
                                                                return accumulator + task.quantity * task.subtotal;
                                                            }, 0) * 0.086).toFixed(2)}</div>

                                                            <div>Total: $ {(JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
                                                                return accumulator + task.quantity * task.subtotal;
                                                            }, 0) * 1.086).toFixed(2)}</div>

                                                        </div>
                                                    </div>


                                                </div>



                                            </div>
                                        </div>
                                    </section>
                                    <section className="task-list" style={{ marginTop: "275px" }}>

                                        <input
                                            type="text"
                                            name="inputData"
                                            placeholder={t("Search food items")}
                                            className="search-bar"
                                            style={{ marginLeft: "5px", height: '30px', width: "80%", marginBottom: "5px" }}
                                            onChange={(e) => {
                                                searchItemFromShopItem(e.target.value);
                                                setSearchData(e.target.value);
                                            }}
                                            value={searchData}
                                            translate="no"
                                        />

                                        <div className="task-wrap" style={{ minHeight: '400px', maxHeight: '400px', overflowY: 'scroll' }}>
                                            {search_food.sort((a, b) => (a.name > b.name) ? 1 : -1).map((task) => (
                                                <div className={`task-card ${task.checked ? "task-card--done" : ""}`}>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <div style={{ width: "50px", height: "50px", padding: "5px" }} class="image-container">
                                                            <img src={task.image} alt="" />
                                                        </div>
                                                        <div style={{ marginLeft: "10px" }}>{task.name}</div>
                                                        <span
                                                            style={{ cursor: 'pointer', marginLeft: 'auto' }}
                                                            onClick={() => {
                                                                shopAdd(task.id);
                                                                saveId(Math.random());
                                                            }}
                                                            className="task-card__tag task-card__tag--marketing"
                                                        >
                                                            {t("Add")}
                                                        </span>

                                                    </div>



                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                </div>



                                :







                                selectedItem === 'History' ? <div>

                                    <table
                                        className="shop_table my_account_orders"
                                        style={{
                                            borderCollapse: "collapse",
                                            width: "100%",
                                            borderSpacing: "6px", // added CSS
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th
                                                    className="order-number"
                                                    style={{ marginRight: "10px", width: "10%" }}
                                                >
                                                    OrderID
                                                </th>
                                                <th className="order-name" style={{ width: "20%" }}>
                                                    Name
                                                </th>
                                                <th className="order-email" style={{ width: "20%" }}>
                                                    Email
                                                </th>
                                                <th className="order-date" style={{ width: "15%" }}>
                                                    Date
                                                </th>
                                                <th className="order-status" style={{ width: "10%" }}>
                                                    Status
                                                </th>
                                                <th className="order-total" style={{ width: "10%" }}>
                                                    Total
                                                </th>
                                                <th className="order-dine-mode" style={{ width: "10%" }}>
                                                    DineMode
                                                </th>
                                                <th className="order-details" style={{ width: "5%" }}>
                                                    Details
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <React.Fragment key={order.id}>
                                                    <tr
                                                        className="order"
                                                        style={{ borderBottom: "1px solid #ddd" }}
                                                    >
                                                        <td className="order-number" data-title="OrderID">
                                                            <a href="*">{order.id}</a>
                                                        </td>
                                                        <td
                                                            className="order-name"
                                                            data-title="Name"
                                                            style={{ whiteSpace: "nowrap" }}
                                                        >
                                                            {order.name}
                                                        </td>
                                                        <td
                                                            className="order-email"
                                                            data-title="Email"
                                                            style={{ whiteSpace: "nowrap" }}
                                                        >
                                                            {order.email}
                                                        </td>
                                                        <td
                                                            className="order-date"
                                                            data-title="Date"
                                                            style={{ whiteSpace: "nowrap" }}
                                                        >
                                                            <time dateTime={order.date} title={order.date} nowrap>
                                                                {order.date}
                                                            </time>
                                                        </td>
                                                        <td
                                                            className="order-status"
                                                            data-title="Status"
                                                            style={{ whiteSpace: "nowrap" }}
                                                        >
                                                            {order.status}
                                                        </td>
                                                        <td
                                                            className="order-total"
                                                            data-title="Total"
                                                            style={{ whiteSpace: "nowrap" }}
                                                        >
                                                            <span className="amount">{"$" + order.total}</span>
                                                        </td>
                                                        <td
                                                            className="order-dine-mode"
                                                            data-title="DineMode"
                                                            style={{ whiteSpace: "nowrap" }}
                                                        >
                                                            {order.dineMode}
                                                        </td>
                                                        <td
                                                            className="order-details"
                                                            style={{ whiteSpace: "nowrap" }}
                                                            data-title="Details"
                                                        >
                                                            <button
                                                                onClick={() => toggleExpandedOrderId(order.id)}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                {expandedOrderIds.includes(order.id)
                                                                    ? "Hide Details"
                                                                    : "View Details"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedOrderIds.includes(order.id) && (
                                                        <tr>
                                                            <td colSpan={8} style={{ padding: "10px" }}>

                                                                <div className="receipt">
                                                                    {JSON.parse(order.receiptData).map((item, index) => (
                                                                        <div className="receipt-item" key={item.id}>
                                                                            <p>{item.name} x {item.quantity} = ${item.subtotal}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>



                                </div> :









                                    selectedItem === 'Settings' ?



                                        <div>


                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <form style={{ display: "flex", alignItems: "center" }}>
                                                    <TextField
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="faviconURL"
                                                        label={t("Enter Favicon URL")}
                                                        name="faviconURL"
                                                        autoComplete="faviconURL"
                                                        autoFocus
                                                        style={{ width: "60%" }}
                                                    />
                                                    <Button
                                                        fullWidth
                                                        type="submit"
                                                        variant="contained"
                                                        sx={{ mt: 3, mb: 2 }}
                                                        style={{ width: "30%", marginLeft: "10px", height: "56px" }}
                                                    >
                                                        {t("Change Favicon")}
                                                    </Button>
                                                </form>
                                                <form onSubmit={handleClickTitle} style={{ display: "flex", alignItems: "center" }}>
                                                    <TextField
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="title"
                                                        label={t("Enter Title")}
                                                        name="title"
                                                        autoComplete="title"
                                                        autoFocus
                                                        style={{ width: "60%" }}
                                                    />
                                                    <Button
                                                        fullWidth
                                                        type="submit"
                                                        variant="contained"
                                                        sx={{ mt: 3, mb: 2 }}
                                                        style={{ width: "30%", marginLeft: "10px", height: "56px" }}
                                                    >
                                                        {t("Change Title")}
                                                    </Button>
                                                </form>
                                            </div>


                                        </div> :




                                        null}

                </main>
            </section>
            <footer style={{ 'height': "100px", 'color': 'transparent', 'userSelect': 'none' }}>
                void
            </footer>
        </div>

    );
}
export default App;
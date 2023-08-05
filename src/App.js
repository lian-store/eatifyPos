import Dashboard from "./components/dashboard";
import { useUserContext } from "./context/userContext";
import SignUp from './pages/new_signup';
import LogIn from './pages/new_login';
import Navbar from './pages/Navbar'
import Account from './pages/Account';
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import Reservation from './pages/reservation'
import Checkout from './pages/Checkout'
import Admin_new from './components/Admin_new'
import Account_admin from './components/Account_admin'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import './loading.css';
import React, { useState,useEffect } from 'react'
import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase/index';
import { MyHookProvider, useMyHook } from './pages/myHook';
import Receipt from './pages/Receipt'
import Html2 from './components/Html2'
import Html from './components/Html'
import { Navigate } from 'react-router-dom';

// translation purposes -> can switch to using fetchPost() to grab translation file just like food_array
import { translations } from './data/translations.js'

function App() {
  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams(window.location.search);
  const tableValue = params.get('table')?params.get('table').toUpperCase():"";
  
  const { user, user_loading} = useUserContext();
  console.log(user_loading)
  if(tableValue===""){
    if(sessionStorage.getItem('table')){//存在过
      sessionStorage.setItem('isDinein',true)
    }else{//不存在
      sessionStorage.setItem('table',tableValue)
      sessionStorage.setItem('isDinein',false)

    }
  }else{
    sessionStorage.setItem('table',tableValue)
    sessionStorage.setItem('isDinein',true)
  }
  console.log(tableValue)


  const fetchPost = async () => {
    
      console.log("fetchPost1")
      await getDocs(collection(db, "food_data"))
          .then((querySnapshot) => {
              const newData = querySnapshot.docs
                  .map((doc) => ({ ...doc.data(), id: doc.id }));
              //console.log(JSON.stringify(newData))
              sessionStorage.setItem("Food_arrays", JSON.stringify(newData));
          })
      await getDocs(collection(db, "TitleLogoNameContent"))
          .then((querySnapshot) => {
              const newData = querySnapshot.docs
                  .map((doc) => ({ ...doc.data(), id: doc.id }));
              sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
              //console.log(newData)
              //document.title = newData.Title
              window.location.href = './';
          })
  }


 useEffect(() => {
  // Added line to grab translation file (can use the same method as food_data to grab translations file)
  sessionStorage.setItem("translations", JSON.stringify(translations))

  if (!sessionStorage.getItem("Food_arrays") || !sessionStorage.getItem("TitleLogoNameContent")) {
    fetchPost();
  }else{
    setLoading(false); 
  }
}, []);
useEffect(() => {
    
  document.title = JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))[0].Name
}, []);
  if (loading &&user_loading) {
    return <p>  <div className="pan-loader">
      Loading...
  </div></p>;
} else {

  return (
    
    <div className="App">
      
      <BrowserRouter>
      <MyHookProvider>

      <Navbar/>
      <Routes>
        
      <Route path="QRcode" element={ 
        user!=null &&
        user.uid === process.env.REACT_APP_ADMIN_UID ? 
        <Html /> : 
        <LogIn />} />

      <Route path="Admin" element={
        user!=null && 
        user.uid === process.env.REACT_APP_ADMIN_UID ? 
        <Admin_new /> : 
        <LogIn />} />



      <Route path='*' exact={true} element={<Home />} />
      <Route exact path="/" element={<Home />} />
      <Route path="Receipt" element={<Receipt />} />
      <Route path="guest/:id" element={<Html2 />} />
      <Route path="Reservation" element={<Reservation />} />
      { user ?  <Route path="Checkout" element={<Checkout />}></Route> : <Route path="Checkout" element={<LogIn />}></Route> }
      <Route path="Dashboard" element={<Dashboard />} />
      { user ?  <Route path="Account" element=
      {
        user!=null && 
        user.uid === process.env.REACT_APP_ADMIN_UID? 
        <Account_admin /> : 
        <Account />}
      ></Route> : <Route path="Account" element={<LogIn />}></Route> }
      <Route path="SignUp" element={<SignUp />}></Route>
      
      { user ? 
      <Route path="LogIn" element={
        user.uid === process.env.REACT_APP_ADMIN_UID ? 
        <Account_admin /> : 
        <Account />}></Route>: 
      <Route path="LogIn" element={<LogIn />}></Route>
      }
      
      {user ? <Route path="ForgotPassword" element={<Account />}></Route>: <Route path="ForgotPassword" element={<ForgotPassword />}></Route>}

      </Routes>
      <footer style={{'height':"100px",'color':'transparent', 'userSelect': 'none'}}>
  void
</footer>

      </MyHookProvider>
    </BrowserRouter>
    </div>
    
  );
}
}

export default App;

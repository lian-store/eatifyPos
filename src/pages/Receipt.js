
import React from 'react'
import { useState, useMemo } from 'react';
import './checkout.css';
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import { useEffect } from 'react';
//import './html.css';
import { useMyHook } from './myHook';
import './SwitchToggle.css';
import moment from 'moment';
import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";

const App = () => {

  return (

    <div className='max-w-[500px] mx-auto p-4 '>
      <div className="app-container" style={{ height: "100%" }}>
        <div className="row">
          <div className="col">
            <Item />
          </div>
        </div>
      </div>
    </div>
  );
};

const Item = () => {
  const [payment_data, setPaymentData] = useState(null);
  const [products, setProducts] = useState([]);
  //const receiptToken = window.location.href.split('?')[1];
  const urlParams = new URLSearchParams(window.location.search);
  const receiptToken = urlParams.get('order');  // '12345'
  const { user, user_loading} = useUserContext();

  useEffect(() => {
    if (receiptToken && receiptToken.length === 20) {
      const unsubscribe = firebase
        .firestore()
        .collection("stripe_customers")
        .doc(user.uid)
        .collection("payments")
        .doc(receiptToken)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const payment = doc.data();
            
            const paymentData = {
              receipt_data: payment.receiptData,
              document_id: doc.id,
              time: payment.dateTime,
              email: payment.user_email,
              status: payment.status === "succeeded" ? "Paid Online" : "Handle Instore",
              isDinein: payment.metadata.isDine === "TakeOut"?"TakeOut":"Table: "+payment.tableNum,
              tax: payment.metadata.tax,
              tips: payment.metadata.tips,
              subtotal: payment.metadata.subtotal,
              total: payment.metadata.total,
              phoneNumber:payment.phoneNumber ? payment.phoneNumber : '',
              store:payment.store,
              tableNum:payment.tableNum
            };
            console.log("Document data:", paymentData);
            setPaymentData(paymentData);
            setProducts(JSON.parse(paymentData.receipt_data));
          } else {
            console.log("No such document!");
          }
        }, (error) => {
          console.log("Error getting document:", error);
        });
  
      return () => unsubscribe(); // Clean up the listener when the component is unmounted
    } else {
      console.log("null");
    }
  }, [receiptToken]); // useEffect will run when receiptToken changes

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

  if (!payment_data) return <div>Loading...</div>; // Render a loading state if payment_data is not fetched

  return (
    <div className="card2 mb-50" >
      <div className="col d-flex">
        {/** 
        <span className="text-muted" id="orderno">
          order #546924
        </span>*/}
      </div>
      <div className="gap">
        <div className="col-2 d-flex mx-auto" />
        <a href={`./store?store=${payment_data.store}`} style={{ color: "blue" }}>
    &lt; Back to store
</a>
<div className='mt-1 mb-2' >
    <b className="text-black text-2xl">{payment_data.store}</b>
</div>
<b className="block text-black text-sm">{payment_data.isDinein} ({payment_data.status})</b>

        <b className="block text-black text-sm">{t("Order ID")}: {payment_data.document_id.substring(0, 3)}</b>

        {payment_data.status === "Handle Instore" && (
  <>
        <span className="block text-black text-sm">{t("Phone#")}: {payment_data.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}</span>
  </>
)}
        <span className="block text-black text-sm">{  moment(payment_data.time, "YYYY-MM-DD-HH-mm-ss-SS").utcOffset(-8).format("MMMM D, YYYY h:mm a")}</span>


      </div>
      <div className="main">
        <span id="sub-title">
          <br>
          </br>
        </span>
        {products.map((product, index) => {
          return (
            <div className="row row-main" key={index}>
              <div className="col-9">
                <div className="row d-flex">
                    <b>{index+1}.{t(product.name)}</b>
                </div>
                <div className="row d-flex">
                  <p className="text-muted  mb-0 pb-0">@ ${product.subtotal} {t("each")} x {product.quantity}</p>
                </div>
              </div>
              <div className="col-3 d-flex justify-content-end">
                <p>
                  <b>${Math.round(100 * product.subtotal * product.quantity)/100}</b>
                </p>
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
            <div className="col d-flex justify-content-end">
              <b>${payment_data.subtotal}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Tax")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${payment_data.tax}</b>
            </div>
          </div>
          <div className="row">
          {payment_data.status === "Paid Online" && (
  <>
    <div className="col">
      <b> {t("Tips")}:</b>
    </div>
    <div className="col d-flex justify-content-end">
      <b>${payment_data.tips}</b>
    </div>
  </>
)}


            
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Total")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${payment_data.total}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};


export default App
import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useState } from 'react';
import { useEffect } from 'react';
import { useMyHook } from './myHook';
import { useMemo } from 'react';

const Hero = () => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);
  // Function to check if the directory is 'checkout' or 'selfCheckout'
  const checkDirectoryselfCheckout = () => {
    const path = window.location.pathname; // Get the current URL path
    if (path.includes('/selfCheckout')) {
      return true
    } else {
      return false
    }
  };

  // Example usage of the checkDirectory function
  const directoryType = checkDirectoryselfCheckout();

  let initialDineInState = sessionStorage.getItem('isDinein')
    ? JSON.parse(sessionStorage.getItem('isDinein'))
    : true;


  const [isDinein, setIsDinein] = useState(

    initialDineInState

  );
  sessionStorage.setItem('isDinein', JSON.stringify(isDinein));

  const handleToggle = () => {
    setIsDinein(!isDinein);
    sessionStorage.setItem('isDinein', JSON.stringify(isDinein));
    saveId(Math.random())
  };

  const [plan, setPlan] = useState(isDinein ? 'DineIn' : 'TakeOut');
  const handleSwitchChange = (event) => {
    setPlan(event.target.value);
    handleToggle()
    
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

  return (
    <div style={{ display: 'flex' }} className='max-w-[1000px] ml-auto'>
      <div className="notranslate switches-container" style={{ "marginBottom": "10px", "boxShadow": "0px 0px 4px rgba(0, 0, 0, 0.3)" }}
        onClick={() => {
          
          if (sessionStorage.getItem('table') === null || sessionStorage.getItem('table') === ""){
            alert(localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
              "您需要扫描餐桌上的二维码来选取堂食" : "You need to scan the qr code from the table to switch to dine in mode");
          }else{
            if(!directoryType){

            }else{
              alert(localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
              "自助服务不能转换成外卖。" 
              : "Self-service cannot be converted to takeout.");
            }
            
          }

        }
        
        }//您需要扫描餐桌上的二维码
      >
        <input
          type="radio"
          id="switchTakeOut"
          name="switchPlan"
          value="TakeOut"
          checked={plan === 'TakeOut'}
          onChange={handleSwitchChange}
          disabled={sessionStorage.getItem('table') === null || sessionStorage.getItem('table') === ""||directoryType}
          translate="no"
        />
        <input
          type="radio"
          id="switchDineIn"
          name="switchPlan"
          value="DineIn"
          checked={plan === 'DineIn'}
          onChange={handleSwitchChange}
          disabled={sessionStorage.getItem('table') === null || sessionStorage.getItem('table') === ""||directoryType}
          translate="no"
        />
        <label htmlFor="switchTakeOut" style={{ "fontSize": "14px" }}>{t("ToGo")}</label>
        <label htmlFor="switchDineIn" style={{ "fontSize": "143x" }}>{t("DineIn")}</label>
        <div className="switch-wrapper">
          <div className="switch">
            <div style={{ "fontSize": "14px" }}>{t("ToGo")}</div>
            <div style={{ "fontSize": "14px" }}>{t("DineIn")}</div>
          </div>
        </div>
      </div>
    </ div>
  )
}

export default Hero
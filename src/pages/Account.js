//import Navbar from './Navbar'
import 'bootstrap/dist/css/bootstrap.css';
import React, { useState, useEffect } from 'react';
import './group_list.css';
import CardSection from "../components/CardSection_acc";
import Checkout from "../components/Checkout_acc";
//import Checkout from "../components/Checkout";
import PayFullhistory from "../components/PayFullhistory";
import { Elements } from '@stripe/react-stripe-js';
import { useUserContext } from "../context/userContext";
import { useMyHook } from './myHook';

const Account = () => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const { promise, logoutUser } = useUserContext();

  const [activeTab, setActiveTab] = useState('');

  const handleTabClick = (e, tabHref) => {
    e.preventDefault();
    setActiveTab(tabHref);
  }
  
  const { user, user_loading} = useUserContext();

  useEffect(() => {
    setActiveTab(window.location.hash);
  }, []);
  function removeFromLocalStorage() {
    sessionStorage.removeItem('Food_arrays');
  }
  //google login button functions

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

  const isMobile = width <= 768;
  return (
    
    <div>
          {user_loading ?
        <div>
          Loading...
        </div>
        :
        <div className='max-w-[1000px] mx-auto p-4'>
          <div className="container">
           <div className="row gutters-sm flex justify-center items-center">

              <div className="col-md-9">
                <div className={isMobile ? "" : "card"}>
                  <div className="card-body tab-content">
                    {activeTab === '#profile' || activeTab === '' ? (

                      <div className="tab-pane active" id="profile">
                        <h6>{t("PROFILE")}</h6>
                        <hr />
                        <h6 className="flex items-center">
                          <i className="material-icons">{t("person")}</i>
                          {user ? user.displayName : ""}
                          <button style={{ "margin-left": "auto" }}
                            onClick={() => {
                              logoutUser();
                              removeFromLocalStorage();
                            }}
                            type="button"
                            className="btn btn-primary">
                            {t("sign out")}
                          </button>
                        </h6>
                        <div className="form-group">
                            <label htmlFor="bio">{(user) ? user.email : ""}</label>
                          </div>
                          <hr />
                          <h6>{t("Payment Method: ")}</h6>
                          <Checkout />
                          <h6>{t("Order History: ")}</h6>
                                <PayFullhistory />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default Account
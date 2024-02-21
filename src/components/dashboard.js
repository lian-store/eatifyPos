import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import Checkout from './Checkout';
import { loadStripe } from '@stripe/stripe-js';

const Dashboard = (props) => {

  const { totalPrice } = props;

  //pk_live_51MLJBWBuo6dxSribckKazcKBLmCf3gSXs6JHKLZbwPS19dscgaVb7bBH48ua3zj8m2xh3oUoByvojdBzcl9Voegu00HyKvJ54W
  //pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS
  const STRIPE_PUBLISHABLE_KEY = 'pk_live_51MLJBWBuo6dxSribckKazcKBLmCf3gSXs6JHKLZbwPS19dscgaVb7bBH48ua3zj8m2xh3oUoByvojdBzcl9Voegu00HyKvJ54W';

  const promise = loadStripe(STRIPE_PUBLISHABLE_KEY, {
    stripeAccount: JSON.parse(sessionStorage.getItem('TitleLogoNameContent'))?.stripe_store_acct
  });

  return (
    <div>
      <Elements stripe={promise}>
        <div className="card2 mb-50" style={{ "box-shadow": 'rgba(0, 0, 0, 0.02)-20px 1 20px -10px' }}>
          <div className="notranslate text-black select-none text-2xl">
            CHECKOUT ${Math.round(100 * totalPrice) / 100}
          </div>
          <Checkout totalPrice={totalPrice} />

        </div>
      </Elements>
    </div>
  );
};

export default Dashboard;
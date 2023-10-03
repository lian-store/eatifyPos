import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';

function StripeOnboardingButton(props) {

    const createLink = async () => {
        try {
            const myFunction = firebase.functions().httpsCallable('createStripeLink');
            const payload = {
                store: props.store,
                userID:props.user
            };
            const result = await myFunction(payload);
            console.log(result.data.url)
            console.log(result.data.accountId)
            //setLink(result.data.url);
            //setAccountId(result.data.accountId);
        } catch (error) {
            console.error("Error creating Stripe link:", error);
        }
    };

    return (
        <div>
            <button onClick={createLink}>Connect with Stripe</button>
        </div>
    );
}

export default StripeOnboardingButton;

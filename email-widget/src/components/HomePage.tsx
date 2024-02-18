import React, { useRef } from 'react';
import { Accounts, AccountsObject } from './Accounts';
import { Tutorial } from './Tutorial';

import { AuthenticationServiceInstance } from '../AuthenticationService';
import { Account, AccountDatabase } from '../TokenDatabaseService';


export const HomePage = () => {

    const childRef = useRef<AccountsObject>();

    async function checkForCodeFragment(): Promise<void> {
        const token = await AuthenticationServiceInstance.tryProcessLogin();
        if (token !== null) {

            console.log('adding account');

            const accountDatabase = new AccountDatabase(window.indexedDB);

            const existingAccounts = await accountDatabase.getAccounts();
            let alreadyExists = false;
            for (const existingAccount of existingAccounts) {
                if (existingAccount.name === token.name) {

                    await accountDatabase.updateAccount({
                        ...existingAccount,
                        id_token: token.id_token ?? null,
                        access_token: token.access_token,
                        refresh_token: token.refresh_token ?? null,
                        scope: token.scope ?? null
                    });

                    alreadyExists = true;
                    childRef.current?.load();
                    break;
                }
            }
            if (!alreadyExists) {
                await accountDatabase.addAccount({
                    name: token.name,
                    id_token: token.id_token ?? null,
                    access_token: token.access_token,
                    refresh_token: token.refresh_token ?? null,
                    scope: token.scope ?? null
                });
                childRef.current?.load();

                const registration = await navigator.serviceWorker.ready;
                try {
                    registration.active?.postMessage("sync");
                }
                catch (err) {
                    console.error(err);
                }
            }
        }
    }

    checkForCodeFragment();

    return (
        <React.Fragment>
            <div className="left">
                <Tutorial></Tutorial>
            </div>
            <div className="right">
                <Accounts ref={childRef}></Accounts>
            </div>
        </React.Fragment>
    );
}
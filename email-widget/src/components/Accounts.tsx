import React, { useEffect, useState, forwardRef, useImperativeHandle, Ref } from 'react';
import { AuthenticationServiceInstance } from '../AuthenticationService';
import { Account, AccountDatabase } from '../TokenDatabaseService';
import Button from 'react-bootstrap/Button';
import './Accounts.css';

interface IAccountsProps {

}

export interface AccountsObject {
    load(): Promise<void>
}

export const Accounts = forwardRef((props: IAccountsProps, ref: Ref<AccountsObject | undefined | null>) => {

    const [accounts, setAccounts] = useState<Account[]>([]);

    useImperativeHandle(ref, () => ({
        async load() {
            const accountDatabase = new AccountDatabase(window.indexedDB);
            const accounts = await accountDatabase.getAccounts();
            setAccounts(accounts);
        }
    }));

    const l = useEffect(() => {

        async function load() {
            const accountDatabase = new AccountDatabase(window.indexedDB);
            const accounts = await accountDatabase.getAccounts();
            setAccounts(accounts);
        }

        load();

    }, []);


    async function startLogin() {
        await AuthenticationServiceInstance.startLogin();
    }

    async function removeAccount(account: Account) {
        const accountDatabase = new AccountDatabase(window.indexedDB);
        await accountDatabase.removeAccount(account);

        const accounts = await accountDatabase.getAccounts();
        setAccounts(accounts);

        const registration = await navigator.serviceWorker.ready;
        try {
            registration.active?.postMessage("sync");
        }
        catch (err) {
            console.error(err);
        }
    }
    
    return (
        <>
            <h1>Accounts</h1>

            {accounts.map(a => (
                <AccountContent key={a.id} account={a}
                    onremove={removeAccount}></AccountContent>
            ))}

            <Button variant="secondary" onClick={startLogin}>Add new Office 365 account</Button>
        </>
    );
});


interface IAccountContentProps {
    account: Account;
    onremove?: undefined | ((a: Account) => void) | ((a: Account) => Promise<void>);
}

const AccountContent: React.FunctionComponent<IAccountContentProps> = (props: IAccountContentProps) => {

    function handleLogout() {
        if (props.onremove)
            props.onremove(props.account);
    }

    return (
        <div className="card">
            <h3 className="card-title">{props.account.name}</h3>
            <Button variant="secondary" onClick={() => handleLogout()}>Sign out</Button>
        </div>
    );
};



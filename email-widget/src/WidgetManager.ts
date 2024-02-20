import { Account, AccountDatabase } from './TokenDatabaseService';
import { AuthenticationServiceInstance } from './AuthenticationService';

export class WidgetManager {
    public static async updateAccountAsync(): Promise<void> {
        console.log('updateAccountAsync');

        // Retrieve Email Widget
        const widget = await self.widgets.getByTag('emailwidget');
        if (!widget) {
            console.log('widget not found')
            return;
        }

        const accountDatabase = new AccountDatabase(self.indexedDB);
        const accounts = await accountDatabase.getAccounts();

        const allItems: IMailMessage[] = [];

        for (const account of accounts) {

            // Update Account Info
            const updatedToken = await AuthenticationServiceInstance.refreshTokenAsync({
                name: account.name,
                id_token: account.id_token,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                scope: account.scope
            });
            if (updatedToken !== null) {
                account.access_token = updatedToken.access_token;
                account.id_token = updatedToken.id_token;
                account.refresh_token = updatedToken.refresh_token;
                account.scope = updatedToken.scope;
                await accountDatabase.updateAccount(account);
            }

            const response = await fetch(`https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages?$select=subject,bodyPreview,importance,isRead,from,receivedDateTime&$top=5`, {
                headers: {
                    'Authorization': `bearer ${account.access_token}`,
                    'Accept': 'application/json'
                },
                method: 'GET'
            });

            const data = await response.json();
            for (const x of data.value) {
                allItems.push(x);
            }
        }

        allItems.sort(function (a, b) {
            return new Date(a.receivedDateTime).getTime() - new Date(b.receivedDateTime).getTime()
        });

        const template = await (await fetch(widget.definition.msAcTemplate)).text();
        const data = await (await fetch(widget.definition.data)).json();

        let count = 0;


        for (const a of allItems) {

            data.Items[count].ReceivedDateTime = a.receivedDateTime;
            data.Items[count].IsRead = a.isRead;
            data.Items[count].Importance = a.importance;
            data.Items[count].From = a.from?.emailAdress?.name ?? a.from?.emailAdress?.address ?? "";
            data.Items[count].Subject = a.subject ?? '';
            data.Items[count].BodyPreview = a.bodyPreview ?? '';

            count++;
            if (count > 4)
                break;
        }

        await self.widgets.updateByTag(widget.definition.tag, { template, data: JSON.stringify(data) });
    }
}




interface IMailMessage {
    bodyPreview: string | null;
    subject: string | null;
    importance: string | null;
    isRead: boolean;
    receivedDateTime: string;
    from: Account | null;
}

interface Account {
    emailAdress: User | null;
}

interface User {
    name: string | null;
    address: string | null;
}

            
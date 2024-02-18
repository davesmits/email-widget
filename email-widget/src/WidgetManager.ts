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

        const allItems: ICalendarResponse[] = [];

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

            const startDate = new Date(Date.now());
            const endDate = new Date(Date.now());
            endDate.setTime(endDate.getTime() + (5 * 24 * 60 * 60 * 1000));

            const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendarview?startdatetime=${startDate.toLocaleString('en-US', { timeZone: 'UTC' })}&enddatetime=${endDate.toLocaleString('en-US', { timeZone: 'UTC' })}&$select=subject,bodyPreview,organizer,start,end,location,isAllDay,onlineMeeting&$top=20`, {
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
            return Date.parse(a.start.dateTime) - Date.parse(b.start.dateTime);
        });

        const template = await (await fetch(widget.definition.msAcTemplate)).text();
        const data = await (await fetch(widget.definition.data)).json();

        let count = 0;

        let lastHeader = '';

        for (const a of allItems) {

            const start = new Date(`${a.start.dateTime}Z`);
            const startTimeString = a.isAllDay ? 'All day' : `${start.getHours().toLocaleString('en-Us', {
                minimumIntegerDigits: 2,
                useGrouping: false
            })}:${start.getMinutes().toLocaleString('en-Us', {
                minimumIntegerDigits: 2,
                useGrouping: false
            })}`;

            const duration = new Date(new Date(`${a.end.dateTime}Z`).getTime() - start.getTime());
            const durationText = a.isAllDay ? '' : duration.getUTCHours() > 0 ? `${duration.getUTCHours().toLocaleString('en-Us', {
                minimumIntegerDigits: 2,
                useGrouping: false
            })}h ${duration.getUTCMinutes().toLocaleString('en-Us', {
                minimumIntegerDigits: 2,
                useGrouping: false
            })}m` : `${duration.getUTCMinutes().toLocaleString('en-Us', {
                minimumIntegerDigits: 2,
                useGrouping: false
            })}m`;

            const header = isToday(start) ? 'Today' :
                isTomorrow(start) ? 'Tomorrow' : start.toLocaleDateString();

            data.Items[count].Time = startTimeString;
            data.Items[count].Duration = durationText;
            data.Items[count].AgendaTypeIcon = a.onlineMeeting === null ? 'https://zealous-coast-000168303.4.azurestaticapps.net/CircleGreen.png' : 'https://zealous-coast-000168303.4.azurestaticapps.net/CirclePurple_teams.png';
            data.Items[count].Subject = a.subject;
            data.Items[count].Location = a?.location?.displayName ?? null;

            if (lastHeader !== header) {
                lastHeader = header;
                data.Items[count].Header = header;
            }

            count++;
            if (count > 4)
                break;
        }

        await self.widgets.updateByTag(widget.definition.tag, { template, data: JSON.stringify(data) });
    }
}

function isToday(date: Date) {
    return sameDay(date, new Date(Date.now()));
}

function isTomorrow(date: Date) {
    const tomorrow = new Date(Date.now() + (1000 * 60 * 60 * 24));
    return sameDay(date, tomorrow);
}

function sameDay(d1: Date, d2: Date) : boolean {
    return d1.getUTCFullYear() == d2.getUTCFullYear() &&
        d1.getUTCMonth() == d2.getUTCMonth() &&
        d1.getUTCDate() == d2.getUTCDate();
}


interface ICalendarResponse {
    bodyPreview: string | null;
    subject: string | null;
    start: OutlookDate;
    end: OutlookDate;
    location: ILocation | undefined;
    isAllDay: boolean | undefined;
    onlineMeeting: IOnlineMeeting | null;
}

interface OutlookDate {
    dateTime: string;
    timeZone: string;
}

interface ILocation {
    displayName: string | null;
}

interface IOnlineMeeting {
    joinUrl: string;
}
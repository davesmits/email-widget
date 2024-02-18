import { WidgetManager } from './WidgetManager';
import { Widget, Widgets } from './Widgets';

declare global {

    interface Window {
        skipWaiting(): Promise<undefined>
        widgets: Widgets
        clients: Clients;
        registration: ServiceWorkerRegistration;
    }

    interface Clients {
        claim(): Promise<undefined>;
    }

    interface Event {
        waitUntil(obj: object): Promise<undefined>
    }

    interface WidgetEvent extends Event {
        widget: Widget;
    }


}

self.addEventListener('widgetinstall', (event) => {
    const widgetEvent = event as WidgetEvent
    event.waitUntil(onWidgetInstall(widgetEvent.widget));
});

self.addEventListener('widgetuninstall', event => {
    const widgetEvent = event as WidgetEvent
    event.waitUntil(onWidgetUninstall(widgetEvent.widget));
});

self.addEventListener('widgetresume', event => {
    const widgetEvent = event as WidgetEvent
    event.waitUntil(WidgetManager.updateAccountAsync());
});

self.addEventListener('sync', event => {
    event.waitUntil(WidgetManager.updateAccountAsync());
});

self.addEventListener('periodicsync', (event) => {
    event.waitUntil(WidgetManager.updateAccountAsync());
});


self.addEventListener('message', (event) => {
    switch (event.data) {
        case 'sync':
            event.waitUntil(WidgetManager.updateAccountAsync());
            break;
    }

});


async function onWidgetInstall(widget: Widget) {
    const tags = await self.registration.periodicSync.getTags();
    if (!tags.includes(widget.definition.tag)) {
        await self.registration.periodicSync.register(widget.definition.tag, {
            minInterval: widget.definition.update
        });
    }
    await WidgetManager.updateAccountAsync();
}


async function onWidgetUninstall(widget: Widget) {
    if (widget.instances.length === 1 && 'update' in widget.definition) {
        await self.registration.periodicSync.unregister(widget.definition.tag);
    }
}

export interface WidgetInstance {
    id: string;
    host: unknown;
    updated: Date;
    payload: WidgetPayload;
}

export interface WidgetDefinitionScreenshot {
    src: string;
    sizes: string;
    label: string;
}

export interface WidgetDefinitionIcon {
    src: string;
    sizes: string;
}

export interface WidgetDefinition {
    name: string;
    description: string;
    tag: string;
    template: string;
    msAcTemplate: string;
    data: string;
    type: string;
    auth: boolean;
    update: number;
    screenshots: WidgetDefinitionScreenshot[];
    icons: WidgetDefinitionIcon[];
}

export interface WidgetOptions {
    installable: boolean;
    installed: boolean;
    tag: string;
    instanceId: string;
    hostId: string;
}

export interface WidgetPayload {
    template: string;
    data: string;
}

export interface Widget {
    installable: boolean;
    definition: WidgetDefinition;
    instances: WidgetInstance[];

}

export interface Widgets {
    getByTag(tag: string): Promise<Widget>
    getByInstanceId(id: string): Promise<Widget>
    getByHostId(id: string): Promise<Widget>
    matchAll(options: WidgetOptions): Promise<Widget[]>
    updateByInstanceId(id: string, payload: WidgetPayload): Promise<undefined>
    updateByTag(tag: string, payload: WidgetPayload): Promise<undefined>
}
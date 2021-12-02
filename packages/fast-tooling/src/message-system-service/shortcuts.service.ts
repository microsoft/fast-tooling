import { CustomMessage, MessageSystemType } from "../message-system";
import {
    ShortcutsAction,
    ShortcutsActionCallbackConfig,
} from "./shortcuts.service-action";
import {
    MessageSystemService,
    MessageSystemServiceConfig,
} from "./message-system.service";

export type shortcutsMessageSystemAction = "initialize";
export type shortcutsMessageSystemListenerType = "keypress";
export type shortcutsMessageId = "fast-tooling::shortcuts-service";

/**
 * @alpha
 */
export const shortcutsId: shortcutsMessageId = "fast-tooling::shortcuts-service";

/**
 * @alpha
 */
export interface ShortcutOptions {
    originatorId: shortcutsMessageId;
}

/**
 * @alpha
 */
export interface ShortcutMessageOutgoing extends CustomMessage<{}, ShortcutOptions> {
    /**
     * The custom message id
     */
    id: shortcutsMessageId;

    /**
     * The action string
     */
    action: shortcutsMessageSystemAction;

    /**
     * The callback config returned when a shortcut is called
     */
    shortcuts: ShortcutsActionCallbackConfig[];
}

/**
 * @alpha
 */
export interface ShortcutsConfig {
    /**
     * The HTML element to target for the event listener
     */
    target: HTMLElement;

    /**
     * The shortcut event listener used to attach to a DOM node
     */
    eventListener: (e: KeyboardEvent) => void;

    /**
     * The event listener type used to define the listener type when
     * attaching the event listener to a DOM node
     */
    eventListenerType: shortcutsMessageSystemListenerType;
}

/**
 * @alpha
 */
export interface ShortcutsRegisterConfig {
    id: shortcutsMessageId;
    config: ShortcutsConfig;
}

/**
 * @alpha
 */
export interface ShortcutsMessageSystemServiceConfig
    extends MessageSystemServiceConfig<ShortcutsActionCallbackConfig, ShortcutsConfig> {
    target: HTMLElement;
}

/**
 *
 * @alpha
 * @remarks
 * A MessageSystemService to register shortcuts.
 */
export class Shortcuts extends MessageSystemService<
    ShortcutsActionCallbackConfig,
    ShortcutsConfig
> {
    constructor(config: ShortcutsMessageSystemServiceConfig) {
        super();

        this.registerMessageSystem({
            ...config,
            id: shortcutsId,
            config: {
                target: config.target,
                eventListener: this.listener,
                eventListenerType: "keypress",
            },
        });

        config.target.addEventListener("keypress", this.listener);
    }

    /**
     * The listener to attach to HTML elements
     */
    private listener = (e: KeyboardEvent): void => {
        this.registeredActions.forEach((action: ShortcutsAction) => {
            if (action.matches(e)) {
                action.invoke();
            }
        });
    };

    /**
     * Handles messages from the message system
     */
    handleMessageSystem = (e: MessageEvent): void => {
        switch (e.data.type) {
            case MessageSystemType.initialize:
                this.messageSystem.postMessage({
                    type: MessageSystemType.custom,
                    action: "initialize",
                    id: shortcutsId,
                    shortcuts: this.registeredActions.map(
                        (shortcutAction: ShortcutsAction) => {
                            return {
                                name: shortcutAction.name,
                                keys: shortcutAction.keys,
                            };
                        }
                    ),
                    options: {
                        originatorId: "fast-tooling::shortcuts-service",
                    },
                } as ShortcutMessageOutgoing);
                break;
        }
    };

    getActionConfig = (id: string): ShortcutsActionCallbackConfig => {
        this.registeredActions.forEach((action: ShortcutsAction) => {
            if (action.id === id) {
                return {
                    name: action.name,
                    keys: action.keys,
                };
            }
        });

        return {
            error: `No such action found.`,
        };
    };
}

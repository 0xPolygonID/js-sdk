/**
 * Represents an event in the SDK.
 */
type SdkEvent = string;
export declare const SDK_EVENTS: {
    [k: SdkEvent]: SdkEvent;
};
/**
 * Represents a topic in the SDK message bus.
 */
export type SdkTopic = keyof typeof SDK_EVENTS;
/**
 * Represents a message bus that allows publishing and subscribing to topics.
 */
export declare class MessageBus {
    /**
     * The singleton instance of the MessageBus class.
     */
    private static instance;
    /**
     * Private constructor for the MessageBus class.
     */
    private constructor();
    /**
     * Returns the singleton instance of the MessageBus class.
     * If the instance doesn't exist, it creates a new one.
     * @returns The singleton instance of the MessageBus class.
     */
    static getInstance(): MessageBus;
    /**
     * Publishes a message to the specified topic.
     *
     * @template T - The type of data being published.
     * @param {SdkTopic} topic - The topic to publish the message to.
     * @param {T} data - The data to be published.
     * @returns {boolean} - Returns true if the message was successfully published, false otherwise.
     */
    publish<T>(topic: SdkTopic, data: T): boolean;
    /**
     * Subscribes to a specific topic and registers a callback function to be executed when a message is published.
     *
     * @param topic - The topic to subscribe to.
     * @param callback - The callback function to be executed when a message is published.
     */
    subscribe<T>(topic: SdkTopic, callback: (data: T) => void): string;
    /**
     * Subscribes to a specific topic and registers a callback function to be executed when a message is published.
     * The callback function is executed only once.
     *
     * @param topic - The topic to subscribe to.
     * @param callback - The callback function to be executed when a message is published.
     */
    subscribeOnce<T>(topic: SdkTopic, callback: (data: T) => void): void;
    /**
     * Unsubscribes from a specific topic in the message bus.
     *
     * @param topic - The topic to unsubscribe from.
     * @returns A string or boolean indicating the success of the unsubscribe operation.
     */
    unsubscribe(topic: SdkTopic): string | boolean;
}
export {};
//# sourceMappingURL=message-bus.d.ts.map
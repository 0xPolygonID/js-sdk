import PubSub from 'pubsub-js';

/**
 * Represents an event in the SDK.
 */
type SdkEvent = string;

export const SDK_EVENTS: { [k: SdkEvent]: SdkEvent } = {
  TX_RECEIPT_ACCEPTED: 'TX_RECEIPT_ACCEPTED'
};

/**
 * Represents a topic in the SDK message bus.
 */
export type SdkTopic = keyof typeof SDK_EVENTS;

/**
 * Represents a message bus that allows publishing and subscribing to topics.
 */
export class MessageBus {
  /**
   * The singleton instance of the MessageBus class.
   */
  private static instance: MessageBus;

  /**
   * Private constructor for the MessageBus class.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Returns the singleton instance of the MessageBus class.
   * If the instance doesn't exist, it creates a new one.
   * @returns The singleton instance of the MessageBus class.
   */
  public static getInstance(): MessageBus {
    // If the instance doesn't exist, create it
    if (!MessageBus.instance) {
      MessageBus.instance = new MessageBus();
    }
    // Return the instance
    return MessageBus.instance;
  }

  /**
   * Publishes a message to the specified topic.
   *
   * @template T - The type of data being published.
   * @param {SdkTopic} topic - The topic to publish the message to.
   * @param {T} data - The data to be published.
   * @returns {boolean} - Returns true if the message was successfully published, false otherwise.
   */
  public publish<T>(topic: SdkTopic, data: T): boolean {
    return PubSub.publish(topic.toString(), data);
  }

  /**
   * Subscribes to a specific topic and registers a callback function to be executed when a message is published.
   *
   * @param topic - The topic to subscribe to.
   * @param callback - The callback function to be executed when a message is published.
   */
  public subscribe<T>(topic: SdkTopic, callback: (data: T) => void): string {
    return PubSub.subscribe(topic.toString(), (_, data) => callback(data));
  }

  /**
   * Subscribes to a specific topic and registers a callback function to be executed when a message is published.
   *
   * @param topic - The topic to subscribe to.
   * @param callback - The callback function to be executed when a message is published.
   */
  public subscribeOnce<T>(topic: SdkTopic, callback: (data: T) => void): void {
    PubSub.subscribeOnce(topic.toString(), (_, data) => callback(data));
  }

  /**
   * Unsubscribes from a specific topic in the message bus.
   *
   * @param topic - The topic to unsubscribe from.
   * @returns A string or boolean indicating the success of the unsubscribe operation.
   */
  public unsubscribe(topic: SdkTopic): string | boolean {
    return PubSub.unsubscribe(topic.toString());
  }
}

import { Queue } from './queue';
import { Exchange } from './exchange';
import { Options } from 'amqplib';
import { TypedEventEmitter } from './events';

export const keyValuePairs = (obj: Object): string[] => {
    return Object.keys(obj).map(key => {
        return `${key}=${stringify((obj as any)[key])}`;
    });
};

export const stringify = (message: any): string => {
    if (typeof message === 'string' || typeof message === 'number') {
        return message.toString();
    }

    if (message === undefined || message === null) {
        return '';
    }

    return JSON.stringify(message);
};

export type UnpackQueueArgument<T> = T extends Queue<infer U> ? U : any;
export type UnpackExchangeArgument<T> = T extends Exchange<infer U> ? U : any;
export type UnpackTypedEventEmitterArgument<T> = T extends TypedEventEmitter<infer U> ? U : any;

type notany = Object | string | number | undefined | null;

export type MergeTypes<T, U> = T extends notany ? U extends notany ? T | U : T : U;

export type Omit<T extends {}, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ExtendedPublishType = Omit<Options.Publish, 'headers'> & {
    headers: {
        [header: string]: any;
        'x-delay'?: number;
    };
}

export const eventToPromise = <T extends TypedEventEmitter<any>>(
    emitter: T,
    event: keyof UnpackTypedEventEmitterArgument<T>
): Promise<any> => {
    return new Promise(resolve => {
        emitter.once(event, (...args: any[]) => {
            resolve(args);
        });
    });
}

export const omit = <T extends {}, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
    return Object.keys(obj).reduce((acc: Partial<T>, key: any) => {
        if (keys.indexOf(key) === -1) {
            return Object.assign(acc, {
                [key]: (obj as any)[key]
            } as Partial<T>);
        }
        return acc;
    }, {}) as any;
}

class TimeoutError extends Error { };

export const timeoutPromise = (timeout: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(reject, timeout, new TimeoutError())
    });
}

export const delayPromise = (timeout: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
};

export const promiseMap = async <T, U>(
    items: T[],
    callback: (item?: T, index?: number, array?: T[]) => Promise<U>
): Promise<U[]> => {
    return Promise.all(items.map(item => callback(item)));
};


const arr = [1, 2, 3];

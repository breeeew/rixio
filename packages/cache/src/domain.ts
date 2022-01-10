import { Observable } from "rxjs"
import { Fulfilled, Pending, Wrapped, SimpleRejected } from "@rixio/wrapped"
import { Atom } from "@rixio/atom"

const cache = "___cache___"
const symbol = Symbol.for(cache)

type HasFlag = { [cache]: typeof symbol }

export type Idle = {
	status: "idle"
}

export const idleCache: CacheState<any> = { status: "idle", [cache]: symbol }
export const pendingCache: CacheState<any> = { status: "pending", [cache]: symbol }
export function createRejectedCache(error: any): CacheState<any> {
	return { status: "rejected", error, [cache]: symbol }
}
export function createFulfilledCache<T>(value: T): CacheState<T> {
	return { status: "fulfilled", value, [cache]: symbol }
}

export type AtomStateStatus = Idle | Pending | SimpleRejected | { status: "fulfilled" }
export type CacheState<T> = (Idle | Pending | SimpleRejected | Fulfilled<T>) & HasFlag

export interface Cache<T> extends Observable<Wrapped<T>> {
	get(force?: boolean): Promise<T>
	set(value: T): void
	modifyIfFulfilled(updateFn: (currentValue: T) => T): void
	clear(): void
	atom: Atom<CacheState<T>>
	valueAtom: Atom<T>
}

export type KeyEventType = "add" | "remove"
export interface KeyEvent<K> {
	type: KeyEventType
	key: K
}

export function createAddEvent<T>(key: T) {
	return {
		key,
		type: "add" as const,
	}
}

export const UNDEFINED = Symbol.for("UNDEFINED")
export function isNotFound(value: unknown): value is typeof UNDEFINED {
	return value === UNDEFINED
}

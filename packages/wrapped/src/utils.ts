import { Observable, of } from "rxjs"
import {
	createFulfilledWrapped,
	createRejectedWrapped,
	isWrapped,
	pendingWrapped,
	Wrapped,
	WrappedObservable,
	ObservableLike,
} from "./domain"

const wrapped = "___wrapped___"
const symbol = Symbol.for(wrapped)

export function toObservable<T>(like: ObservableLike<T>): Observable<Wrapped<T>> {
	if (like instanceof Observable) {
		return wrap(like)
	} else {
		return of(toWrapped(like))
	}
}

export function wrap<T>(observable: WrappedObservable<T>): Observable<Wrapped<T>> {
	if (isWrappedObservable(observable)) {
		return observable
	}
	const result = new Observable<Wrapped<T>>(s => {
		let got = false
		const subscription = observable.subscribe(
			value => {
				got = true
				s.next(toWrapped(value))
			},
			error => {
				got = true
				s.next(createRejectedWrapped(error))
			},
			() => {
				got = true
				s.complete()
			}
		)
		if (!got) {
			s.next(pendingWrapped)
		}
		s.add(subscription)
	})
	return markWrappedObservable(result)
}

export function toWrapped<T>(value: T | Wrapped<T>): Wrapped<T> {
	if (isWrapped(value)) {
		return value
	}
	return createFulfilledWrapped(value)
}

export function toPlainOrThrow<T>(value: Wrapped<T>): T {
	if (value.status === "fulfilled") {
		return value.value
	}
	throw new Error("not fulfilled")
}

function isWrappedObservable(observable: Observable<unknown>): observable is Observable<Wrapped<any>> {
	return (observable as any)[wrapped] === symbol
}

export function markWrappedObservable<T>(observable: Observable<Wrapped<T>>): Observable<Wrapped<T>> {
	;(observable as any)[wrapped] = symbol
	return observable
}

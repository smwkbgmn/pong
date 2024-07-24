export function addEvent($target, eventType, selector, handler) {	
	const wrappedHandler = (event) => {
		if (!event.target.closest(selector))
			return false;
		handler(event);
	}

	$target.addEventListener(eventType, wrappedHandler);
	return wrappedHandler;
}

export function removeEvent($target, eventType, handler) {
	$target.removeEventListener(eventType, handler);
}

export function addHashChangeEvent(handler) {
	window.addEventListener('hashchange', handler)
	return handler;
}

export function removeHashChangeEvent(handler) {
	window.removeEventListener('hashchange', handler)
}
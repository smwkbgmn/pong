import Component from './Component.js'

export default class Router extends Component {
	setUp() {
		this.$state = {
			routes: [],
		};
	}

	addRoute(fragment, component) {
		this.$state.routes.push({ fragment, component });
	}

	// checkRoutes = () => {
	// 	const currentRoute = this.$state.routes.find((route) => {
	// 		return route.fragment === window.location.hash;
	// 	});

	// 	console.log(window.location.hash);

	// 	if (!currentRoute) {
	// 		window.location.href = './#';
	// 		this.$state.routes[0].component();
	// 	}

	// 	console.log(currentRoute);

	// 	currentRoute.component();
	// }

	checkRoutes = () => {
        const currentRoute = this.$state.routes.find((route) => {
            return route.fragment === window.location.hash;
        });

        if (!currentRoute) {
            window.location.href = './#';
            this.$state.routes[0].component();
        } else {
            currentRoute.component();
        }

        // Emit a custom event with the current route
        const event = new CustomEvent('spaNavigate', { 
            detail: { section: currentRoute.fragment.slice(1) } 
        });
        document.dispatchEvent(event);
    }
	
	start() {
		window.addEventListener('hashchange', () => this.checkRoutes());

		console.log('hashchange');
		
		if (!window.location.hash) {
			window.location.hash = '#/';
		}
		
		this.checkRoutes();
	}
}
import App from './App.svelte'

const app = new App({
	target: document.body,
	props: {
		anotherProp: 'I am from a prop set in main.js'
	}
})

export default app
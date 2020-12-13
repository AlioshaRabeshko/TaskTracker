import { createContext, useReducer, useContext } from 'react';

const initialState = { hello: '' };

const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
	const [state, dispatch] = useReducer((state, { type, payload }) => {
		switch (type) {
			case 'hello':
				return {
					...state,
					hello: payload,
				};
			default:
				throw new Error();
		}
	}, initialState);

	return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

const useStore = () => useContext(store);

export { store, StateProvider, useStore };

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import App from './App';
import rootReducer from '../redux/reducers';

describe('App', () => {
  it('renders login form when not authenticated', () => {
    const store = createStore(rootReducer, applyMiddleware(thunk));
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByPlaceholderText('nom')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('mot de passe')).toBeInTheDocument();
  });
});

import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { AppRouter } from "@/app/AppRouter";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { LoadingScreen } from "@/components/molecules/LoadingScreen";
import { persistor, store } from "@/redux";

export function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

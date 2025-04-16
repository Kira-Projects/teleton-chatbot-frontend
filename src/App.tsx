import { Provider } from "react-redux"
import store from "./store/store"
import { BrowserRouter, Route } from "react-router-dom"
import RoutesWithNotFound from "./components/RoutesWithNotFound"
import Home from "./pages/public/Home.tsx";

const App = () => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <RoutesWithNotFound>
                    <Route path="/" element={<Home />} />
                </RoutesWithNotFound>
            </BrowserRouter>
        </Provider>
    )
}

export default App

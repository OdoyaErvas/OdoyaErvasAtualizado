import { HashRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./store/useStore";
import { AuthProvider } from "./store/useAuth";
import { InteractionsProvider } from "./store/useInteractions";
import { FinanceProvider } from "./store/useFinance";
import { CartProvider } from "./store/useCart";
import { SettingsProvider } from "./store/useSettings";
import { ShippingProvider } from "./store/useShipping";
import { WholesaleProvider } from "./store/useWholesale";
import { ReviewsProvider } from "./store/useReviews";
import { OffersProvider } from "./store/useOffers";
import { SiteThemeProvider } from "./store/useSiteTheme";
import { AdminThemeProvider } from "./store/useAdminTheme";
import { ActivityProvider } from "./store/useActivityLog";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Sobre from "./pages/Sobre";
import Produtos from "./pages/Produtos";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";
import Galeria from "./pages/Galeria";
import Contato from "./pages/Contato";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Conta from "./pages/Conta";
import Admin from "./pages/Admin";
import Rastreio from "./pages/Rastreio";
import FormasPagamento from "./pages/FormasPagamento";
import Atacado from "./pages/Atacado";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/admin/Toast";

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AdminThemeProvider>
          <SiteThemeProvider>
            <ActivityProvider>
              <SettingsProvider>
                <StoreProvider>
                  <AuthProvider>
                    <InteractionsProvider>
                      <FinanceProvider>
                        <ShippingProvider>
                          <WholesaleProvider>
                          <ReviewsProvider>
                          <OffersProvider>
                          <CartProvider>
                            <HashRouter>
                              <Routes>
                                <Route element={<Layout />}>
                                  <Route path="/" element={<Home />} />
                                  <Route path="/sobre" element={<Sobre />} />
                                  <Route path="/produtos" element={<Produtos />} />
                                  <Route path="/produtos/:slug" element={<ProdutoDetalhe />} />
                                  <Route path="/galeria" element={<Galeria />} />
                                  <Route path="/contato" element={<Contato />} />
                                  <Route path="/conta" element={<Conta />} />
                                  <Route path="/rastreio" element={<Rastreio />} />
                                  <Route path="/pagamento" element={<FormasPagamento />} />
                                  <Route path="/atacado" element={<Atacado />} />
                                </Route>
                                <Route path="/login" element={<Login />} />
                                <Route path="/registro" element={<Registro />} />
                                <Route path="/admin" element={<Admin />} />
                              </Routes>
                            </HashRouter>
                          </CartProvider>
                          </OffersProvider>
                          </ReviewsProvider>
                          </WholesaleProvider>
                        </ShippingProvider>
                      </FinanceProvider>
                    </InteractionsProvider>
                  </AuthProvider>
                </StoreProvider>
              </SettingsProvider>
            </ActivityProvider>
          </SiteThemeProvider>
        </AdminThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

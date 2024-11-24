import { Route, Routes } from "react-router-dom";
import "./app.css";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Layout from "./pages/layout";
import MessagePage from "./pages/MessagePage";
import ProtectedRoute from "./router/ProtectedRoute";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/chats" element={<Layout />}>
          <Route path="/chats/groups/:id?" element={<MessagePage />} />
          <Route path="/chats/personal/:id?" element={<MessagePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound/>} />
    </Routes>
  );
}

export default App;

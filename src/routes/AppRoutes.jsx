import { Navigate, Route, Routes } from "react-router-dom";

import PublicOnly from "./PublicOnly";
import RequireAuth from "./RequireAuth";
import ConversationLayout from "./ConversationLayout";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import UsersPage from "../pages/UsersPage";
import NewGroupPage from "../pages/NewGroupPage";
import TagsPage from "../pages/TagsPage";
import ChatPage from "../pages/ChatPage";
import MembersPage from "../pages/MembersPage";
import AddMembersPage from "../pages/AddMembersPage";
import ChatTagsPage from "../pages/ChatTagsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/groups/new" element={<NewGroupPage />} />
        <Route path="/tags" element={<TagsPage />} />

        <Route path="/chats/:conversationId" element={<ConversationLayout />}>
          <Route index element={<ChatPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="members/add" element={<AddMembersPage />} />
          <Route path="tags" element={<ChatTagsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

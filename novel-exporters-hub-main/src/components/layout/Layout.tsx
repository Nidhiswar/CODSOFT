import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ChatBot from "../ChatBot";

interface LayoutProps {
  children: ReactNode;
  user?: { email: string; isAdmin: boolean } | null;
  onLogout?: () => void;
}

const Layout = ({ children, user, onLogout }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Layout;

import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import './home.css'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IES CRM" },
    { name: "description", content: "IES CRM Home Page" },
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  // clientLoader выполняется только на клиенте, но добавляем проверку для безопасности
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw redirect('/login');
    }
  } else {
    throw redirect('/login');
  }
  return null;
}

export default function Home() {
  return (
    <div className="home">
      <div className="header">
        <h1>IES CRM - Список товаров</h1>
        <div className="header-actions">
          <button className="management-btn">Управление товарами</button>
          <button className="logout-btn">Выйти</button>
        </div>
      </div>
    </div>
  );
}

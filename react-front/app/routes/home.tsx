import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
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
  return <Welcome />;
}

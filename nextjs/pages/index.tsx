import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from '../types/user';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('http://localhost/api/user', {
          credentials: 'include',
        });
        if (res.ok) {
          const data: User = await res.json();
          setUser(data);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    }
    fetchUser();
  }, [router]);

  const logout = async () => {
    await fetch('http://localhost/sanctum/csrf-cookie', {
      credentials: 'include',
    });

    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };
    const xsrfToken = getCookie('XSRF-TOKEN');

    await fetch('http://localhost/api/logout', {
      method: 'POST',
      headers: {
        'X-XSRF-TOKEN': xsrfToken ?? '',
      },
      credentials: 'include',
    });

    router.push('/login');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

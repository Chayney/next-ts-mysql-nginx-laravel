import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';

type LoginForm = {
    email: string;
    password: string;
};

export default function Login() {
    const router = useRouter();
    const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch('http://localhost/api/user', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (res.status === 401) {
                console.log('ログアウト状態');
            }
        };

        checkAuth();
    }, []);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await fetch('http://localhost/sanctum/csrf-cookie', {
                credentials: 'include',
            });

            const getCookie = (name: string) => {
                const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
                return match ? decodeURIComponent(match[2]) : null;
            };

            const xsrfToken = getCookie('XSRF-TOKEN');

            const res = await fetch('http://localhost/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken ?? '',
                },
                credentials: 'include',
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'Login failed');
                return;
            }

            router.push('/');
        } catch {
            setError('Unexpected error occurred');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={onSubmit}>
                <input style={{ border: '1px solid #000' }} name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
                <input style={{ border: '1px solid #000', marginLeft: '10px' }} name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

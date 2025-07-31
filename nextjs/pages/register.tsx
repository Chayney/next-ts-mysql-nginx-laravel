import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { RegisterForm } from '../types/form';

export default function Register() {
    const router = useRouter();
    const [form, setForm] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = useState<string | null>(null);

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

            const res = await fetch('http://localhost/api/register', {
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
                setError(data.message || 'Registration failed');
                return;
            }

            router.push('/login');
        } catch {
            setError('Unexpected error occurred');
        }
    };

    return (
        <div>
            <h1>Register</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={onSubmit}>
                <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
                <input
                    name="password_confirmation"
                    type="password"
                    placeholder="Confirm Password"
                    value={form.password_confirmation}
                    onChange={onChange}
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
